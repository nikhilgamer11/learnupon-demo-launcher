/**
 * LEARNUPON MISSION CONTROL BACKEND
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const subdomain = data.subdomain;
    const authHeader = "Basic " + Utilities.base64Encode(data.username + ":" + data.password);
    const baseUrl = `https://${subdomain}.learnupon.com/api/v1`;

    // 1. CREATE LEARNER AND MANAGER
    const credentials = { "password": "learnupon@123", "must_change_password": false };
    
    // Create Learner
    const learner = createLUUser(baseUrl, authHeader, "learner@learnupon.com", "Demo", "Learner", credentials);
    
    // Create Manager (Assignment of roles typically happens via separate PUT or during creation)
    const manager = createLUUser(baseUrl, authHeader, "manager@learnupon.com", "Demo", "Manager", credentials);

    // 2. DYNAMIC COURSE & GROUP CREATION
    let courseId = "";
    if (data.courses) {
      // Logic to create a course shell based on inputted name
      const courseResponse = UrlFetchApp.fetch(`${baseUrl}/courses`, {
        "method": "post",
        "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "course": { "name": data.courses } })
      });
      courseId = JSON.parse(courseResponse.getContentText()).id;
    }

    if (data.groups) {
      UrlFetchApp.fetch(`${baseUrl}/groups`, {
        "method": "post",
        "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
        "payload": JSON.stringify({ "group": { "title": data.groups } })
      });
    }

    // 3. LIVE EVENT & ENROLLMENT
    const eventResponse = UrlFetchApp.fetch(`${baseUrl}/ilt_sessions`, {
      "method": "post",
      "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
      "payload": JSON.stringify({
        "ilt_session": {
          "name": "Mission Briefing Live",
          "course_id": courseId,
          "owner_id": manager.id, // Manager as owner
          "start_date": new Date().toISOString()
        }
      })
    });
    const sessionId = JSON.parse(eventResponse.getContentText()).id;

    // Enroll Learner into the Live Event
    UrlFetchApp.fetch(`${baseUrl}/enrollments`, {
      "method": "post",
      "headers": { "Authorization": authHeader, "Content-Type": "application/json" },
      "payload": JSON.stringify({ "user_id": learner.id, "ilt_session_id": sessionId })
    });

    // 4. FINAL EMAIL NOTIFICATION
    const subject = "🚀 Mission Success: Portal Architecture Complete";
    const emailBody = `Commander,\n\nOrbit has been achieved for ${subdomain}.\n\n` +
                      `CREDENTIALS:\n` +
                      `- Learner: learner@learnupon.com / learnupon@123\n` +
                      `- Manager: manager@learnupon.com / learnupon@123\n\n` +
                      `RESOURCES CREATED:\n` +
                      `- Course: ${data.courses}\n` +
                      `- Group: ${data.groups}\n` +
                      `- Live Event: Mission Briefing (Manager Owned)\n\n` +
                      `System Ready.`;

    MailApp.sendEmail(data.commander, subject, emailBody);

    return ContentService.createTextOutput(JSON.stringify({"status": "SUCCESS"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "ERROR", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createLUUser(baseUrl, auth, email, first, last, creds) {
  const resp = UrlFetchApp.fetch(`${baseUrl}/users`, {
    "method": "post",
    "headers": { "Authorization": auth, "Content-Type": "application/json" },
    "payload": JSON.stringify({ "user": { "email": email, "first_name": first, "last_name": last, ...creds } })
  });
  return JSON.parse(resp.getContentText());
}
