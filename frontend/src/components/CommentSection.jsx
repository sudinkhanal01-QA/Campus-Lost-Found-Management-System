import React, { useState, useEffect } from 'react';
import commentService from '../services/commentService';
import './CommentSection.css'; // We'll add some styles later

const Comment = ({ comment }) => (
    <div className="comment">
        <div className="comment-author">{comment.author?.name || 'Anonymous'}</div>
        <div className="comment-text">{comment.text}</div>
        <div className="comment-date">{new Date(comment.createdAt).toLocaleString()}</div>
    </div>
);

const CommentSection = ({ postId, user }) => {
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setIsLoading(true);
                const data = await commentService.getComments(postId);
                setComments(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim()) return;

        try {
            const newComment = await commentService.createComment(
                postId,
                { text: newCommentText },
                user.token // Assuming user object contains the token
            );
            setComments(prevComments => [...prevComments, newComment]);
            setNewCommentText('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="comment-section">
            <h4>Comments ({comments.length})</h4>
            {error && <p className="error-message">{error}</p>}

            <div className="comment-list">
                {isLoading && <p>Loading comments...</p>}
                {!isLoading && comments.length === 0 && <p>No comments yet. Be the first to comment!</p>}
                {comments.map(comment => <Comment key={comment._id} comment={comment} />)}
            </div>

            {user ? (
                <form onSubmit={handleSubmit} className="comment-form">
                    <textarea
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Add a public comment..."
                        rows="3"
                        required
                    />
                    <button type="submit" disabled={!newCommentText.trim()}>Comment</button>
                </form>
            ) : (
                <p>Please log in to post a comment.</p>
            )}
        </div>
    );
};

export default CommentSection;
