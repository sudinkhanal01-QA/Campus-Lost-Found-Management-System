// backend/controllers/commentController.js
const Comment = require('../models/Comment');
const Item = require('../models/Item'); // <--- CHANGE: Require the Item model
const asyncHandler = require('express-async-handler');

// @desc    Get all comments for a specific item
// @route   GET /api/items/:itemId/comments // <--- Adjusted route comment
// @access  Public
exports.getCommentsForPost = asyncHandler(async (req, res) => {
    // Assuming 'postId' in the route params actually refers to the itemId
    const comments = await Comment.find({ post: req.params.itemId }) // <--- CHANGE: Use req.params.itemId
        .populate('author', 'name profilePicture'); // Populate author's name and picture

    res.status(200).json(comments);
});

// @desc    Create a new comment on an item
// @route   POST /api/items/:itemId/comments // <--- Adjusted route comment
// @access  Private (should be protected)
exports.createComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { itemId } = req.params; // <--- CHANGE: Destructure itemId (from the route)
    const authorId = req.user.id; // Assuming this is set by your auth middleware

    if (!text) {
        res.status(400);
        throw new Error('Please provide text for the comment.');
    }

    // <--- CHANGE: Find the Item by its ID
    const item = await Item.findById(itemId); // <--- CHANGE: Use Item model and 'item' variable

    if (!item) { // <--- CHANGE: Check if item was found
        res.status(404);
        throw new Error('Item not found.'); // <--- CHANGE: More appropriate error message
    }

    const comment = await Comment.create({
        text,
        post: itemId, // This 'post' field in Comment model should ideally refer to 'Item'
        author: authorId
    });

    // <--- CHANGE: Add the comment reference to the item's comments array
    item.comments.push(comment._id); // <--- CHANGE: Push to item.comments
    await item.save(); // <--- CHANGE: Save the item

    // Populate the author details before sending the response
    const populatedComment = await comment.populate('author', 'name profilePicture');

    res.status(201).json(populatedComment);
});
