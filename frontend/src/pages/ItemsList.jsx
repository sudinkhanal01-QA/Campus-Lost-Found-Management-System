// frontend/src/pages/ItemsList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation

function ItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // State for the image to display in modal

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/items', {
          withCredentials: true, // Important for sending cookies if needed (though this is a public route)
        });
        setItems(response.data);
      } catch (err) {
        console.error('Error fetching items:', err.response?.data || err.message);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return (
      <div className="items-list-container">
        <h1 className="items-list-title">All Lost & Found Items</h1>
        <p>Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="items-list-container">
        <h1 className="items-list-title">All Lost & Found Items</h1>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="items-list-container">
      <h1 className="items-list-title">All Lost & Found Items</h1>
      <p className="items-list-description">
        Browse through recently reported lost and found items.
      </p>

      {items.length === 0 ? (
        <p>No items found. Be the first to report one!</p>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <div className="item-image-container" onClick={() => item.images && item.images.length > 0 && openModal(`http://localhost:5000${item.images[0]}`)}>
                {item.images && item.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${item.images[0]}`} // Assuming backend serves images from /uploads
                    alt={item.name}
                    className="item-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/e0e0e0/555555?text=No+Image'; }}
                  />
                ) : (
                  <img
                    src="https://placehold.co/400x300/e0e0e0/555555?text=No+Image"
                    alt="No Image Available"
                    className="item-image"
                  />
                )}
                {/* Display status badge if claimed, otherwise type badge */}
                {item.status === 'claimed' ? (
                  <span className="item-type-badge status-claimed-badge">CLAIMED</span>
                ) : (
                  <span className={`item-type-badge ${item.type}`}>{item.type.toUpperCase()}</span>
                )}
              </div>
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-category">Category: {item.category}</p>
                <p className="item-location">Location: {item.location}</p>
                <p className="item-date">Date: {new Date(item.date).toLocaleDateString()}</p>
                <p className="item-status">Status: <span className={`status-${item.status}`}>{item.status.toUpperCase()}</span></p>
                <p className="item-description">{item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}</p>
                <Link to={`/items/${item._id}`} className="button primary-button item-view-button">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Full size item" className="full-size-image" />
            <button className="close-modal-button" onClick={closeModal}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemsList;
