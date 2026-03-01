// frontend/src/pages/EditItem.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EditItem() {
  const { id } = useParams(); // Get item ID from URL
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [itemType, setItemType] = useState('lost');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [currentImages, setCurrentImages] = useState([]); // Existing images from the item
  const [newImages, setNewImages] = useState([]); // Newly selected images
  const [imagesToDelete, setImagesToDelete] = useState([]); // Images marked for deletion

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // For initial item fetch
  const [submitting, setSubmitting] = useState(false); // For form submission

  const MAX_IMAGE_SIZE_MB = 5;

  const categories = [
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
  ];

  useEffect(() => {
    const fetchItem = async () => {
      if (!isAuthenticated && !authLoading) { // Redirect if not authenticated and auth check is done
          navigate('/login');
          return;
      }
      if (authLoading) return; // Wait for auth status to load

      try {
        const response = await axios.get(`http://localhost:5000/api/items/${id}`, {
          withCredentials: true,
        });
        const itemData = response.data;

        // Check if user is authorized to edit this item
        if (itemData.user._id !== user.id && !isAdmin) {
            setError('You are not authorized to edit this item.');
            setLoading(false);
            return;
        }

        setItemType(itemData.type);
        setName(itemData.name);
        setCategory(itemData.category);
        setDescription(itemData.description);
        setLocation(itemData.location);
        setDate(itemData.date.substring(0, 10)); // Format date for input type="date"
        setCurrentImages(itemData.images || []);

      } catch (err) {
        console.error('Error fetching item for edit:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load item for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, user, isAuthenticated, isAdmin, authLoading, navigate]); // Depend on auth state and ID

  const handleNewFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    let sizeError = false;

    selectedFiles.forEach(file => {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Max size is ${MAX_IMAGE_SIZE_MB}MB.`);
        sizeError = true;
      } else {
        validFiles.push(file);
      }
    });

    if (sizeError) {
      setNewImages([]);
      e.target.value = null;
    } else {
      setNewImages(validFiles);
      setError('');
    }
  };

  const handleRemoveCurrentImage = (imagePath) => {
    setImagesToDelete(prev => [...prev, imagePath]);
    setCurrentImages(prev => prev.filter(img => img !== imagePath));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    if (!name || !category || !description || !location || !date) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('type', itemType);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('date', date);

    // Append new images
    newImages.forEach((file) => {
      formData.append('images', file);
    });

    // If all images are removed, send an empty array to backend
    if (currentImages.length === 0 && newImages.length === 0) {
        formData.append('images', '[]'); // Special indicator for backend to clear images
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/items/${id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message || 'Item updated successfully!');
      setTimeout(() => {
        navigate(`/items/${id}`); // Redirect to item detail page
      }, 1500);

    } catch (err) {
      console.error('Error updating item:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="report-item-container" style={{ textAlign: 'center' }}>
        <p>Loading item for editing...</p>
      </div>
    );
  }

  if (error && !item) { // Display error if item couldn't be loaded at all
    return (
      <div className="report-item-container" style={{ textAlign: 'center' }}>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="report-item-container">
      <h1 className="report-item-title">Edit Item: {name}</h1>
      <form onSubmit={handleSubmit} className="form-card">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        {submitting && <p className="info-message">Updating item...</p>}

        <div className="form-group">
          <label htmlFor="itemType" className="form-label">Item Type:</label>
          <select
            id="itemType"
            name="itemType"
            className="form-input"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            required
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name" className="form-label">Item Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category" className="form-label">Category:</label>
          <select
            id="category"
            name="category"
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select a Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea
            id="description"
            name="description"
            className="form-input"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="location" className="form-label">Location Lost/Found:</label>
          <input
            type="text"
            id="location"
            name="location"
            className="form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date" className="form-label">Date Lost/Found:</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Current Images:</label>
          {currentImages.length === 0 ? (
            <p style={{fontSize: '0.9em', color: '#666'}}>No current images.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {currentImages.map((imagePath, index) => (
                <div key={index} style={{ position: 'relative', width: '100px', height: '100px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
                  <img
                    src={`http://localhost:5000${imagePath}`}
                    alt={`Current image ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/e0e0e0/555555?text=No+Image'; }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCurrentImage(imagePath)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'rgba(220, 53, 69, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '25px',
                      height: '25px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontSize: '0.9em',
                      fontWeight: 'bold'
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newImages" className="form-label">Upload New Images (Optional):</label>
          <input
            type="file"
            id="newImages"
            name="newImages"
            className="form-input"
            accept="image/*"
            multiple
            onChange={handleNewFileChange}
          />
          {newImages.length > 0 && (
            <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
              New files selected: {newImages.map(file => file.name).join(', ')}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="button submit-button" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Item'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditItem;

