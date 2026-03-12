function doPost(e) {
  // Directly linking to your spreadsheet ID to stop the "null" error
  const ss = SpreadsheetApp.openById('1pvhka3OwDuW7_HwHe4hsbYLR1dhIn0OqVphPOow1kMM');
  const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  
  try {
    const data = JSON.parse(e.postData.contents);
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${data.subdomain}.learnupon.com/api/v1`;

    const options = (payload) => ({
      "method": "post",
      "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    });

    // MISSION: Provision Portal Components
    UrlFetchApp.fetch(`${baseUrl}/users`, options({ "user": { "email": "learner@learnupon.com", "first_name": "Demo", "last_name": "Learner", "password": "learnupon@123" } }));
    UrlFetchApp.fetch(`${baseUrl}/users`, options({ "user": { "email": "manager@learnupon.com", "first_name": "Demo", "last_name": "Manager", "password": "learnupon@123" } }));
    if (data.courses) UrlFetchApp.fetch(`${baseUrl}/courses`, options({ "course": { "name": data.courses } }));
    if (data.groups) UrlFetchApp.fetch(`${baseUrl}/groups`, options({ "group": { "title": data.groups } }));

    // MISSION: Update History & Briefing
    sheet.appendRow([new Date(), data.commander, data.subdomain, data.courses, data.groups, "SUCCESS"]);
    MailApp.sendEmail(data.commander, "🚀 Orbit Achieved", "Mission complete for portal " + data.subdomain);

    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    sheet.appendRow([new Date(), "CRITICAL FAILURE", "N/A", "N/A", "N/A", err.toString()]);
    return ContentService.createTextOutput(err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
