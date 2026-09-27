import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLightMode, setIsLightMode] = useState(false);

  // Set default theme state on load
  useEffect(() => {
    const isLight = document.body.classList.contains('light-theme');
    setIsLightMode(isLight);
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
    setIsLightMode(!isLightMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem', fontWeight: '800', color: '#1E5631', textDecoration: 'none' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
          <g fill="#1E5631">
            <circle cx="32" cy="56" r="16" />
            <circle cx="22" cy="64" r="12" />
            <circle cx="38" cy="66" r="11" />
            <rect x="62" y="24" width="8" height="18" rx="1" />
            <path d="M 58 18 L 92 48 L 84 48 L 58 25 L 32 48 L 24 48 Z" />
            <rect x="36" y="46" width="48" height="38" rx="2" />
            <rect x="16" y="82" width="68" height="6" rx="3" />
          </g>
        </svg>
        CareNest
      </Link>

      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          Home
        </Link>
        
        {/* Explore link available to all except assistants */}
        {(!user || user.role === 'client') && (
          <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`}>
            Find Assistants
          </Link>
        )}

        {user && user.role === 'client' && (
          <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
            My Bookings
          </Link>
        )}

        {user && user.role === 'assistant' && (
          <Link to="/assistant-dashboard" className={`nav-link ${isActive('/assistant-dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
        )}

        {user && user.role === 'admin' && (
          <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`}>
            Admin Panel
          </Link>
        )}

        {user && (
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
            Profile
          </Link>
        )}

        <button 
          onClick={toggleTheme} 
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            padding: '4px 8px',
            marginLeft: '8px'
          }}
          title="Toggle Light/Dark Theme"
        >
          {isLightMode ? '🌙' : '☀️'}
        </button>

        {user ? (
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            Logout
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>
              Join Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
