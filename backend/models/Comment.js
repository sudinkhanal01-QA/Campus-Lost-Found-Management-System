const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {
        type: String,
        required: [true, 'Comment text is required']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Make sure you have a 'User' model
        required: true
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post', // Make sure you have a 'Post' model
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
