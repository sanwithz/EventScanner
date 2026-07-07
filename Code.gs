function doGet(e) {
  // Handles fetching User Info and User History
  const action = e.parameter.action;
  const uid = e.parameter.uid;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    if (action === 'getUserInfo') {
      const sheet = ss.getSheetByName('Users');
      
      // อ่านหัวคอลัมน์แบบไดนามิก
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.toString().toLowerCase().trim());
      const uidColIdx = headers.indexOf('uid') + 1; // ตำแหน่งคอลัมน์ของ UID (บวก 1 เพราะ TextFinder นับจาก 1)
      
      if (uidColIdx === 0) return respond({ error: 'UID column missing' }, 400);

      // ค้นหา UID เฉพาะในคอลัมน์ UID เท่านั้น
      const match = sheet.getRange(1, uidColIdx, sheet.getMaxRows(), 1).createTextFinder(String(uid)).matchEntireCell(true).findNext();
      
      if (match) {
        const rowIdx = match.getRow();
        const userRow = sheet.getRange(rowIdx, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
        
        const nameIdx = headers.indexOf('name');
        const classIdx = headers.indexOf('class');
        const numIdx = headers.indexOf('number');
        
        return respond({
          uid: userRow[uidColIdx - 1],
          name: nameIdx >= 0 ? userRow[nameIdx] : '',
          class: classIdx >= 0 ? userRow[classIdx] : '',
          number: numIdx >= 0 ? userRow[numIdx] : ''
        });
      }
      return respond({ error: 'User not found' }, 404);
    }
    
    if (action === 'getUserScans') {
      const sheet = ss.getSheetByName('Scans');
      const data = sheet.getDataRange().getDisplayValues();
      
      // ดึงหัวคอลัมน์ออกมาหา Index อัตโนมัติ
      const headers = data.shift().map(h => h.toString().toLowerCase().trim()); 
      
      const uidIdx = headers.indexOf('uid');
      const tsIdx = headers.indexOf('timestamp');
      const nameIdx = headers.indexOf('name');
      const classIdx = headers.indexOf('class');
      const numIdx = headers.indexOf('number');
      const eventIdx = headers.findIndex(h => h === 'event' || h === 'กิจกรรม');
      const pointIdx = headers.findIndex(h => h === 'points' || h === 'point');
      const dateIdx = headers.indexOf('date');
      
      // Use filter and map for optimized in-memory processing
      const scans = data
        .filter(row => uidIdx >= 0 && String(row[uidIdx]) === String(uid))
        .map(row => ({
          timestamp: tsIdx >= 0 ? row[tsIdx] : '',
          uid: uidIdx >= 0 ? row[uidIdx] : '',
          name: nameIdx >= 0 ? row[nameIdx] : '',
          class: classIdx >= 0 ? row[classIdx] : '',
          number: numIdx >= 0 ? row[numIdx] : '',
          event: eventIdx >= 0 ? row[eventIdx] : '',
          points: pointIdx >= 0 ? parseInt(row[pointIdx], 10) : 0,
          date: dateIdx >= 0 ? row[dateIdx] : ''
        }));
        
      return respond(scans);
    }
    
    return respond({ error: 'Invalid action parameter' }, 400);
    
  } catch (error) {
    return respond({ error: error.message }, 500);
  }
}

function doPost(e) {
  // Handles saving new scans
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Scans');
    
    // อ่านหัวคอลัมน์จากแถวแรก (Row 1) ของชีต Scans
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // สร้าง Array เปล่าๆ ขนาดเท่าจำนวนคอลัมน์ใน Sheet
    let rowData = new Array(headers.length).fill('');
    
    // แมปข้อมูลใส่ Array ตามชื่อหัวคอลัมน์อัตโนมัติ 
    // (ไม่ว่าคุณจะสลับคอลัมน์ไว้ตำแหน่งไหน ข้อมูลก็จะไปลงถูกคอลัมน์ 100%)
    headers.forEach((header, index) => {
      const h = header.toString().toLowerCase().trim();
      
      if (h === 'timestamp') rowData[index] = data.timestamp || '';
      else if (h === 'uid') rowData[index] = data.uid || '';
      else if (h === 'name') rowData[index] = data.name || '';
      else if (h === 'class') rowData[index] = data.class || '';
      else if (h === 'number') rowData[index] = data.number || '';
      else if (h === 'event' || h === 'กิจกรรม') rowData[index] = data.event || '';
      else if (h === 'points' || h === 'point') rowData[index] = data.points || 0;
      else if (h === 'date') rowData[index] = data.date || '';
    });
    
    // Append the scan record to the "Scans" sheet
    sheet.appendRow(rowData);
    
    return respond({ status: 'success' });
  } catch (error) {
    return respond({ error: error.message }, 500);
  }
}

// Helper function to return JSON response with CORS support
function respond(data, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
