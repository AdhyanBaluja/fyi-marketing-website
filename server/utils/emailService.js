// utils/emailService.js
require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Minimal email sender using nodemailer + Gmail SMTP.
 * 
 * Environment separation:
 *   - In production (NODE_ENV=production), actually send the email.
 *   - Otherwise, log to console and skip sending.
 */
exports.sendEmail = async (to, subject, text) => {
  try {
    // 1) If not production, just log and return
    if (process.env.NODE_ENV !== 'production') {
      console.log('EmailService: Mock email (not sending in non-production environment)');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text}`);
      return;
    }

    // 2) In production, create a transporter using Gmail's SMTP
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER, // e.g. "yourgmail@gmail.com"
        pass: process.env.EMAIL_PASS  // e.g. "your_app_specific_password"
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // 3) Send the email
    let info = await transporter.sendMail({
      from: `"letsFYI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`Email sent successfully: ${info.messageId} to ${to}`);
  } catch (err) {
    console.error('Error sending email:', err);
    // Optionally rethrow or handle the error
  }
};
