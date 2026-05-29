import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        username,
        email,
        newPassword
      });
      setSuccess(response.data);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data || 'Failed to reset password. Please check your username and email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">Drive<span>Ease</span></div>
        <div className="login-sub">Vehicle Rental Management System</div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontFamily: '"Syne", sans-serif' }}>Reset Password</h2>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginBottom: '20px' }}>
          Enter your registered username and email address to set a new password.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div style={{color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', textAlign: 'center'}}>{error}</div>}
          {success && <div style={{color: 'var(--success)', fontSize: '13px', marginBottom: '16px', textAlign: 'center'}}>{success}</div>}
          
          <label className="form-label">Username</label>
          <input 
            className="form-input" 
            type="text" 
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label className="form-label">Email Address</label>
          <input 
            className="form-input" 
            type="email" 
            placeholder="johndoe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <label className="form-label">New Password</label>
          <input 
            className="form-input" 
            type="password" 
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
