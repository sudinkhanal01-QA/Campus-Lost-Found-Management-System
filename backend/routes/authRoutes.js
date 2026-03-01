// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/status', protect, (req, res) => { // New route for auth status
    // If 'protect' middleware passes, req.user will contain user data
    res.status(200).json({ user: req.user });
});

module.exports = router;

