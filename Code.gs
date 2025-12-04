// --- CONFIGURATION ---
const SHEET_ID = '13ko9sbzz9_RlBqvb02g-A6_Tc3sMq1YP7-CjlhGKB9E'; // ID ของคุณ
// *** เปลี่ยนตรงนี้เป็น URL ของหน้าเว็บ Frontend ของคุณ (GitHub Pages) ***
// ถ้ายัง Test ในเครื่อง ให้ใส่ http://localhost:5173 หรือ http://localhost:5500
const FRONTEND_URL = 'http://localhost:5173'; 

// --- MENU TOOLBAR (ตามที่ขอ) ---
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📝 ระบบสัญญา (Admin)')
    .addItem('🔗 ดู URL สำหรับ API (Backend)', 'showBackendUrl')
    .addSeparator()
    .addItem('📧 ทดสอบส่งเมลหาตัวเอง', 'testEmail')
    .addToUi();
}

function showBackendUrl() {
  const url = ScriptApp.getService().getUrl();
  const html = HtmlService.createHtmlOutput(`
    <p>นี่คือ <strong>API_URL</strong> สำหรับนำไปใส่ในไฟล์ <code>App.jsx</code> ครับ:</p>
    <textarea style="width:100%; height:100px;">${url}</textarea>
    <p style="color:red; font-size: 12px;">*อย่าลืม Deploy เป็น Web App ก่อน (Execute as Me, Access: Anyone)</p>
  `).setWidth(400).setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Backend API URL');
}

function testEmail() {
  const email = Session.getActiveUser().getEmail();
  GmailApp.sendEmail(email, "Test Contract System", "ระบบส่งเมลใช้งานได้ปกติครับ!");
  SpreadsheetApp.getUi().alert(`ส่งเมลทดสอบไปที่ ${email} แล้ว`);
}

// --- API HANDLERS (doGet / doPost) ---

function doGet(e) {
  const action = e.parameter.action;
  const db = SpreadsheetApp.openById(SHEET_ID);
  let data = [];

  if (action === 'getContracts') {
    data = getSheetData(db.getSheetByName('Contracts'), true); // true = มี column data_json
    // Sort ตาม created_at (ใหม่สุดขึ้นก่อน)
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } 
  else if (action === 'getContractById') {
    const id = e.parameter.id;
    const all = getSheetData(db.getSheetByName('Contracts'), true);
    const found = all.find(c => c.id == id);
    if (found) data = found;
    else return responseJSON({ error: 'Not found' });
  }
  else if (action === 'getEmployees') {
    data = getSheetData(db.getSheetByName('Employees'), false);
  }
  else if (action === 'getSettings') {
    const rows = db.getSheetByName('Settings').getDataRange().getValues();
    rows.shift(); // remove header
    let settings = {};
    rows.forEach(r => settings[r[0]] = r[1]);
    data = settings;
  }

  return responseJSON(data);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const db = SpreadsheetApp.openById(SHEET_ID);

  // --- CONTRACTS ---
  if (action === 'createContract') {
    const sheet = db.getSheetByName('Contracts');
    const newId = new Date().getTime().toString();
    const now = new Date().toISOString();
    
    // เตรียมข้อมูลลงแถว (เรียงตาม Header ใน Step 1)
    const row = [
      newId,
      body.contract_type,
      body.company_name,
      'Pending Signer 1', // status เริ่มต้น
      1, // current_step เริ่มต้น
      now,
      body.signer1_name, body.signer1_email,
      body.signer2_name, body.signer2_email,
      body.signer3_name, body.signer3_email,
      body.signer4_name, body.signer4_email,
      '', '', '', '', // sig1-4 ว่างไว้ก่อน
      JSON.stringify(body.data) // data_json เก็บ object ใหญ่
    ];
    
    sheet.appendRow(row);
    
    // ส่งเมลหา Signer 4 (พยาน 2 - Step 1)
    if (body.signer4_email) {
      sendNotifEmail(body.signer4_email, body.signer4_name, 1, newId, body.company_name, "พยานคนที่ 2");
    }

    return responseJSON({ status: 'success', id: newId });
  }

  if (action === 'updateContract') {
    const sheet = db.getSheetByName('Contracts');
    const data = getSheetData(sheet, true);
    const index = data.findIndex(c => c.id == body.id);
    
    if (index === -1) return responseJSON({ error: 'Not found' });
    
    const rowNum = index + 2; // +1 header, +1 เพราะ array เริ่มที่ 0
    const oldStep = data[index].current_step;
    
    // อัปเดตข้อมูลใน Sheet
    // เราจะอัปเดตเฉพาะ field สำคัญ: Status(Col 4), Step(Col 5), Sigs(Col 15-18), Data(Col 19)
    if (body.status) sheet.getRange(rowNum, 4).setValue(body.status);
    if (body.current_step) sheet.getRange(rowNum, 5).setValue(body.current_step);
    
    // Update Signature Images to specific columns if needed (Optional)
    // แต่หลักๆ เราจะ update ลง data_json
    if (body.data) {
       // Merge signature images to data object
       sheet.getRange(rowNum, 19).setValue(JSON.stringify(body.data));
    }

    // --- Logic ส่งเมล (เหมือนใน index.js เดิม) ---
    if (body.current_step > oldStep && body.status !== 'Complete') {
      const step = body.current_step;
      const contract = { ...data[index], ...body }; // Merge current state
      
      let nextEmail = '', nextName = '', role = '';
      if (step === 2) { 
        nextEmail = contract.signer3_email; nextName = contract.signer3_name; role = "พยานคนที่ 1";
      } else if (step === 3) { 
        nextEmail = contract.signer1_email; nextName = contract.signer1_name; role = "ผู้บริหาร / HR Manager";
      } else if (step === 4) { 
        nextEmail = contract.signer2_email; nextName = contract.signer2_name; role = "พนักงาน (Employee)";
      }

      if (nextEmail) {
        sendNotifEmail(nextEmail, nextName, step, contract.id, contract.company_name, role);
      }
    }

    return responseJSON({ status: 'updated' });
  }

  if (action === 'deleteContract') {
    const sheet = db.getSheetByName('Contracts');
    const data = getSheetData(sheet, false); // ไม่ต้อง parse json ก็ได้
    const index = data.findIndex(c => c.id == body.id);
    if (index !== -1) {
      sheet.deleteRow(index + 2);
      return responseJSON({ status: 'deleted' });
    }
    return responseJSON({ error: 'Not found' });
  }

  // --- EMPLOYEES ---
  if (action === 'saveEmployee') {
    const sheet = db.getSheetByName('Employees');
    const data = getSheetData(sheet, false);
    const index = data.findIndex(e => e.empId == body.empId);
    
    // แปลง Object เป็น Array ตามลำดับ Header
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowValues = headers.map(h => body[h] || ''); // Map ตามชื่อ Column

    if (index !== -1) {
      // Update
      sheet.getRange(index + 2, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // Insert
      sheet.appendRow(rowValues);
    }
    return responseJSON({ status: 'saved' });
  }

  if (action === 'deleteEmployee') {
    const sheet = db.getSheetByName('Employees');
    const data = getSheetData(sheet, false);
    const index = data.findIndex(e => e.empId == body.id); // Frontend ส่งมาเป็น id หรือ empId เช็คดีๆ
    if (index !== -1) {
      sheet.deleteRow(index + 2);
      return responseJSON({ status: 'deleted' });
    }
    return responseJSON({ error: 'Not found' });
  }

  // --- SETTINGS ---
  if (action === 'saveSettings') {
    const sheet = db.getSheetByName('Settings');
    sheet.clearContents();
    sheet.appendRow(['Key', 'Value']); // Header
    const entries = Object.entries(body);
    // ลบ action ออกจาก object ก่อนบันทึก
    const filteredEntries = entries.filter(([k,v]) => k !== 'action');
    if(filteredEntries.length > 0) {
      sheet.getRange(2, 1, filteredEntries.length, 2).setValues(filteredEntries);
    }
    return responseJSON({ status: 'saved' });
  }
  
  // --- IMPORT SHEET PROXY ---
  if (action === 'fetchSheet') {
    // ใช้ UrlFetchApp แทน fetch ของ Node.js
    const sheetId = body.sheetId;
    const sheetName = body.sheetName;
    const sheetParam = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : '';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${sheetParam}`;
    
    try {
      const res = UrlFetchApp.fetch(url);
      return ContentService.createTextOutput(res.getContentText()).setMimeType(ContentService.MimeType.TEXT);
    } catch(e) {
      return responseJSON({ error: e.message });
    }
  }

  return responseJSON({ error: 'Unknown action' });
}

// --- HELPER FUNCTIONS ---

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheet, parseJsonCol) {
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift(); // เอาบรรทัดแรกออกเป็น Header
  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    if (parseJsonCol && obj.data_json) {
      try { 
        obj.data = JSON.parse(obj.data_json); 
      } catch(e) {
        obj.data = {};
      }
    }
    // แปลง data.Fields กลับมาถ้าจำเป็น เพื่อให้ Frontend ทำงานได้เหมือนเดิม
    return obj;
  });
}

function sendNotifEmail(to, name, step, docId, company, role) {
  if (!to || to.trim() === '') return;
  
  const link = `${FRONTEND_URL}/?docId=${docId}&step=${step}`;
  
  const subject = `แจ้งเตือน: เอกสารรอลงนาม (Step ${step}) - ${company}`;
  const body = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
      <h2 style="color: #323B55;">เรียนคุณ ${name}</h2>
      <p>มีเอกสารสัญญาจ้างงานใหม่ หรือถึงลำดับของคุณแล้ว ในฐานะ <b>${role}</b></p>
      <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตรวจสอบและลงลายมือชื่อ:</p>
      <br>
      <a href="${link}" style="background-color: #323B55; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">✍️ เปิดเอกสารเพื่อลงนาม</a>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        หากคลิกไม่ได้ ให้คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์: <br> ${link}
      </p>
    </div>
  `;
  
  try {
    GmailApp.sendEmail(to, subject, "โปรดเปิดในโปรแกรมที่รองรับ HTML", { htmlBody: body });
  } catch (e) {
    console.log("Error sending email: " + e.message);
  }
}