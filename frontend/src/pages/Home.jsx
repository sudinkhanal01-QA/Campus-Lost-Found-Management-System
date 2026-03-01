// frontend/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page-container">
      <h1 className="home-title">Welcome to the Lost & Found Portal!</h1>
      <p className="home-description">
        Helping you reconnect with your lost belongings or report items you've found.
      </p>
      <div className="home-buttons">
        <Link to="/items" className="button primary-button">
          View All Items
        </Link>
        <Link to="/report" className="button secondary-button">
          Report an Item
        </Link>
      </div>
    </div>
  );
}

export default Home;
