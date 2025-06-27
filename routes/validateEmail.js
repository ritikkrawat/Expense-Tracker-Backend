const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY;

// POST /api/v1/validate-email
router.post(
  '/',
  // Step 1: Validate email input
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  async (req, res) => {
    // Step 2: Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Step 3: Call Abstract Email Validation API
      const response = await axios.get(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`
      );

      const data = response.data;

      // Step 4: Build clean and informative response
      return res.status(200).json({
        isValid: data.deliverability === 'DELIVERABLE',
        isDisposable: data.is_disposable_email?.value || false,
        isFreeProvider: data.is_free_email?.value || false,
        qualityScore: parseFloat(data.quality_score) || 0,
        raw: process.env.NODE_ENV === 'development' ? data : undefined, // Raw only in dev
      });
    } catch (error) {
      console.error('Email validation error:', error.message);
      return res.status(500).json({ message: 'Email validation failed' });
    }
  }
);

module.exports = router;
