import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null; // Don't show navbar on login/register pages

  const isAdmin = user.role === 'ADMIN';

  const tabs = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'vehicles', label: 'Fleet', path: '/vehicles' },
        { id: 'bookings', label: 'Bookings', path: '/bookings' },
        { id: 'users', label: 'Users', path: '/users' },
        { id: 'reports', label: 'Reports', path: '/reports' },
        { id: 'profile', label: 'Profile', path: '/profile' }
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { id: 'newbooking', label: 'Book a Car', path: '/newbooking' },
        { id: 'bookings', label: 'My Bookings', path: '/bookings' },
        { id: 'profile', label: 'Profile', path: '/profile' }
      ];

  return (
    <nav className="nav">
      <Link to="/dashboard" className="nav-logo">
        Drive<span>Ease</span>
      </Link>
      
      <div className="nav-tabs">
        {tabs.map((t) => (
          <Link
            key={t.id}
            to={t.path}
            className={`nav-tab ${location.pathname === t.path ? 'active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', position: 'relative', marginTop: '5px' }}
          >
            🔔
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          
          {showNotifs && (
            <div style={{ position: 'absolute', top: '40px', right: '0', background: 'var(--card)', width: '300px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid var(--border)', zIndex: 100, maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', fontSize: '14px', color: 'var(--text)' }}>Notifications</div>
              {notifications.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--text3)', fontSize: '13px', textAlign: 'center' }}>No notifications</div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => { if (!n.read) markAsRead(n.id); }}
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: n.read ? 'transparent' : 'var(--bg2)', fontSize: '13px', transition: 'background 0.2s', color: 'var(--text)' }}
                  >
                    <div style={{ fontWeight: n.read ? 'normal' : '600' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="nav-avatar" style={{ marginLeft: '10px' }}>
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span>{user.username}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
