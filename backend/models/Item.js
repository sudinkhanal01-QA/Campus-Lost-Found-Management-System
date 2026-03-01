// backend/models/Item.js
const mongoose = require('mongoose');

const itemSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId, // Link to the User who reported the item
            required: true,
            ref: 'User', // Reference the User model
        },
        type: {
            type: String,
            enum: ['lost', 'found'], // Item can be 'lost' or 'found'
            required: [true, 'Please specify if the item is lost or found'],
        },
        name: {
            type: String,
            required: [true, 'Please add an item name'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            enum: [
                'Electronics',
                'Personal Accessories',
                'Documents',
                'Clothing',
                'Bags',
                'Keys',
                'Jewelry',
                'Wallets/Purses',
                'Books',
                'Other'
            ], // Example categories
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        location: {
            type: String,
            required: [true, 'Please specify where the item was lost/found'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Please add the date the item was lost/found'],
        },
        images: {
            type: [String], // Array of strings to store image paths/URLs
            default: [],
        },
        status: {
            type: String,
            enum: ['pending', 'claimed', 'returned', 'archived'], // Status of the item
            default: 'pending',
        },
        claimedBy: {
            type: mongoose.Schema.Types.ObjectId, // Link to the User who claimed the item
            ref: 'User',
            default: null,
        },
        claimDetails: {
            // Optional: details provided by the claimant for verification
            type: String,
            maxlength: [1000, 'Claim details cannot be more than 1000 characters'],
            default: null,
        },
        // --- ADD THIS NEW FIELD ---
        comments: [ // This defines 'comments' as an array
            {
                type: mongoose.Schema.Types.ObjectId, // Each element is an ObjectId
                ref: 'Comment', // It references documents in the 'Comment' collection
            },
        ],
        // --- END OF NEW FIELD ---
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

module.exports = mongoose.model('Item', itemSchema);
