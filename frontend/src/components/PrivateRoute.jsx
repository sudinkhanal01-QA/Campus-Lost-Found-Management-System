// frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => { // 👈 Changed 'element' to 'children'
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // Optionally render a loading spinner or message while checking auth status
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login page
    return <Navigate to="/login" replace />; // 👈 Corrected Navigate syntax
  }

  // If roles are specified and user's role is not included
  if (roles && user && !roles.includes(user.role)) {
    // Authenticated but not authorized, redirect to home or an unauthorized page
    return <Navigate to="/" replace />; // 👈 Corrected Navigate syntax (redirect to home)
  }

  // Authenticated and authorized, render the children (the protected component)
  return children; // 👈 Render children instead of element
};

export default PrivateRoute;
