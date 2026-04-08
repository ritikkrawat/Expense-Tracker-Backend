const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    registerUser,
    loginUser,
    getuserInfo,
} = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getUser', protect, getuserInfo);

// Cloudinary image upload
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file || !req.file.path) {
        return res.status(400).json({ message: "Image upload failed" });
    }

    const imageUrl = req.file.path; 
    res.status(200).json({ imageUrl });
});

// Test route
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Auth route is working!' });
});

module.exports = router;