import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getVehicleImage, getAllVehicleImages } from '../utils/imageHelpers';

const NewBooking = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const currentUsername = localStorage.getItem('username');
  
  // Modal state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 864e5).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [couponCode, setCouponCode] = useState('');
  const [branches, setBranches] = useState([]);
  const [returnBranchId, setReturnBranchId] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const [vehRes, branchRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/branches')
        ]);
        setVehicles(vehRes.data);
        setBranches(branchRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const availableVehicles = vehicles.filter(v => !typeFilter || v.transmission === typeFilter || v.description === typeFilter);

  const handleSubmitBooking = async () => {
    if (!selectedVehicle) return;
    if (new Date(endDate) <= new Date(startDate)) {
      alert("Return date must be after pickup date");
      return;
    }
    if (!selectedVehicle.currentBranch) {
      alert("This vehicle does not have an assigned branch. Cannot be booked.");
      return;
    }
    if (!returnBranchId) {
      alert("Please select a return branch.");
      return;
    }
    try {
      await api.post('/bookings', {
        vehicleId: selectedVehicle.id,
        startDate,
        endDate,
        couponCode,
        pickupBranchId: selectedVehicle.currentBranch.id,
        returnBranchId: parseInt(returnBranchId)
      });
      alert('Booking request sent! Waiting for Admin approval.');
      navigate('/bookings');
    } catch (err) {
      console.error(err);
      alert('Failed to submit booking request');
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedVehicle) return;
    try {
      await api.post(`/waitlist/vehicle/${selectedVehicle.id}`);
      alert('You have joined the waitlist! We will notify you when this vehicle becomes available.');
      setSelectedVehicle(null);
    } catch (err) {
      console.error(err);
      alert('Failed to join waitlist');
    }
  };

  const fetchReviews = async (vehicleId) => {
    try {
      const res = await api.get(`/reviews/vehicle/${vehicleId}`);
      setReviews(res.data);
      const statsRes = await api.get(`/reviews/vehicle/${vehicleId}/stats`);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  const submitReview = async () => {
    if (!newReview.comment) return;
    try {
      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, newReview);
        setEditingReviewId(null);
      } else {
        await api.post(`/reviews/vehicle/${selectedVehicle.id}`, newReview);
      }
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(selectedVehicle.id);
      alert(editingReviewId ? 'Review updated!' : 'Review submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await api.delete(`/reviews/mine/${id}`);
      fetchReviews(selectedVehicle.id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete review');
    }
  };

  const startEditing = (r) => {
    setEditingReviewId(r.id);
    setNewReview({ rating: r.rating, comment: r.comment });
  };

  if (loading) return <div className="page active" style={{color: '#fff', background: '#121212'}}><p>Loading vehicles...</p></div>;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 60px)', padding: '40px 20px', fontFamily: '"DM Sans", sans-serif', color: '#1a202c' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <h1 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '600', marginBottom: '30px', fontFamily: '"Syne", sans-serif' }}>
          <span style={{ color: '#718096' }}>Our </span>Rental Fleets
        </h1>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {['ALL', 'VANITY VAN', 'SEDAN', 'COMPACT', 'CROSSOVER'].map(filter => (
            <button 
              key={filter}
              onClick={() => setTypeFilter(filter === 'ALL' ? '' : filter)}
              style={{
                padding: '8px 24px',
                background: typeFilter === filter || (filter === 'ALL' && !typeFilter) ? '#3182ce' : 'transparent',
                color: typeFilter === filter || (filter === 'ALL' && !typeFilter) ? '#fff' : '#4a5568',
                border: typeFilter === filter || (filter === 'ALL' && !typeFilter) ? '1px solid #3182ce' : '1px solid #cbd5e0',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '1px'
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {availableVehicles.map(v => (
            <div key={v.id} style={{ border: '1px solid #e2e8f0', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              
              <div style={{ height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <img 
                  src={getVehicleImage(v)} 
                  alt={v.brand} 
                  style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} 
                />
                {getAllVehicleImages(v).length > 1 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    {getAllVehicleImages(v).slice(0, 4).map((img, idx) => (
                      <div key={idx} style={{ width: '30px', height: '20px', background: '#f5f5f5', borderRadius: '2px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h3 style={{ textAlign: 'center', fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#1a202c' }}>
                {v.brand} {v.model}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>🛣️</div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>{Math.floor(Math.random() * 5000) + 1000}</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>⛽</div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>{v.fuelType || 'Hybrid'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚙️</div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>{v.transmission || 'Automatic'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: '#4a5568', marginBottom: '30px' }}>
                {v.features ? v.features.split(',').map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#38a169' }}>✔</span> {feat.trim()}
                  </div>
                )) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1', color: '#a0aec0' }}>
                    No features listed
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#09244b' }}>
                  ₺ {v.pricePerDay}<span style={{ fontSize: '12px', color: '#718096', fontWeight: 'normal' }}>/Day</span>
                </div>
                <button 
                  onClick={() => {
                    setSelectedVehicle(v);
                    setActiveImageIndex(0);
                    setReturnBranchId(v.currentBranch ? v.currentBranch.id : '');
                    fetchReviews(v.id);
                  }}
                  style={{
                    background: v.status === 'AVAILABLE' ? '#0a42ea' : '#718096',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    letterSpacing: '1px'
                  }}
                >
                  {v.status === 'AVAILABLE' ? 'RENT IT' : 'WAITLIST'}
                </button>
              </div>

            </div>
          ))}
          {availableVehicles.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>No vehicles match your filter.</p>}
        </div>

      </div>

      {/* Booking Modal */}
      {selectedVehicle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', color: '#333', borderRadius: '12px', width: '1000px', maxWidth: '95%', maxHeight: '90vh', border: '1px solid #e0e0e0', display: 'flex', overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            
            {/* Left Column - Image Gallery */}
            <div style={{ flex: '1.5', padding: '24px', background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ position: 'relative', height: '350px', marginBottom: '16px', background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={getAllVehicleImages(selectedVehicle)[activeImageIndex]} 
                  alt="Main" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
                
                {/* Image Counter Badge */}
                <div style={{ position: 'absolute', right: '12px', top: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  {activeImageIndex + 1} / {getAllVehicleImages(selectedVehicle).length}
                </div>

                {/* Navigation Arrows */}
                {getAllVehicleImages(selectedVehicle).length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImageIndex(prev => prev > 0 ? prev - 1 : getAllVehicleImages(selectedVehicle).length - 1)}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '4px', cursor: 'pointer', zIndex: 2, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >❮</button>
                    <button 
                      onClick={() => setActiveImageIndex(prev => prev < getAllVehicleImages(selectedVehicle).length - 1 ? prev + 1 : 0)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '4px', cursor: 'pointer', zIndex: 2, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >❯</button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {getAllVehicleImages(selectedVehicle).length > 1 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {getAllVehicleImages(selectedVehicle).map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      onClick={() => setActiveImageIndex(idx)}
                      alt={`Thumb ${idx}`} 
                      style={{ 
                        height: '70px', width: '100px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, 
                        border: activeImageIndex === idx ? '2px solid #3182ce' : '2px solid transparent',
                        opacity: activeImageIndex === idx ? 1 : 0.6,
                        cursor: 'pointer', transition: 'all 0.2s'
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details & Booking */}
            <div style={{ flex: '1', padding: '32px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e0e0e0', background: '#fff', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.2', color: '#1a202c' }}>{selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.transmission} {selectedVehicle.year}</h2>
                <button onClick={() => setSelectedVehicle(null)} style={{ background: 'none', border: 'none', color: '#a0aec0', fontSize: '28px', cursor: 'pointer', marginTop: '-8px' }}>×</button>
              </div>
              
              <div style={{ color: '#4a5568', fontSize: '14px', marginBottom: '24px' }}>
                {selectedVehicle.location || 'Location N/A'} • {selectedVehicle.mileage ? `${selectedVehicle.mileage} km` : 'Unlimited Mileage'}
              </div>

              <div style={{ fontSize: '32px', fontWeight: '700', color: '#09244b', marginBottom: '32px' }}>
                <span style={{ fontSize: '18px', verticalAlign: 'top', marginRight: '4px', color: '#09244b' }}>₺</span>{selectedVehicle.pricePerDay}<span style={{ fontSize: '14px', color: '#718096', fontWeight: 'normal' }}> / day</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Year</div>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{selectedVehicle.year}</div>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Version</div>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{selectedVehicle.fuelType} {selectedVehicle.transmission}</div>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Status</div>
                  <div style={{ fontWeight: '600', color: selectedVehicle.status === 'AVAILABLE' ? '#38a169' : '#e53e3e' }}>
                    {selectedVehicle.status === 'AVAILABLE' ? 'Available Now' : 'Currently Unavailable'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                {selectedVehicle.status === 'AVAILABLE' ? (
                  <>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px', fontWeight: '600' }}>Pickup Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #e2e8f0', color: '#333', borderRadius: '4px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px', fontWeight: '600' }}>Return Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #e2e8f0', color: '#333', borderRadius: '4px' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px', fontWeight: '600' }}>Pickup Branch</label>
                        <input type="text" value={selectedVehicle.currentBranch ? selectedVehicle.currentBranch.name : 'Unknown'} disabled style={{ width: '100%', padding: '10px', background: '#f5f5f5', border: '1px solid #e2e8f0', color: '#718096', borderRadius: '4px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px', fontWeight: '600' }}>Return Branch</label>
                        <select value={returnBranchId} onChange={e => setReturnBranchId(e.target.value)} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #e2e8f0', color: '#333', borderRadius: '4px' }}>
                          <option value="">Select Return Branch...</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px', fontWeight: '600' }}>Promo Code (Optional)</label>
                      <input type="text" placeholder="Enter code..." value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #e2e8f0', color: '#333', borderRadius: '4px' }} />
                    </div>

                    <button 
                      onClick={handleSubmitBooking}
                      style={{ width: '100%', background: '#0a42ea', color: '#fff', border: 'none', padding: '16px', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px' }}
                      onMouseOver={(e) => e.target.style.background = '#0832b3'}
                      onMouseOut={(e) => e.target.style.background = '#0a42ea'}
                    >
                      Create Reservation
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleJoinWaitlist}
                    style={{ width: '100%', background: '#ecc94b', color: '#744210', border: 'none', padding: '16px', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginTop: '10px' }}
                  >
                    Notify Me When Available
                  </button>
                )}
              </div>
              
              <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0 }}>Reviews & Ratings</h3>
                  {stats.totalReviews > 0 && (
                    <div style={{ fontSize: '14px', background: '#e2e8f0', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold' }}>
                      ⭐ {stats.averageRating.toFixed(1)} / 5.0 ({stats.totalReviews} reviews)
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px', background: '#f7fafc', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>{editingReviewId ? 'Edit your review' : 'Write a review'}</div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4)</option>
                      <option value={3}>⭐⭐⭐ (3)</option>
                      <option value={2}>⭐⭐ (2)</option>
                      <option value={1}>⭐ (1)</option>
                    </select>
                  </div>
                  <textarea 
                    value={newReview.comment} 
                    onChange={e => setNewReview({...newReview, comment: e.target.value})} 
                    placeholder="Write your review here..." 
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '10px', minHeight: '80px' }} 
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={submitReview} style={{ padding: '8px 16px', background: '#38a169', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {editingReviewId ? 'Update Review' : 'Submit Review'}
                    </button>
                    {editingReviewId && (
                      <button onClick={() => { setEditingReviewId(null); setNewReview({ rating: 5, comment: '' }); }} style={{ padding: '8px 16px', background: '#a0aec0', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {reviews.length === 0 ? <p style={{ color: '#718096', fontSize: '14px' }}>No reviews yet. Be the first!</p> : reviews.map(r => (
                    <div key={r.id} style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '14px' }}>{r.user?.username || 'User'}</strong>
                        <span style={{ fontSize: '12px', color: '#a0aec0' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ marginBottom: '8px' }}>{'⭐'.repeat(r.rating)}</div>
                      <div style={{ fontSize: '14px', color: '#4a5568' }}>{r.comment}</div>
                      
                      {r.user?.username === currentUsername && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <button onClick={() => startEditing(r)} style={{ fontSize: '12px', padding: '4px 8px', background: '#edf2f7', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#4a5568' }}>Edit</button>
                          <button onClick={() => deleteReview(r.id)} style={{ fontSize: '12px', padding: '4px 8px', background: '#fed7d7', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#c53030' }}>Delete</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewBooking;
