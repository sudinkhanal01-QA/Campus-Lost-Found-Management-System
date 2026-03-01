// frontend/src/services/commentService.js

// Change this to the full URL of your backend API endpoint for posts
const API_URL = 'http://localhost:5000/api/items/'; // IMPORTANT: Use /api/items/ because your backend route is /api/items/:itemId/comments

/**
 * Fetches comments for a given post (or item, in your case).
 * @param {string} itemId The ID of the item/post.
 * @returns {Promise<any>} The comments data.
 */
const getComments = async (itemId) => { // Renamed postId to itemId for clarity
    // Correct URL construction: http://localhost:5000/api/items/<itemId>/comments
    const response = await fetch(`${API_URL}${itemId}/comments`);
    if (!response.ok) {
        throw new Error('Failed to fetch comments.');
    }
    return response.json();
};

/**
 * Creates a new comment on a post (or item, in your case).
 * @param {string} itemId The ID of the item/post.
 * @param {object} commentData The comment data (e.g., { text: '...' }).
 * @param {string} token The user's auth token.
 * @returns {Promise<any>} The newly created comment.
 */
const createComment = async (itemId, commentData, token) => { // Renamed postId to itemId for clarity
    // Correct URL construction: http://localhost:5000/api/items/<itemId>/comments
    const response = await fetch(`${API_URL}${itemId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // <--- IMPORTANT: Use the 'token' variable here
        },
        body: JSON.stringify(commentData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' })); // Catch JSON parse errors
        throw new Error(errorData.message || 'Failed to post comment.');
    }
    return response.json();
};

const commentService = {
    getComments,
    createComment
};

export default commentService;
