function doPost(e) {
  const ss = SpreadsheetApp.openById('1pvhka3OwDuW7_HwHe4hsbYLR1dhIn0OqVphPOow1kMM');
  const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  
  try {
    // Safety check for incoming data
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received from the website.");
    }

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

    // --- EXECUTION: Create Users ---
    UrlFetchApp.fetch(`${baseUrl}/users`, options({ "user": { "email": "learner@learnupon.com", "first_name": "Demo", "last_name": "Learner", "password": "learnupon@123" } }));
    UrlFetchApp.fetch(`${baseUrl}/users`, options({ "user": { "email": "manager@learnupon.com", "first_name": "Demo", "last_name": "Manager", "password": "learnupon@123" } }));

    // --- EXECUTION: Create Course ---
    if (data.courses) {
      UrlFetchApp.fetch(`${baseUrl}/courses`, options({ "course": { "name": data.courses } }));
    }

    // --- EXECUTION: Create Group ---
    if (data.groups) {
      UrlFetchApp.fetch(`${baseUrl}/groups`, options({ "group": { "title": data.groups } }));
    }

    // --- LOGGING & EMAIL ---
    sheet.appendRow([new Date(), data.commander, data.subdomain, data.courses, data.groups, "SUCCESS"]);
    
    MailApp.sendEmail({
      to: data.commander,
      subject: "🚀 Orbit Achieved: " + data.subdomain,
      body: "Mission Control confirmed. Portal components provisioned.\n\nSubdomain: " + data.subdomain + "\nGroup: " + data.groups + "\nCourse: " + data.courses
    });

    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    sheet.appendRow([new Date(), "CRITICAL ERROR", "N/A", "N/A", "N/A", err.toString()]);
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
