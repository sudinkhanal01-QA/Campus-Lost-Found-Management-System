// frontend/src/pages/ReportItem.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ReportItem() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [itemType, setItemType] = useState('lost');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!name || !category || !description || !location || !date) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
        setError('You must be logged in to report an item.');
        setLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('type', itemType);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('date', date);

    images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/items', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message || 'Item reported successfully!');
      setItemType('lost');
      setName('');
      setCategory('');
      setDescription('');
      setLocation('');
      setDate('');
      setImages([]);
      
      setTimeout(() => {
        navigate('/items');
      }, 2000);

    } catch (err) {
      console.error('Error reporting item:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to report item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use your custom CSS classes for centering and styling
    <div className="report-item-container"> {/* This class is defined in your index.css */}
      <div className="form-card"> {/* This class is defined in your index.css for card-like forms */}
        <h2 className="report-item-title">Report a Lost or Found Item</h2> {/* Use your title class */}

        <form onSubmit={handleSubmit}>
          {message && <p className="success-message">{message}</p>} {/* Use your message classes */}
          {error && <p className="error-message">{error}</p>}
          {loading && <p className="info-message">Submitting item...</p>} {/* Use your info message class */}

          <div className="form-group">
            <label htmlFor="itemType" className="form-label">Item Type:</label>
            <select
              id="itemType"
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
              className="form-input"
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
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="images" className="form-label">Upload Images (Optional):</label>
            <input
              type="file"
              id="images"
              className="form-input"
              multiple
              onChange={handleFileChange}
              accept="image/*"
            />
            {images.length > 0 && (
              <p className="text-gray-600 text-xs mt-2">Selected: {images.map(file => file.name).join(', ')}</p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button submit-button" // Use your custom button classes
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Report Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportItem;
