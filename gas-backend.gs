/**
 * LEARNUPON MISSION CONTROL ENGINE
 * Full automation: Users, Courses, Groups, Live Events, Logging, and Emails.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const commander = data.commander;
    const subdomain = data.subdomain;
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${subdomain}.learnupon.com/api/v1`;

    // 1. LOG MISSION DATA TO GOOGLE SHEET
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Logs") || ss.insertSheet("Logs");
    sheet.appendRow([new Date(), commander, subdomain, data.courses, data.groups, "LAUNCHED"]);

    // 2. CREATE DUMMY ACCOUNTS
    const staticCreds = { "password": "learnupon@123", "must_change_password": false };
    
    // Create Learner
    const learnerResp = UrlFetchApp.fetch(`${baseUrl}/users`, {
      "method": "post",
      "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
      "payload": JSON.stringify({ 
        "user": { "email": "learner@learnupon.com", "first_name": "Demo", "last_name": "Learner", ...staticCreds } 
      })
    });
    const learnerId = JSON.parse(learnerResp.getContentText()).id;

    // Create Manager
    const managerResp = UrlFetchApp.fetch(`${baseUrl}/users`, {
      "method": "post",
      "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
      "payload": JSON.stringify({ 
        "user": { "email": "manager@learnupon.com", "first_name": "Demo", "last_name": "Manager", ...staticCreds } 
      })
    });
    const managerId = JSON.parse(managerResp.getContentText()).id;

    // 3. CREATE DYNAMIC COURSE & GROUP
    let courseId = "";
    if (data.courses) {
      const courseResp = UrlFetchApp.fetch(`${baseUrl}/courses`, {
        "method": "post",
        "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "course": { "name": data.courses } })
      });
      courseId = JSON.parse(courseResp.getContentText()).id;
    }

    if (data.groups) {
      UrlFetchApp.fetch(`${baseUrl}/groups`, {
        "method": "post",
        "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "group": { "title": data.groups } })
      });
    }

    // 4. CREATE LIVE EVENT (ILT) & ENROLL LEARNER
    if (courseId) {
      const eventResp = UrlFetchApp.fetch(`${baseUrl}/ilt_sessions`, {
        "method": "post",
        "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({
          "ilt_session": {
            "name": "Mission Briefing Live",
            "course_id": courseId,
            "owner_id": managerId, // Manager as owner
            "start_date": new Date(Date.now() + 86400000).toISOString() // Scheduled for tomorrow
          }
        })
      });
      const sessionId = JSON.parse(eventResp.getContentText()).id;

      // Enroll the learner in the live event
      UrlFetchApp.fetch(`${baseUrl}/enrollments`, {
        "method": "post",
        "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "user_id": learnerId, "ilt_session_id": sessionId })
      });
    }

    // 5. SEND MISSION BRIEFING EMAIL
    const subject = `🚀 Orbit Achieved: Portal ${subdomain} is Configured`;
    const emailBody = `Commander,\n\nMission successful. Portal ${subdomain} is live.\n\n` +
                      `ACCESS CREDENTIALS:\n` +
                      `- Learner: learner@learnupon.com / learnupon@123\n` +
                      `- Manager: manager@learnupon.com / learnupon@123\n\n` +
                      `RESOURCES:\n` +
                      `- Course: ${data.courses}\n` +
                      `- Group: ${data.groups}\n` +
                      `- Live Event: Mission Briefing (Manager Owned)\n\n` +
                      `Safe travels.`;

    MailApp.sendEmail(commander, subject, emailBody);

    return ContentService.createTextOutput(JSON.stringify({"status": "SUCCESS"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "ERROR", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
