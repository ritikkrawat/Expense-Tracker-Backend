const express = require('express');
const router = express.Router();
const sendEmailOTP = require('../utils/sendEmailOTP');
const OtpVerification = require('../models/otpVerfication');
const rateLimit = require('express-rate-limit');

// Rate limiter: max 3 OTP requests per minute per IP
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { message: 'Too many OTP requests. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route to send OTP
router.post('/send', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Remove existing OTPs for this email
    await OtpVerification.deleteMany({ email });

    // Save new OTP to DB
    const otpEntry = new OtpVerification({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins from now
    });

    await otpEntry.save();

    // Send OTP to email
    await sendEmailOTP(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('OTP send error:', err.message);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Route to verify OTP
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const otpRecord = await OtpVerification.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OtpVerification.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (otp !== otpRecord.otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid
    await OtpVerification.deleteOne({ email }); // Optional: cleanup
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('OTP verification error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
