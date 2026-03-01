// frontend/src/components/Layout.jsx
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { success, message } = await logout();
    if (success) {
      console.log(message);
      navigate('/login');
    } else {
      console.error(message);
    }
  };

  if (loading) {
    return (
      <div className="layout-container flex justify-center items-center min-h-screen">
        <p className="info-message">Loading authentication status...</p>
      </div>
    );
  }

  return (
    <div className="layout-container"> {/* Use your custom layout container class */}
      <header className="main-header"> {/* Use your custom header class */}
        <div className="header-content"> {/* Use your custom header content class */}
          <Link to="/" className="site-title">Lost & Found Portal</Link> {/* Use your custom title class */}
          <nav>
            <ul className="nav-links"> {/* Use your custom nav links class */}
              <li>
                <Link to="/" className="nav-item">Home</Link> {/* Use your custom nav item class */}
              </li>
              <li>
                <Link to="/items" className="nav-item">View Lost/Found Items</Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/report" className="nav-item">Report Item</Link>
                </li>
              )}
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    Welcome, {user.username} ({user.role})
                  </li>
                  <li>
                    <button onClick={handleLogout} className="button secondary-button"> {/* Use your custom button classes */}
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="nav-item">Login</Link>
                  </li>
                  <li>
                    <Link to="/register" className="nav-item">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content"> {/* Use your custom main content class */}
         <Outlet /> 
      </main>

      <footer className="main-footer"> {/* Use your custom footer class */}
        <div className="footer-content"> {/* Use your custom footer content class */}
          &copy; {new Date().getFullYear()} Lost & Found Portal
        </div>
      </footer>
    </div>
  );
}

export default Layout;
