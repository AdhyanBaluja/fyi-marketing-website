require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Minimal email sender using nodemailer + Gmail SMTP.
 */
exports.sendEmail = async (to, subject, text) => {
  try {
    // If not in production, just log details
    if (process.env.NODE_ENV !== 'production') {
      console.log('Mock email (not sending in non-prod):');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text}`);
      return;
    }

    // In production, create a transporter using Gmail's SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    // Actually send email
    const info = await transporter.sendMail({
      from: `"letsFYI" <${process.env.EMAIL_USER}>`,
      to,       // This is critical: the actual person's email
      subject,
      text
    });

    console.log(`Email sent successfully: ${info.messageId} to ${to}`);
  } catch (err) {
    console.error('Error sending email:', err);
    // Optionally rethrow or handle further
  }
};
