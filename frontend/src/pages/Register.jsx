import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !role) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await register(name, email, password, role);
      if (response.success) {
        if (role === 'assistant') {
          navigate('/profile'); // Guides them to profile to fill in rate/location details
        } else {
          navigate('/explore');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try a different email address.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '40px 20px'
    }} className="animate-fade-in-up">
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px' }}>
        <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '8px' }}>Create Account</h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-current-secondary)',
          fontSize: '0.9rem',
          marginBottom: '32px'
        }}>
          Join CareNest to coordinate home & plant care
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
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="e.g., Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="e.g., jane@example.com"
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
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>I want to join as a:</label>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '4px'
            }}>
              <label style={{
                flex: 1,
                border: `1px solid ${role === 'client' ? 'var(--primary)' : 'var(--glass-current-border)'}`,
                background: role === 'client' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'center',
                textTransform: 'none',
                fontWeight: '600',
                color: role === 'client' ? 'var(--primary)' : 'var(--text-current-secondary)',
                fontSize: '0.9rem'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={role === 'client'}
                  onChange={() => setRole('client')}
                  style={{ display: 'none' }}
                />
                🏡 Homeowner / Client
              </label>

              <label style={{
                flex: 1,
                border: `1px solid ${role === 'assistant' ? 'var(--primary)' : 'var(--glass-current-border)'}`,
                background: role === 'assistant' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                textAlign: 'center',
                textTransform: 'none',
                fontWeight: '600',
                color: role === 'assistant' ? 'var(--primary)' : 'var(--text-current-secondary)',
                fontSize: '0.9rem'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="assistant"
                  checked={role === 'assistant'}
                  onChange={() => setRole('assistant')}
                  style={{ display: 'none' }}
                />
                🌿 Caretakers Assistant
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'var(--text-current-secondary)',
          fontSize: '0.9rem'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
