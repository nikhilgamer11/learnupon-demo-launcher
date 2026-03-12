function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
  let data;
  
  try {
    data = JSON.parse(e.postData.contents);
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${data.subdomain}.learnupon.com/api/v1`;

    // 1. CREATE USERS
    const creds = { "password": "learnupon@123", "must_change_password": false };
    const learner = createLUUser(baseUrl, authHeader, "learner@learnupon.com", "Demo", "Learner", creds);
    const manager = createLUUser(baseUrl, authHeader, "manager@learnupon.com", "Demo", "Manager", creds);

    // 2. CREATE COURSE & GROUP
    let courseId = "";
    if (data.courses) {
      const resp = UrlFetchApp.fetch(`${baseUrl}/courses`, {
        "method": "post", "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "course": { "name": data.courses } })
      });
      courseId = JSON.parse(resp.getContentText()).id;
    }

    if (data.groups) {
      UrlFetchApp.fetch(`${baseUrl}/groups`, {
        "method": "post", "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "group": { "title": data.groups } })
      });
    }

    // 3. ILT SESSION & ENROLLMENT
    if (courseId) {
      const event = UrlFetchApp.fetch(`${baseUrl}/ilt_sessions`, {
        "method": "post", "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({
          "ilt_session": { "name": "Mission Briefing", "course_id": courseId, "owner_id": manager.id, "start_date": new Date().toISOString() }
        })
      });
      const sessionId = JSON.parse(event.getContentText()).id;
      UrlFetchApp.fetch(`${baseUrl}/enrollments`, {
        "method": "post", "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "user_id": learner.id, "ilt_session_id": sessionId })
      });
    }

    // 4. LOG SUCCESS & SEND EMAIL
    sheet.appendRow([new Date(), data.commander, data.subdomain, data.courses, data.groups, "SUCCESS"]);
    
    MailApp.sendEmail({
      to: data.commander,
      subject: "🚀 Orbit Achieved: Portal " + data.subdomain + " Configured",
      htmlBody: `<h3>Commander,</h3><p>Portal architecture is complete.</p>
                 <ul>
                  <li><b>URL:</b> https://${data.subdomain}.learnupon.com</li>
                  <li><b>Learner:</b> learner@learnupon.com / learnupon@123</li>
                  <li><b>Manager:</b> manager@learnupon.com / learnupon@123</li>
                 </ul>`
    });

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    // LOG ERROR TO SHEET FOR HISTORY
    const errorMsg = error.toString();
    sheet.appendRow([new Date(), data ? data.commander : "Unknown", data ? data.subdomain : "N/A", "N/A", "N/A", "ERROR: " + errorMsg]);
    
    return ContentService.createTextOutput("Error: " + errorMsg).setMimeType(ContentService.MimeType.TEXT);
  }
}

function createLUUser(url, auth, email, f, l, c) {
  const r = UrlFetchApp.fetch(`${url}/users`, {
    "method": "post", "headers": { "Authorization": auth, "Content-Type": "application/json" },
    "payload": JSON.stringify({ "user": { "email": email, "first_name": f, "last_name": l, ...c } })
  });
  return JSON.parse(r.getContentText());
}
