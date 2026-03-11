function doPost(e) {
  var courseName = e.parameter.courseName;
  var learnerEmail = e.parameter.learnerEmail;
  var subject = 'Demo Portal Access';
  var message = 'Dear learner,\n\nYou have been granted access to the demo portal for the course: ' + courseName + '.\n\nBest regards,\nThe Team';

  // Send email to learner
  MailApp.sendEmail(learnerEmail, subject, message);

  // Logic to create demo portal
  createDemoPortal(courseName, learnerEmail);

  // Return success response
  return ContentService.createTextOutput(JSON.stringify({success: true, message: 'Email sent and demo portal created.'})).setMimeType(ContentService.MimeType.JSON);
}

function createDemoPortal(courseName, learnerEmail) {
  // Placeholder for demo portal creation logic
  Logger.log('Creating demo portal for: ' + courseName + ' for learner: ' + learnerEmail);
  // Implement your demo portal creation logic here.
}