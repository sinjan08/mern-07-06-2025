const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: false, // true for 465, false for 587 or STARTTLS
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// Optional: verify transporter config on startup
transporter.verify((err, success) => {
    if (err) {
        console.error('Mailer verification failed:', err);
    } else {
        console.log('Mailer is ready to send emails');
    }
});

/**
 * Send an email using the common transporter
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version
 * @param {string} [options.html] - HTML version
 */
const sendMail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to,
            subject,
            text,
            html
        });

        console.log(`Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send failed:', error);
        return { success: false, error };
    }
};

module.exports = { sendMail };
