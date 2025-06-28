const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmailOTP = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: toEmail,
    subject: 'Your OTP for Email Verification',
    html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmailOTP;
