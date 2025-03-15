// testEmail.js
require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

(async () => {
  try {
    // Replace with a valid recipient email address for testing
    const recipientEmail = 'recipient@example.com';
    const subject = 'Test Email from Node';
    const text = 'This is a test email sent using the nodemailer email service.';
    
    await sendEmail(recipientEmail, subject, text);
    console.log("Test email sent successfully.");
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
})();
