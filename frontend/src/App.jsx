// frontend/src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ItemsList from './pages/ItemsList';
import ReportItem from './pages/ReportItem';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import EditItem from './pages/EditItem'; // 👈 Import the EditItem component
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';

import io from 'socket.io-client';
import { toast } from 'react-toastify';

const socket = io('http://localhost:5000', { autoConnect: false }); 

function App() {
  const { user, isAuthenticated, loading } = useAuth(); 

  useEffect(() => {
    console.log('App.jsx useEffect triggered:');
    console.log('  loading:', loading);
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  user:', user);
    console.log('  user.id:', user ? user.id : 'N/A');
    
    if (!loading && isAuthenticated && user && user.id) {
      console.log('Attempting Socket.IO connection and login...');
      
      if (!socket.connected) {
        socket.connect();
      }

      socket.on('connect', () => {
        console.log('Connected to backend Socket.IO server!');
        socket.emit('login', user.id); 
        console.log(`Emitted 'login' event with user ID: ${user.id}`);
      });

      socket.on('claimStatusUpdate', (data) => {
        console.log('Notification received:', data);
        if (data.status === 'approved') {
          toast.success(data.message);
        } else if (data.status === 'rejected') {
          toast.error(data.message);
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from backend Socket.IO server.');
      });

      return () => {
        socket.off('connect');
        socket.off('claimStatusUpdate');
        socket.off('disconnect');
      };
    } else {
      if (socket.connected) {
        console.log('User not authenticated or loading, disconnecting socket.');
        socket.disconnect();
      }
    }
  }, [loading, isAuthenticated, user]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="items" element={<ItemsList />} />
        <Route path="items/:id" element={<ItemDetail />} />
        {/* 👈 ADD THIS NEW ROUTE FOR EDITING ITEMS */}
        <Route 
          path="items/:id/edit" 
          element={<PrivateRoute><EditItem /></PrivateRoute>} 
        /> 
        <Route path="report" element={<PrivateRoute><ReportItem /></PrivateRoute>} /> 
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;
