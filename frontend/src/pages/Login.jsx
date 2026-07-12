import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    try {
      const response = await login(email, password);
      if (response.success && response.user) {
        const { role } = response.user;
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else if (role === 'assistant') {
          navigate('/assistant-dashboard');
        } else {
          navigate('/explore');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 20px'
    }} className="animate-fade-in-up">
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-current-secondary)',
          fontSize: '0.9rem',
          marginBottom: '32px'
        }}>
          Sign in to coordinate plant and home care
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="e.g., client1@flora.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'var(--text-current-secondary)',
          fontSize: '0.9rem'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign Up
          </Link>
        </p>

        {/* Quick Demo Accounts Helper */}
        <div style={{
          marginTop: '32px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--glass-current-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          fontSize: '0.82rem',
          color: 'var(--text-current-secondary)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-current-primary)' }}>
            💡 Demo Accounts (Password: <code>password123</code>):
          </div>
          <ul style={{ paddingLeft: '16px', margin: 0 }}>
            <li>Client: <code>client1@flora.com</code></li>
            <li>Assistant: <code>assistant1@flora.com</code></li>
            <li>Admin: <code>admin@flora.com</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
