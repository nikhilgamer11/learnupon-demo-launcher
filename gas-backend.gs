function doPost(e) {
  const ss = SpreadsheetApp.openById('1pvhka3OwDuW7_HwHe4hsbYLR1dhIn0OqVphPOow1kMM');
  const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  
  try {
    const data = JSON.parse(e.postData.contents);
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${data.subdomain}.learnupon.com/api/v1`;

    const options = (payload) => ({
      "method": "post",
      "headers": { 
        "Authorization": authHeader, 
        "Content-Type": "application/json",
        "Accept": "application/json" 
      },
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    });

    // API Call: Create Learner
    UrlFetchApp.fetch(`${baseUrl}/users`, options({ "user": { "email": `learner+${Date.now()}@example.com`, "first_name": "Demo", "last_name": "Learner", "password": "learnupon@123" } }));
    
    // API Call: Create Manager
    UrlFetchApp.fetch(`${baseUrl}/users`, options({ "user": { "email": `manager+${Date.now()}@example.com`, "first_name": "Demo", "last_name": "Manager", "password": "learnupon@123" } }));

    // API Call: Course & Group
    if (data.courses) UrlFetchApp.fetch(`${baseUrl}/courses`, options({ "course": { "name": data.courses } }));
    if (data.groups) UrlFetchApp.fetch(`${baseUrl}/groups`, options({ "group": { "title": data.groups } }));

    sheet.appendRow([new Date(), data.commander, data.subdomain, data.courses, data.groups, "SUCCESS"]);
    
    MailApp.sendEmail(data.commander, "🚀 Orbit Achieved", "Portal " + data.subdomain + " is configured.");

    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    sheet.appendRow([new Date(), "CRITICAL ERROR", "N/A", "N/A", "N/A", err.toString()]);
    return ContentService.createTextOutput(err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
