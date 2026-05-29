import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'CUSTOMER', gender: 'Male' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(formData.username, formData.email, formData.password, formData.role, formData.gender);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">Drive<span>Ease</span></div>
        <div className="login-sub">Vehicle Rental Management System</div>
        
        <div className="login-tabs">
          <Link to="/login" className="login-tab" style={{textDecoration: 'none', textAlign: 'center'}}>Sign In</Link>
          <Link to="/register" className="login-tab active" style={{textDecoration: 'none', textAlign: 'center'}}>Create Account</Link>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', textAlign: 'center'}}>{error}</div>}
          
          <label className="form-label">Username</label>
          <input 
            className="form-input" 
            type="text" 
            placeholder="johndoe"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />

          <label className="form-label">Email</label>
          <input 
            className="form-input" 
            type="email" 
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <label className="form-label">Password</label>
          <input 
            className="form-input" 
            type="password" 
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Role</label>
              <select 
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select 
                className="form-input"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{marginTop: '10px'}}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
