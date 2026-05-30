import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [require2fa, setRequire2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const navigate = useNavigate();
  const { login, verify2fa, user } = useContext(AuthContext);

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
      if (require2fa) {
        await verify2fa(username, password, twoFactorCode);
        navigate('/dashboard');
      } else {
        const res = await login(username, password);
        if (res.accessToken === 'REQUIRE_2FA') {
          setRequire2fa(true);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please check your credentials.');
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
          <Link to="/login" className="login-tab active" style={{textDecoration: 'none', textAlign: 'center'}}>Sign In</Link>
          <Link to="/register" className="login-tab" style={{textDecoration: 'none', textAlign: 'center'}}>Create Account</Link>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', textAlign: 'center'}}>{error}</div>}
          
          <label className="form-label">Username</label>
          <input 
            className="form-input" 
            type="text" 
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
          </div>
          <input 
            className="form-input" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {require2fa && (
            <>
              <div style={{ padding: '10px', background: '#ebf4ff', color: '#2b6cb0', borderRadius: '4px', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>
                A 2FA code has been sent to your device. Please enter it below.
              </div>
              <label className="form-label">2FA Code</label>
              <input 
                className="form-input" 
                type="text" 
                placeholder="6-digit code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                required
              />
            </>
          )}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (require2fa ? 'Verifying...' : 'Signing in...') : (require2fa ? 'Verify 2FA' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
