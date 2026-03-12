function doPost(e) {
  // Use the specific ID to ensure the script finds your "Galactic-Backend" sheet
  const ss = SpreadsheetApp.openById('1pvhka3OwDuW7_HwHe4hsbYLR1dhIn0OqVphPOow1kMM');
  const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  
  try {
    const data = JSON.parse(e.postData.contents);
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${data.subdomain}.learnupon.com/api/v1`;

    // LearnUpon API structure check
    const options = (payload) => ({
      "method": "post",
      "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    });

    // 1. Create Users
    UrlFetchApp.fetch(`${baseUrl}/users`, options({ "user": { "email": "learner@learnupon.com", "first_name": "Demo", "last_name": "Learner", "password": "learnupon@123" } }));
    UrlFetchApp.fetch(`${baseUrl}/users`, options({ "user": { "email": "manager@learnupon.com", "first_name": "Demo", "last_name": "Manager", "password": "learnupon@123" } }));

    // 2. Create Course
    if (data.courses) {
      UrlFetchApp.fetch(`${baseUrl}/courses`, options({ "course": { "name": data.courses } }));
    }

    // 3. Create Group
    if (data.groups) {
      UrlFetchApp.fetch(`${baseUrl}/groups`, options({ "group": { "title": data.groups } }));
    }

    // 4. Log to Sheet
    sheet.appendRow([new Date(), data.commander, data.subdomain, data.courses, data.groups, "SUCCESS"]);

    // 5. Send Email
    MailApp.sendEmail(data.commander, "🚀 Orbit Achieved", "Portal " + data.subdomain + " is configured.");

    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    // Record error for troubleshooting
    sheet.appendRow([new Date(), "ERROR", "ERROR", "ERROR", "ERROR", err.toString()]);
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
