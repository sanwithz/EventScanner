
// function doGet(e) {
//   // Handles fetching User Info and User History
//   const action = e.parameter.action;
//   const uid = e.parameter.uid;
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
  
//   try {
//     if (action === 'getUserInfo') {
//       const sheet = ss.getSheetByName('Users');
      
//       // Use TextFinder to instantly find the UID in Column A without loading all rows
//       const match = sheet.getRange("A:A").createTextFinder(String(uid)).matchEntireCell(true).findNext();
      
//       if (match) {
//         const rowIdx = match.getRow();
//         // Fetch only that specific row's data (Columns A to D)
//         const userRow = sheet.getRange(rowIdx, 1, 1, 4).getDisplayValues()[0];
        
//         return respond({
//           uid: userRow[0],
//           name: userRow[1],
//           class: userRow[2],
//           number: userRow[3]
//         });
//       }
//       return respond({ error: 'User not found' }, 404);
//     }
    
//     if (action === 'getUserScans') {
//       const sheet = ss.getSheetByName('Scans');
//       const data = sheet.getDataRange().getDisplayValues();
//       data.shift(); // Remove the header row from the array
      
//       // Use filter and map for optimized in-memory processing instead of a for loop
//       const scans = data
//         .filter(row => String(row[1]) === String(uid))
//         .map(row => ({
//           timestamp: row[0],
//           uid: row[1],
//           name: row[2],
//           class: row[3],
//           number: row[4],
//           event: row[5],
//           points: parseInt(row[6], 10),
//           date: row[7]
//         }));
        
//       return respond(scans);
//     }
    
//     return respond({ error: 'Invalid action parameter' }, 400);
    
//   } catch (error) {
//     return respond({ error: error.message }, 500);
//   }
// }

// function doPost(e) {
//   // Handles saving new scans
//   try {
//     const data = JSON.parse(e.postData.contents);
//     const ss = SpreadsheetApp.getActiveSpreadsheet();
//     const sheet = ss.getSheetByName('Scans');
    
//     // Append the scan record to the "Scans" sheet
//     sheet.appendRow([
//       data.timestamp,
//       data.uid,
//       data.name,
//       data.class,
//       data.number,
//       data.event,
//       data.points,
//       data.date
//     ]);
    
//     return respond({ status: 'success' });
//   } catch (error) {
//     return respond({ error: error.message }, 500);
//   }
// }

// // Helper function to return JSON response with CORS support
// function respond(data, statusCode = 200) {
//   return ContentService.createTextOutput(JSON.stringify(data))
//     .setMimeType(ContentService.MimeType.JSON);
// }
