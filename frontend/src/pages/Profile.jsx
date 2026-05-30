import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [redeemPointsAmount, setRedeemPointsAmount] = useState(500);
  const [editForm, setEditForm] = useState({ email: '', gender: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfileData(res.data);
        
        if (user.role === 'CUSTOMER') {
          const loyaltyRes = await api.get('/loyalty/my');
          setLoyaltyData(loyaltyRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/users/me', editForm);
      setProfileData(res.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data || 'Failed to update profile');
    }
  };

  const handleRedeem = async () => {
    try {
      const res = await api.post(`/loyalty/redeem?points=${redeemPointsAmount}`);
      alert(`Success! Your promo code is: ${res.data.code}\nDiscount: ${res.data.discountPercentage}% off!`);
      const loyaltyRes = await api.get('/loyalty/my');
      setLoyaltyData(loyaltyRes.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data || 'Failed to redeem points');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone and you will lose all your booking history.")) {
      try {
        await api.delete('/users/me');
        alert("Your account has been deleted.");
        logout();
        navigate('/login');
      } catch (err) {
        console.error("Failed to delete account", err);
        alert("An error occurred while deleting your account.");
      }
    }
  };

  if (loading) return <div className="page active"><p>Loading profile...</p></div>;
  if (!user || !profileData) return null;

  return (
    <div className="page active">
      <div className="section-title" style={{ marginBottom: '20px' }}>My Profile</div>
      
      <div className="profile-card" style={{ background: 'var(--card)', borderRadius: 'var(--r)', padding: '24px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', maxWidth: '800px', margin: '0 auto' }}>
        <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
              {profileData.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text)' }}>{profileData.username}</h2>
              <div style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '4px' }}>Member since {new Date(profileData.createdAt).toLocaleDateString()}</div>
              
              {loyaltyData && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <span style={{ background: loyaltyData.membershipLevel === 'PLATINUM' ? '#e5e4e2' : loyaltyData.membershipLevel === 'GOLD' ? '#ffd700' : loyaltyData.membershipLevel === 'SILVER' ? '#c0c0c0' : '#cd7f32', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {loyaltyData.membershipLevel} TIER
                  </span>
                  <span style={{ background: 'var(--bg2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⭐ {loyaltyData.points} Points
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div className="profile-role" style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '4px', marginBottom: '8px' }}>
              {profileData.role === 'ADMIN' ? 'Administrator Account' : 'Customer Account'}
            </div>
            <span className={`badge badge-${profileData.role.toLowerCase()}`}>{profileData.role}</span>
          </div>
          
          <div>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSaveProfile} className="btn btn-green" style={{ fontWeight: '600' }}>💾 Save</button>
                <button onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ fontWeight: '600' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setEditForm({ email: profileData.email, gender: profileData.gender || '' }); setIsEditing(true); }} className="btn btn-outline" style={{ fontWeight: '600' }}>✏️ Edit Profile</button>
                <button onClick={handleDeleteAccount} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>⚠️ Delete Account</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          <div style={{ padding: '18px', background: 'var(--bg2)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>📧</span>
              <div style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
            </div>
            <div style={{ fontWeight: '500', fontSize: '15px', paddingLeft: '24px' }}>
              {isEditing ? (
                <input className="search-input" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', marginTop: '5px' }} />
              ) : profileData.email}
            </div>
          </div>

          <div style={{ padding: '18px', background: 'var(--bg2)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              <div style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</div>
            </div>
            <div style={{ fontWeight: '500', fontSize: '15px', paddingLeft: '24px' }}>
              {isEditing ? (
                <select className="filter-select" value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} style={{ width: '100%', marginTop: '5px' }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (profileData.gender || 'Not specified')}
            </div>
          </div>

          <div style={{ padding: '18px', background: 'var(--bg2)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🔑</span>
              <div style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Role</div>
            </div>
            <div style={{ fontWeight: '500', fontSize: '15px', paddingLeft: '24px' }}>{profileData.role}</div>
          </div>
          
          <div style={{ padding: '18px', background: 'var(--bg2)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>📅</span>
              <div style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Since</div>
            </div>
            <div style={{ fontWeight: '500', fontSize: '15px', paddingLeft: '24px' }}>
              {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Recently'}
            </div>
          </div>

        </div>
        
        {loyaltyData && !isEditing && (
          <div style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h3>Redeem Loyalty Points</h3>
            <p style={{ color: 'var(--text3)', fontSize: '14px', marginBottom: '16px' }}>Turn your points into discount promo codes! (500 pts = 5% off)</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="number" 
                min="500" 
                step="100" 
                value={redeemPointsAmount} 
                onChange={e => setRedeemPointsAmount(parseInt(e.target.value))} 
                style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '4px', width: '150px' }}
              />
              <button className="btn btn-brand" onClick={handleRedeem}>Redeem Points</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
