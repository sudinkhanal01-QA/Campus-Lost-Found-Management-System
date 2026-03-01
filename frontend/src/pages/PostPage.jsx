import React from 'react';
import { useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux'; // Or however you access user state
import Post from '../components/Post'; // Your existing component for post details
import CommentSection from '../components/commentSection';

const PostPage = () => {
    const { postId } = useParams();
    // const { user } = useSelector(state => state.auth); // Example of getting user state
    
    // For demonstration, let's create a mock user object.
    // In your app, this would come from your authentication state (Context, Redux, etc.)
    const user = {
        name: 'Test User',
        token: 'your-jwt-token' // This should be the actual user token
    };

    return (
        <div className="post-page-container">
            <Post postId={postId} />
            <hr />
            <CommentSection postId={postId} user={user} />
        </div>
    );
};

export default PostPage;
