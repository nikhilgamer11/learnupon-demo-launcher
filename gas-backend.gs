function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${data.subdomain}.learnupon.com/api/v1`;

    // 1. LOG TO GOOGLE SHEET
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
    sheet.appendRow([new Date(), data.commander, data.subdomain, data.courses, data.groups]);

    const creds = { "password": "learnupon@123", "must_change_password": false };

    // 2. CREATE LEARNER & MANAGER
    const learner = createLUUser(baseUrl, authHeader, "learner@learnupon.com", "Demo", "Learner", creds);
    const manager = createLUUser(baseUrl, authHeader, "manager@learnupon.com", "Demo", "Manager", creds);

    // 3. CREATE ADDITIONAL TEAM MEMBERS
    if(data.otherPeople) {
      data.otherPeople.forEach(email => {
        createLUUser(baseUrl, authHeader, email, "Team", "Member", creds);
      });
    }

    // 4. CREATE COURSE & GROUP
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

    // 5. ILT SESSION & ENROLLMENT
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

    // 6. BRIEFING EMAIL
    MailApp.sendEmail(data.commander, "🚀 Orbit Achieved", 
      `Mission briefing for ${data.subdomain} complete.\n\n` +
      `URL: https://${data.subdomain}.learnupon.com\n` +
      `Learner: learner@learnupon.com / learnupon@123\n` +
      `Manager: manager@learnupon.com / learnupon@123`);

    return ContentService.createTextOutput(JSON.stringify({"status":"OK"})).setMimeType(ContentService.MimeType.JSON);
  } catch (f) {
    return ContentService.createTextOutput(JSON.stringify({"status":"ERR", "log": f.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function createLUUser(url, auth, email, f, l, c) {
  const r = UrlFetchApp.fetch(`${url}/users`, {
    "method": "post", "headers": { "Authorization": auth, "Content-Type": "application/json" },
    "payload": JSON.stringify({ "user": { "email": email, "first_name": f, "last_name": l, ...c } })
  });
  return JSON.parse(r.getContentText());
}
