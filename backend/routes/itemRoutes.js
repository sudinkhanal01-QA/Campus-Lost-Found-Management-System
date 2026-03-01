// backend/routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    claimItem,
    approveClaim,
    rejectClaim, // 👈 Import the new rejectClaim function
} = require('../controllers/itemController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import our new middleware

// The module now exports a function that takes 'io' and 'users'
// This allows us to pass the Socket.IO instance and user map to the controller functions
module.exports = (io, users) => { // 👈 Modified export structure
    // Public routes (anyone can view items)
    router.get('/', getItems);
    router.get('/:id', getItemById);

    // Private routes (require authentication)
    router.post('/', protect, createItem); // Only authenticated users can create
    router.put('/:id', protect, updateItem); // Owner or admin can update
    router.delete('/:id', protect, deleteItem); // Owner or admin can delete

    // Specific action routes
    router.put('/:id/claim', protect, claimItem); // Authenticated users can claim

    // Admin routes for approving/rejecting claims
    // We now pass 'io' and 'users' to the controller functions
    router.put('/:id/approve-claim', protect, authorizeRoles('admin'), approveClaim(io, users)); // 👈 Modified
    router.put('/:id/reject-claim', protect, authorizeRoles('admin'), rejectClaim(io, users));   // 👈 Added

    return router;
};
