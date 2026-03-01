// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.token && storedUser.id) {
        setUser(storedUser);
        setLoading(false);
      } else {
        await checkAuthStatus();
      }
    };
    loadUserFromStorage();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/auth/status', {
        withCredentials: true,
        headers: {
          Authorization: user?.token ? `Bearer ${user.token}` : '',
        },
      });

      if (response.data.user) {
        const authenticatedUser = {
          ...response.data.user,
          token: user?.token || response.data.token,
        };
        setUser(authenticatedUser);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      console.error('Auth check failed:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password }, {
        withCredentials: true,
      });

      const { user: userData, token } = response.data;

      if (!token || !userData || !userData.id) {
        console.error("Login response missing token or user ID!");
        throw new Error("Login response did not provide a token or user ID.");
      }

      const userWithToken = { ...userData, token };
      setUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(userWithToken));

      return { success: true, message: response.data.message };
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      console.error('Login failed:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.get('http://localhost:5000/api/auth/logout', {
        withCredentials: true,
      });
      setUser(null);
      localStorage.removeItem('user');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Logout failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { username, email, password }, {
        withCredentials: true,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const authContextValue = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user && user.role === 'admin',
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Updated this block
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
