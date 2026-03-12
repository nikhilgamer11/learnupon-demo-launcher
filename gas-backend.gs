function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  
  try {
    const data = JSON.parse(e.postData.contents);
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${data.subdomain}.learnupon.com/api/v1`;

    // 1. CREATE USERS
    const creds = { "password": "learnupon@123", "must_change_password": false };
    const learner = createLUUser(baseUrl, authHeader, "learner@learnupon.com", "Demo", "Learner", creds);
    const manager = createLUUser(baseUrl, authHeader, "manager@learnupon.com", "Demo", "Manager", creds);

    // 2. CREATE COURSE
    let courseId = "";
    if (data.courses) {
      const cResp = UrlFetchApp.fetch(`${baseUrl}/courses`, {
        "method": "post", "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "course": { "name": data.courses } })
      });
      courseId = JSON.parse(cResp.getContentText()).id;
    }

    // 3. CREATE GROUP
    if (data.groups) {
      UrlFetchApp.fetch(`${baseUrl}/groups`, {
        "method": "post", "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "group": { "title": data.groups } })
      });
    }

    // 4. LOG & EMAIL
    sheet.appendRow([new Date(), data.commander, data.subdomain, data.courses, data.groups, "SUCCESS"]);
    MailApp.sendEmail(data.commander, "🚀 Orbit Achieved", "Portal " + data.subdomain + " is configured.\n\nLearner: learner@learnupon.com\nManager: manager@learnupon.com\nPass: learnupon@123");

    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    sheet.appendRow([new Date(), "ERROR", "ERROR", "ERROR", "ERROR", err.toString()]);
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function createLUUser(url, auth, email, f, l, c) {
  const r = UrlFetchApp.fetch(`${url}/users`, {
    "method": "post", "headers": { "Authorization": auth, "Content-Type": "application/json" },
    "payload": JSON.stringify({ "user": { "email": email, "first_name": f, "last_name": l, ...c } })
  });
  return JSON.parse(r.getContentText());
}
