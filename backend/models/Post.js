const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    // ... your existing post schema fields
    title: String,
    content: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },

    // Add this field
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
