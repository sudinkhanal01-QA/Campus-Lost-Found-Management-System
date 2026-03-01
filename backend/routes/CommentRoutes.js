// backend/routes/CommentRoutes.js

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams allows us to access :postId (or :itemId)

// --- IMPORTANT: UNCOMMENT/ADD THIS LINE ---
const { protect } = require('../middleware/authMiddleware'); // Make sure this path is correct for your 'protect' middleware

const { getCommentsForPost, createComment } = require('../controllers/commentController');

router.route('/')
    .get(getCommentsForPost) // GET comments: typically public, no 'protect' needed here
    // --- IMPORTANT: ADD 'protect' HERE ---
    .post(protect, createComment); // Add 'protect' middleware here to ensure user is authenticated

module.exports = router;
