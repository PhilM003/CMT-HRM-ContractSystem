// index.js (SQLite Version)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 4000;
const FRONTEND_URL = 'http://localhost:5173'; // เช็ค Port ให้ตรงกับ Vite ของคุณ

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- Database Setup (SQLite) ---
const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('❌ Could not connect to database', err);
    else console.log('✅ Connected to SQLite database');
});

// สร้างตารางถ้ายังไม่มี (เก็บข้อมูลเป็น JSON ในช่อง 'data')
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS contracts (
        id TEXT PRIMARY KEY,
        created_at TEXT,
        data TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        empId TEXT PRIMARY KEY,
        data TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT
    )`);
    // init settings row
    db.run(`INSERT OR IGNORE INTO settings (id, data) VALUES (1, '{}')`);
});

// --- Helper: Promisify DB Queries (เพื่อให้ใช้ async/await ได้ง่าย) ---
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) { err ? reject(err) : resolve(this); });
});

// --- Email Config ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, htmlContent) => {
    if (!to || to.trim() === '') return;
    try {
        await transporter.sendMail({
            from: '"HR Contract System" <no-reply@contractsystem.com>',
            to: to, subject: subject, html: htmlContent
        });
        console.log(`✅ Email sent to ${to}`);
    } catch (error) { console.error('❌ Email error:', error); }
};

// --- API Endpoints ---

// 1. Contracts
app.get('/api/contracts', async (req, res) => {
    try {
        const rows = await dbAll("SELECT data FROM contracts ORDER BY created_at DESC");
        // แปลง String JSON กลับเป็น Object
        const contracts = rows.map(r => JSON.parse(r.data));
        res.json(contracts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/contracts/:id', async (req, res) => {
    try {
        const row = await dbGet("SELECT data FROM contracts WHERE id = ?", [req.params.id]);
        if (!row) return res.status(404).json({ message: 'Not found' });
        res.json(JSON.parse(row.data));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/contracts', async (req, res) => {
    try {
        const newContract = { 
            id: Date.now().toString(), 
            ...req.body, 
            created_at: new Date().toISOString() 
        };
        // บันทึกลง SQLite
        await dbRun("INSERT INTO contracts (id, created_at, data) VALUES (?, ?, ?)", 
            [newContract.id, newContract.created_at, JSON.stringify(newContract)]);

        // Email Logic
        const link = `${FRONTEND_URL}/?docId=${newContract.id}&step=1`;
        if (newContract.signer4_email) {
            sendEmail(newContract.signer4_email, `แจ้งเตือน: เอกสารรอลงนาม (Step 1) - ${newContract.company_name}`, 
                `... (ใช้ HTML เดิมของคุณตรงนี้ได้เลย) ... <a href="${link}">คลิกที่นี่</a>`
            );
        }
        res.status(201).json(newContract);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/contracts/:id', async (req, res) => {
    try {
        // 1. ดึงข้อมูลเก่ามาก่อน
        const row = await dbGet("SELECT data FROM contracts WHERE id = ?", [req.params.id]);
        if (!row) return res.status(404).json({ message: 'Not found' });
        
        const oldContract = JSON.parse(row.data);
        const oldStep = oldContract.current_step;
        
        // 2. รวมร่างข้อมูลใหม่
        const updatedContract = { ...oldContract, ...req.body };
        
        // 3. อัปเดตกลับลง DB
        await dbRun("UPDATE contracts SET data = ? WHERE id = ?", [JSON.stringify(updatedContract), req.params.id]);

        // Email Logic (เมื่อ Step เปลี่ยน)
        if (updatedContract.current_step > oldStep && updatedContract.status !== 'Complete') {
            let nextEmail = '', nextName = '', role = '';
            const step = updatedContract.current_step;
            if (step === 2) { nextEmail = updatedContract.signer3_email; nextName = updatedContract.signer3_name; role = "พยานคนที่ 1"; }
            else if (step === 3) { nextEmail = updatedContract.signer1_email; nextName = updatedContract.signer1_name; role = "ผู้บริหาร"; }
            else if (step === 4) { nextEmail = updatedContract.signer2_email; nextName = updatedContract.signer2_name; role = "พนักงาน"; }

            if (nextEmail) {
                const link = `${FRONTEND_URL}/?docId=${updatedContract.id}&step=${step}`;
                sendEmail(nextEmail, `ถึงคิวคุณลงนาม (Step ${step}) - ${updatedContract.company_name}`, 
                    `<div style="font-family: 'Sarabun', sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #f9f9f9; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #323B55; margin-bottom: 20px;">เรียนคุณ ${nextName}</h2>
                        <p style="font-size: 16px; color: #555;">เอกสารได้รับการลงนามจากลำดับก่อนหน้าเรียบร้อยแล้ว</p>
                        <p style="font-size: 16px; color: #555;">ขณะนี้ถึงคิวของคุณในการลงนามในฐานะ: <b style="color: #d97706;">${role}</b></p>
                        <br>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${link}" style="background-color: #323B55; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">✍️ เปิดเอกสารเพื่อลงนาม</a>
                        </div>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999; text-align: center;">
                            หากปุ่มด้านบนไม่ทำงาน ให้คัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์:<br>
                            <a href="${link}" style="color: #323B55;">${link}</a>
                        </p>
                     </div>`
                );
            }
        }
        res.json(updatedContract);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/contracts/:id', async (req, res) => {
    try {
        await dbRun("DELETE FROM contracts WHERE id = ?", [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. Employees
app.get('/api/employees', async (req, res) => {
    try {
        const rows = await dbAll("SELECT data FROM employees");
        res.json(rows.map(r => JSON.parse(r.data)));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/employees', async (req, res) => {
    try {
        const newEmp = req.body;
        // ใช้ INSERT OR REPLACE เพื่อจัดการทั้งการเพิ่มใหม่และแก้ไขในคำสั่งเดียว
        await dbRun("INSERT OR REPLACE INTO employees (empId, data) VALUES (?, ?)", 
            [newEmp.empId, JSON.stringify(newEmp)]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/employees/:id', async (req, res) => {
    try {
        await dbRun("DELETE FROM employees WHERE empId = ?", [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. Settings
app.get('/api/settings', async (req, res) => {
    try {
        const row = await dbGet("SELECT data FROM settings WHERE id = 1");
        res.json(row ? JSON.parse(row.data) : {});
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings', async (req, res) => {
    try {
        const row = await dbGet("SELECT data FROM settings WHERE id = 1");
        const oldSettings = row ? JSON.parse(row.data) : {};
        const newSettings = { ...oldSettings, ...req.body };
        
        await dbRun("UPDATE settings SET data = ? WHERE id = 1", [JSON.stringify(newSettings)]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. Google Sheet Fetch (เหมือนเดิม)
app.post('/api/fetch-sheet', async (req, res) => {
    const { sheetId, sheetName } = req.body;
    if (!sheetId) return res.status(400).json({ message: "Missing Sheet ID" });
    const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${sheetParam}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Sheet Error: ${response.statusText}`);
        const csvText = await response.text();
        res.send(csvText);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));