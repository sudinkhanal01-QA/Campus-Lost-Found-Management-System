// backend/controllers/itemController.js
const Item = require('../models/Item');
const User = require('../models/User');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');

const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const handleImageUpload = (req) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({
            multiples: true,
            uploadDir: uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024,
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Formidable error:", err);
                return reject(err);
            }

            const imagePaths = [];
            if (files.images) {
                const fileArray = Array.isArray(files.images) ? files.images : [files.images];
                fileArray.forEach(file => {
                    const oldPath = file.filepath;
                    const newFileName = `${file.newFilename}`;
                    const newPath = path.join(uploadDir, newFileName);
                    fs.renameSync(oldPath, newPath);
                    imagePaths.push(`/uploads/${newFileName}`);
                });
            }
            const processedFields = {};
            for (const key in fields) {
                processedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
            }
            resolve({ fields: processedFields, imagePaths: imagePaths });
        });
    });
};

const getItems = asyncHandler(async (req, res) => {
    const items = await Item.find({}).populate('user', 'username email').populate('claimedBy', 'username email');
    res.status(200).json(items);
});

const getItemById = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id).populate('user', 'username email').populate('claimedBy', 'username email');
    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }
    res.status(200).json(item);
});

const createItem = asyncHandler(async (req, res) => {
    const { fields, imagePaths } = await handleImageUpload(req);
    const { type, name, category, description, location, date } = fields;

    if (!type || !name || !category || !description || !location || !date) {
        imagePaths.forEach(imgPath => {
            const fullPath = path.join(__dirname, '../public', imgPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
        res.status(400);
        throw new Error('Please include all required fields: type, name, category, description, location, date.');
    }

    const item = new Item({
        user: req.user.id,
        type: type,
        name: name,
        category: category,
        description: description,
        location: location,
        date: new Date(date),
        images: imagePaths,
        status: 'pending',
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
});

const updateItem = asyncHandler(async (req, res) => {
    const { fields, imagePaths } = await handleImageUpload(req);
    const updates = {};
    for (const key in fields) {
        updates[key] = fields[key];
    }

    let item = await Item.findById(req.params.id);

    if (!item) {
        imagePaths.forEach(imgPath => {
            const fullPath = path.join(__dirname, '../public', imgPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
        res.status(404);
        throw new Error('Item not found');
    }

    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
        imagePaths.forEach(imgPath => {
            const fullPath = path.join(__dirname, '../public', imgPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
        res.status(403);
        throw new Error('Not authorized to update this item');
    }

    if (imagePaths.length > 0) {
        item.images.forEach(oldImgPath => {
            const fullPath = path.join(__dirname, '../public', oldImgPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
        updates.images = imagePaths;
    } else if (updates.hasOwnProperty('images') && updates.images === '[]') {
        item.images.forEach(oldImgPath => {
            const fullPath = path.join(__dirname, '../public', oldImgPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
        updates.images = [];
    } else {
        delete updates.images;
    }

    item = await Item.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json(item);
});

const deleteItem = asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this item');
    }

    item.images.forEach(imgPath => {
        const fullPath = path.join(__dirname, '../public', imgPath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    });

    await item.deleteOne();
    res.status(200).json({ message: 'Item removed successfully' });
});

const claimItem = asyncHandler(async (req, res) => {
    const { claimDetails } = req.body;

    let item = await Item.findById(req.params.id);

    if (!item) {
        res.status(404);
        throw new Error('Item not found');
    }

    if (item.status !== 'pending') {
        res.status(400);
        throw new Error(`Item is already ${item.status}`);
    }

    if (item.user && item.user.toString() === req.user.id) {
        res.status(400);
        throw new Error('You cannot claim an item you reported');
    }

    item.status = 'claimed';
    item.claimedBy = req.user.id;
    item.claimDetails = claimDetails;

    await item.save();
    res.status(200).json({ message: 'Item claimed successfully', item });
});

const approveClaim = (io, users) => asyncHandler(async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        if (item.status !== 'claimed') {
            res.status(400);
            throw new Error('Item is not in "claimed" status');
        }

        // --- ADDED DEBUG LOGS ---
        console.log('Approve Claim: Item ID:', item._id);
        console.log('Approve Claim: Current item.claimedBy (before update):', item.claimedBy);
        // --- END DEBUG LOGS ---

        const originalClaimedBy = item.claimedBy;

        item.status = 'returned';
        item.claimedBy = null;
        item.claimDetails = null;
        await item.save();

        // --- ADDED DEBUG LOGS ---
        console.log('Approve Claim: originalClaimedBy (for notification):', originalClaimedBy);
        // --- END DEBUG LOGS ---

        const recipientId = originalClaimedBy;
        const recipientSocketId = users[recipientId];

        // --- ADDED DEBUG LOGS ---
        console.log('Approve Claim: Looking for recipientSocketId for:', recipientId);
        console.log('Approve Claim: Found recipientSocketId:', recipientSocketId);
        console.log('Approve Claim: Current users map:', users); // Inspect the whole map
        // --- END DEBUG LOGS ---

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('claimStatusUpdate', {
                claimId: item._id,
                status: 'approved',
                message: `Your claim for "${item.name}" has been approved!`,
            });
            console.log(`Approve Claim: Notification emitted to socket ${recipientSocketId} for claim ${item._id}`);
        } else {
            console.log(`Approve Claim: Recipient ${recipientId} is not online or socket ID not found.`);
        }

        res.status(200).json({ message: 'Item claim approved and status set to returned', item });

    } catch (error) {
        console.error(error);
        if (error.name === 'CastError') {
            res.status(400);
            throw new Error('Invalid item ID format');
        }
        res.status(500);
        throw new Error('Server error: Could not approve claim.');
    }
});

const rejectClaim = (io, users) => asyncHandler(async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) {
            res.status(404);
            throw new Error('Item not found');
        }

        if (item.status !== 'claimed') {
            res.status(400);
            throw new Error('Item is not in "claimed" status');
        }

        // --- ADDED DEBUG LOGS ---
        console.log('Reject Claim: Item ID:', item._id);
        console.log('Reject Claim: Current item.claimedBy (before update):', item.claimedBy);
        // --- END DEBUG LOGS ---

        const originalClaimedBy = item.claimedBy;

        item.status = 'lost';
        item.claimedBy = null;
        item.claimDetails = null;
        await item.save();

        // --- ADDED DEBUG LOGS ---
        console.log('Reject Claim: originalClaimedBy (for notification):', originalClaimedBy);
        // --- END DEBUG LOGS ---

        const recipientId = originalClaimedBy;
        const recipientSocketId = users[recipientId];

        // --- ADDED DEBUG LOGS ---
        console.log('Reject Claim: Looking for recipientSocketId for:', recipientId);
        console.log('Reject Claim: Found recipientSocketId:', recipientSocketId);
        console.log('Reject Claim: Current users map:', users); // Inspect the whole map
        // --- END DEBUG LOGS ---

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('claimStatusUpdate', {
                claimId: item._id,
                status: 'rejected',
                message: `Your claim for "${item.name}" has been rejected.`,
            });
        } else {
            console.log(`Reject Claim: Recipient ${recipientId} is not online or socket ID not found.`);
        }

        res.status(200).json({ message: 'Item claim rejected and status reset.', item });

    } catch (error) {
        console.error(error);
        if (error.name === 'CastError') {
            res.status(400);
            throw new Error('Invalid item ID format');
        }
        res.status(500);
        throw new Error('Server error: Could not reject claim.');
    }
});

module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    claimItem,
    approveClaim,
    rejectClaim,
};
