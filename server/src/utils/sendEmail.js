const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // If SMTP variables aren't set, we log the email content to console
    // This is useful for development so we don't need a real SMTP server to test
    if (!process.env.SMTP_HOST) {
        console.log('----------------------------------------------------');
        console.log('🛠️ NO SMTP CONFIGURED - MOCK EMAIL SENT:');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body:\n${options.message}`);
        console.log('----------------------------------------------------');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
        socketTimeout: 10000,     // 10 seconds
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Intern Lab'} <${process.env.FROM_EMAIL || 'noreply@internlab.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    await transporter.sendMail(message);
};

module.exports = sendEmail;
