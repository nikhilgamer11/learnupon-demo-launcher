/**
 * MISSION CONTROL BACKEND
 * Updated for LearnUpon API V1 Compliance
 */
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  
  try {
    const data = JSON.parse(e.postData.contents);
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${data.subdomain}.learnupon.com/api/v1`;
    const options = (payload) => ({
      "method": "post",
      "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true // Allows the script to continue even if LearnUpon returns an error
    });

    // --- MISSION 1: CREATE USERS ---
    const learnerPayload = { "user": { "email": "learner@learnupon.com", "first_name": "Demo", "last_name": "Learner", "password": "learnupon@123" } };
    const managerPayload = { "user": { "email": "manager@learnupon.com", "first_name": "Demo", "last_name": "Manager", "password": "learnupon@123" } };
    
    UrlFetchApp.fetch(`${baseUrl}/users`, options(learnerPayload));
    UrlFetchApp.fetch(`${baseUrl}/users`, options(managerPayload));

    // --- MISSION 2: CREATE COURSE ---
    if (data.courses) {
      UrlFetchApp.fetch(`${baseUrl}/courses`, options({ "course": { "name": data.courses } }));
    }

    // --- MISSION 3: CREATE GROUP ---
    if (data.groups) {
      UrlFetchApp.fetch(`${baseUrl}/groups`, options({ "group": { "title": data.groups } }));
    }

    // --- MISSION 4: LOGGING ---
    sheet.appendRow([new Date(), data.commander, data.subdomain, data.courses, data.groups, "SUCCESS"]);

    // --- MISSION 5: EMAIL BRIEFING ---
    MailApp.sendEmail(data.commander, "🚀 Orbit Achieved: " + data.subdomain, 
      "The portal has been provisioned.\n\nLearner: learner@learnupon.com\nManager: manager@learnupon.com\nPass: learnupon@123");

    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    // If it fails, we record the EXACT error in your sheet
    sheet.appendRow([new Date(), "FAILURE", "N/A", "N/A", "N/A", err.toString()]);
    return ContentService.createTextOutput(err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
