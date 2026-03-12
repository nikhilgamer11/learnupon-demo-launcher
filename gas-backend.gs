/**
 * GAS Backend: Handles Portal Creation via API
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Extract variables from the mission control form
    var subdomain = data.subdomain;
    var apiUser = data.username;
    var apiPass = data.password;
    var courses = data.courses.split(',');
    var groups = data.groups.split(',');

    // PROCESSOR: This is where you call your specific platform APIs
    // Example: createPortal(subdomain, apiUser, apiPass);
    // Example: enrollGroups(courses, groups);

    return ContentService.createTextOutput(JSON.stringify({"status": "SUCCESS"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "ERROR", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
