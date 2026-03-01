// frontend/src/main.jsx
import 'react-toastify/dist/ReactToastify.css'; // Global CSS for react-toastify
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Your main application component
import './index.css'; // Your global CSS

import { BrowserRouter } from 'react-router-dom'; // Only BrowserRouter is needed here

// Import AuthProvider for authentication context
import { AuthProvider } from './context/AuthContext.jsx';

import { ToastContainer } from 'react-toastify'; // Import ToastContainer here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode> {/* Good practice for highlighting potential problems */}
    <BrowserRouter> {/* Provides routing capabilities to the app */}
      <AuthProvider> {/* Wraps the entire application with AuthProvider for authentication context */}
        {/* Render the main App component */}
        <App /> 
        {/* ToastContainer for displaying notifications globally */}
        <ToastContainer 
          position="top-right" 
          autoClose={5000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
