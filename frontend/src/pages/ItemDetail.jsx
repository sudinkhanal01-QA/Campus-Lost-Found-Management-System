// frontend/src/pages/ItemDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import CommentSection from '../components/CommentSection'; // <--- IMPORT THIS LINE

function ItemDetail() {
  const { id } = useParams(); // Get item ID from URL (this is your itemId/postId)
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // <--- Use your actual user from AuthContext

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success messages
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimDetails, setClaimDetails] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // For full-size image modal

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/items/${id}`, {
          withCredentials: true,
        });
        setItem(response.data);
      } catch (err) {
        console.error('Error fetching item details:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/items/${id}`, {
          withCredentials: true,
        });
        setMessage(response.data.message || 'Item deleted successfully!');
        setTimeout(() => {
          navigate('/items'); // Redirect to items list after deletion
        }, 1500);
      } catch (err) {
        console.error('Error deleting item:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to delete item.');
      }
    }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.put(`http://localhost:5000/api/items/${id}/claim`, { claimDetails }, {
        withCredentials: true,
      });
      setMessage(response.data.message || 'Item claimed successfully!');
      setItem(prevItem => ({ ...prevItem, status: 'claimed', claimedBy: user, claimDetails: claimDetails })); // Update local state
      setShowClaimModal(false);
      setClaimDetails('');
    } catch (err) {
      console.error('Error claiming item:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to claim item.');
    }
  };

  const handleApproveClaim = async () => {
    if (window.confirm('Are you sure you want to approve this claim and mark the item as returned?')) {
      try {
        const response = await axios.put(`http://localhost:5000/api/items/${id}/approve-claim`, {}, {
          withCredentials: true,
        });
        setMessage(response.data.message || 'Claim approved and item marked as returned!');
        setItem(prevItem => ({ ...prevItem, status: 'returned' })); // Update local state
      } catch (err) {
        console.error('Error approving claim:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to approve claim.');
      }
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading || authLoading) {
    return (
      <div className="item-detail-container" style={{ textAlign: 'center' }}>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="item-detail-container" style={{ textAlign: 'center' }}>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="item-detail-container" style={{ textAlign: 'center' }}>
        <p>Item not found.</p>
      </div>
    );
  }

  // Determine if current user is the owner
  const isOwner = isAuthenticated && user && item.user && user.id === item.user._id;
  const isAdmin = isAuthenticated && user && user.role === 'admin';

  return (
    <div className="item-detail-container">
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="item-detail-header">
        <h1 className="item-detail-title">{item.name}</h1>
        <div className="item-detail-meta">
          <p>Reported by: {item.user ? item.user.username : 'Unknown'}</p>
          <p>Type: <span className={`item-type-badge ${item.type}`}>{item.type.toUpperCase()}</span></p>
          <p>Status: <span className={`status-${item.status}`}>{item.status.toUpperCase()}</span></p>
        </div>
      </div>

      <div className="item-detail-section">
        <h4>Description</h4>
        <p>{item.description}</p>
      </div>

      <div className="item-detail-section">
        <h4>Location & Date</h4>
        <p><strong>Location:</strong> {item.location}</p>
        <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
        <p><strong>Category:</strong> {item.category}</p>
      </div>

      {item.images && item.images.length > 0 && (
        <div className="item-detail-section">
          <h4>Images</h4>
          <div className="item-detail-image-gallery">
            {item.images.map((imagePath, index) => (
              <img
                key={index}
                src={`http://localhost:5000${imagePath}`}
                alt={`${item.name} image ${index + 1}`}
                className="item-detail-image"
                onClick={() => openImageModal(`http://localhost:5000${imagePath}`)}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/e0e0e0/555555?text=No+Image'; }}
              />
            ))}
          </div>
        </div>
      )}

      {item.status === 'claimed' && item.claimedBy && (
        <div className="item-detail-section">
          <h4>Claim Details</h4>
          <p><strong>Claimed By:</strong> {item.claimedBy.username}</p>
          <p><strong>Claim Message:</strong> {item.claimDetails}</p>
        </div>
      )}

      <div className="item-detail-actions">
        {/* Only owner or admin can edit/delete */}
        {(isOwner || isAdmin) && (
          <>
            <Link to={`/items/${item._id}/edit`} className="button secondary-button">Edit Post</Link>
            <button onClick={handleDelete} className="button primary-button">Delete Post</button>
          </>
        )}

        {/* Claim button for others if item is pending */}
        {isAuthenticated && !isOwner && item.status === 'pending' && (
          <button onClick={() => setShowClaimModal(true)} className="button submit-button">Claim Item</button>
        )}

        {/* Admin can approve claim if item is claimed */}
        {isAdmin && item.status === 'claimed' && (
          <button onClick={handleApproveClaim} className="button primary-button">Approve Claim</button>
        )}
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="claim-modal-overlay" onClick={() => setShowClaimModal(false)}>
          <div className="claim-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="claim-modal-close-button" onClick={() => setShowClaimModal(false)}>&times;</button>
            <h3>Claim "{item.name}"</h3>
            <form onSubmit={handleClaim}>
              <div className="form-group">
                <label htmlFor="claimDetails" className="form-label">Provide details to verify your claim:</label>
                <textarea
                  id="claimDetails"
                  className="form-input"
                  rows="5"
                  value={claimDetails}
                  onChange={(e) => setClaimDetails(e.target.value)}
                  placeholder="e.g., Describe unique features, contents, or circumstances of loss/finding."
                  required
                ></textarea>
              </div>
              <div className="claim-modal-actions">
                <button type="button" className="button secondary-button" onClick={() => setShowClaimModal(false)}>Cancel</button>
                <button type="submit" className="button submit-button">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-size Image Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full size item" className="full-size-image" />
            <button className="close-modal-button" onClick={closeImageModal}>&times;</button>
          </div>
        </div>
      )}

      {/* <--- ADD COMMENT SECTION HERE --- > */}
      <hr style={{ margin: '40px 0' }} /> {/* Optional: add a separator */}
      <CommentSection
        postId={id} // Pass the item's ID as the postId to your CommentSection
        user={user} // Pass the actual user object from your AuthContext
      />
      {/* <--- END COMMENT SECTION --- > */}

    </div>
  );
}

export default ItemDetail;
