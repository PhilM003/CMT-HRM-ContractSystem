// index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 4000;
// *** เปลี่ยนตรงนี้ให้ตรงกับ Port ที่ Frontend ของคุณรันอยู่ (Vite ปกติคือ 5173) ***
const FRONTEND_URL = 'http://localhost:5500'; 

const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// 1. แก้ไขฟังก์ชัน readDb ให้มีค่า default ของ settings
const readDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    // เพิ่ม settings: {} เข้าไป
    const initialData = { contracts: [], employees: [], settings: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const data = fs.readFileSync(DB_FILE);
    const json = JSON.parse(data);
    if (!json.contracts) json.contracts = [];
    if (!json.employees) json.employees = [];
    // เพิ่มบรรทัดนี้: ถ้าไม่มี settings ให้สร้าง object ว่าง
    if (!json.settings) json.settings = {}; 
    return json;
  } catch (err) {
    console.error("Error reading DB:", err);
    return { contracts: [], employees: [], settings: {} };
  }
};

const writeDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Config อีเมล (ใช้ Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // อีเมลของคุณ (จะไปใส่ใน .env)
        pass: process.env.EMAIL_PASS  // รหัส App Password (ไม่ใช่รหัส Login ปกติ)
    }
});

const sendEmail = async (to, subject, htmlContent) => {
  if (!to || to.trim() === '') {
      console.log('Skipping email: No recipient address provided.');
      return;
  }
  try {
    await transporter.sendMail({
      from: '"HR Contract System" <no-reply@contractsystem.com>', // ชื่อผู้ส่งที่โชว์ในเมล
      to: to,
      subject: subject,
      html: htmlContent
    });
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

// --- API Endpoints ---
app.get('/api/contracts', (req, res) => {
  const db = readDb();
  res.json(db.contracts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

app.get('/api/contracts/:id', (req, res) => {
  const db = readDb();
  const contract = db.contracts.find(c => c.id === req.params.id);
  contract ? res.json(contract) : res.status(404).json({ message: 'Not found' });
});

// Create Contract
app.post('/api/contracts', (req, res) => {
  const db = readDb();
  const newContract = { id: Date.now().toString(), ...req.body, created_at: new Date().toISOString() };
  db.contracts.push(newContract);
  writeDb(db);

  // สร้างลิงก์สำหรับเซ็น
  const link = `${FRONTEND_URL}/?docId=${newContract.id}&step=1`;

  // Logic การส่งเมล: ส่งหาคนแรกที่ต้องเซ็น (ตาม Logic ของคุณคือ signer4 หรือ พยานคนที่ 2)
  // หมายเหตุ: คุณต้องมั่นใจว่าในหน้าบ้านกรอก Email ของพยานมาด้วย
  if (newContract.signer4_email) {
      sendEmail(
        newContract.signer4_email, 
        `แจ้งเตือน: เอกสารรอลงนาม (Step 1) - ${newContract.company_name}`, 
        `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
           <h2 style="color: #323B55;">เรียนคุณ ${newContract.signer4_name}</h2>
           <p>มีเอกสารสัญญาจ้างงานใหม่ รอให้คุณลงนามในฐานะ <b>พยานคนที่ 2</b></p>
           <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตรวจสอบและลงลายมือชื่อ:</p>
           <a href="${link}" style="background-color: #ffde91; color: #323B55; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">✍️ เปิดเอกสารเพื่อลงนาม</a>
           <p style="margin-top: 20px; font-size: 12px; color: #999;">หากคลิกไม่ได้ ให้คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์: <br> ${link}</p>
         </div>`
      );
  } else {
      console.log("No email for Signer 4 (Step 1)");
  }
  res.status(201).json(newContract);
});

// Update Contract (Signature)
app.put('/api/contracts/:id', (req, res) => {
  const db = readDb();
  const index = db.contracts.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Not found' });

  const oldStep = db.contracts[index].current_step;
  const updatedContract = { ...db.contracts[index], ...req.body };
  db.contracts[index] = updatedContract;
  writeDb(db);

  // ถ้า Step เปลี่ยน (มีการเซ็นเสร็จ) ให้ส่งเมลหาคนถัดไป
  if (updatedContract.current_step > oldStep && updatedContract.status !== 'Complete') {
    let nextEmail = '', nextName = '', role = '';
    const step = updatedContract.current_step;
    
    // ตรวจสอบลำดับการเซ็นตาม Logic เดิมของคุณ (App.jsx: Step 2->Sig3, Step 3->Sig1, Step 4->Sig2)
    if (step === 2) { 
        nextEmail = updatedContract.signer3_email; 
        nextName = updatedContract.signer3_name; 
        role = "พยานคนที่ 1";
    } else if (step === 3) { 
        nextEmail = updatedContract.signer1_email; 
        nextName = updatedContract.signer1_name; 
        role = "ผู้บริหาร / HR Manager";
    } else if (step === 4) { 
        nextEmail = updatedContract.signer2_email; 
        nextName = updatedContract.signer2_name; 
        role = "พนักงาน (Employee)";
    }

    if (nextEmail) {
       const link = `${FRONTEND_URL}/?docId=${updatedContract.id}&step=${step}`;
       sendEmail(
         nextEmail, 
         `ถึงคิวคุณลงนาม (Step ${step}) - ${updatedContract.company_name}`, 
         `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
            <h2 style="color: #323B55;">เรียนคุณ ${nextName}</h2>
            <p>เอกสารได้รับการลงนามจากลำดับก่อนหน้าเรียบร้อยแล้ว</p>
            <p>ขณะนี้ถึงคิวของคุณในการลงนามในฐานะ: <b>${role}</b></p>
            <br>
            <a href="${link}" style="background-color: #323B55; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">✍️ เปิดเอกสารเพื่อลงนาม</a>
         </div>`
       );
    }
  } else if (updatedContract.status === 'Complete') {
      // ส่งเมลแจ้งทุกคนว่าเสร็จสมบูรณ์ (Optional)
      console.log("Contract Completed!");
      // คุณอาจจะเพิ่ม logic ส่งเมลหา Employee ว่าเอกสารสมบูรณ์แล้ว พร้อมแนบลิงก์ให้เข้ามาดู
  }

  res.json(updatedContract);
});

// Delete Contract
app.delete('/api/contracts/:id', (req, res) => {
  const db = readDb();
  const newContracts = db.contracts.filter(c => c.id !== req.params.id);
  db.contracts = newContracts;
  writeDb(db);
  res.json({ message: 'Deleted' });
});

// --- Employee API (คงเดิม) ---
app.get('/api/employees', (req, res) => {
    const db = readDb();
    res.json(db.employees || []);
});
app.post('/api/employees', (req, res) => {
    const db = readDb();
    const newEmp = req.body;
    const index = db.employees.findIndex(e => e.empId === newEmp.empId);
    if (index !== -1) db.employees[index] = { ...db.employees[index], ...newEmp };
    else db.employees.push(newEmp);
    writeDb(db);
    res.json({ success: true, message: "Saved" });
});
app.delete('/api/employees/:id', (req, res) => {
    const db = readDb();
    const targetId = req.params.id;
    const newEmployees = db.employees.filter(e => e.empId !== targetId);
    if (newEmployees.length === db.employees.length) return res.status(404).json({ success: false, message: "Not found" });
    db.employees = newEmployees;
    writeDb(db);
    res.json({ success: true, message: "Deleted" });
});

app.post('/api/fetch-sheet', async (req, res) => {
    const { sheetId, sheetName } = req.body;
    if (!sheetId) return res.status(400).json({ message: "Missing Sheet ID" });
    
    // URL สำหรับดึงข้อมูลแบบ CSV จาก Google Visualization API
    const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${sheetParam}`;

    try {
        // ใช้ fetch (Node.js v18+)
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Sheet Error: ${response.statusText}`);
        const csvText = await response.text();
        res.send(csvText); // ส่งข้อความ CSV กลับไปให้ Frontend
    } catch (error) {
        console.error("Sheet Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch sheet", error: error.message });
    }
});

app.get('/api/settings', (req, res) => {
    const db = readDb();
    res.json(db.settings || {});
});

app.post('/api/settings', (req, res) => {
    const db = readDb();
    // บันทึกค่าที่ส่งมาลงใน db.settings
    db.settings = { ...db.settings, ...req.body };
    writeDb(db);
    res.json({ success: true, message: "Settings saved" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));