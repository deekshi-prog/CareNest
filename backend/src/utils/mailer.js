const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const message = {
        from: process.env.SMTP_FROM || 'CareNest <noreply@carenest.com>',
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      const info = await transporter.sendMail(message);
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`SMTP Email failed: ${error.message}`);
    }
  }

  // Mock / Console Fallback
  console.log('==================================================');
  console.log('EMAIL SENT (MOCK/DEVELOPMENT MODE)');
  console.log(`To:      ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log('--------------------------------------------------');
  console.log('Body:');
  console.log(options.html.replace(/<[^>]*>/g, '')); // Stripped HTML for console logging
  console.log('==================================================');
  return { messageId: 'mock-id-' + Date.now() };
};

// Ready-made HTML templates for booking notifications
const getBookingRequestTemplate = (clientName, assistantName, dates) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px;">
    <h2 style="color: #2b7a78;">New Booking Request Received!</h2>
    <p>Hi ${assistantName},</p>
    <p>You have received a new plant and home care booking request from <strong>${clientName}</strong>.</p>
    <p><strong>Booking Details:</strong></p>
    <ul>
      <li><strong>Dates:</strong> ${dates}</li>
    </ul>
    <p>Please log in to your CareNest Dashboard to accept or decline this request.</p>
    <p style="margin-top: 30px; font-size: 0.8em; color: #8899a6;">This is an automated notification. Please do not reply directly to this email.</p>
  </div>
`;

const getBookingConfirmationTemplate = (clientName, assistantName, dates, status) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 8px;">
    <h2 style="color: ${status === 'confirmed' ? '#2b7a78' : '#e06666'};">Booking Update: Request ${status === 'confirmed' ? 'Accepted' : 'Declined'}</h2>
    <p>Hi ${clientName},</p>
    <p>Your booking request with assistant <strong>${assistantName}</strong> for the dates <strong>${dates}</strong> has been <strong>${status}</strong>.</p>
    ${status === 'confirmed' ? '<p>You can now manage the booking, coordinate details, and track tasks directly in your CareNest dashboard.</p>' : '<p>We suggest checking our search page to find other available assistants near you.</p>'}
    <p style="margin-top: 30px; font-size: 0.8em; color: #8899a6;">This is an automated notification. Please do not reply directly to this email.</p>
  </div>
`;

module.exports = {
  sendEmail,
  getBookingRequestTemplate,
  getBookingConfirmationTemplate,
};
