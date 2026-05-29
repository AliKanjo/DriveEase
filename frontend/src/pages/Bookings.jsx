import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getVehicleImage } from '../utils/imageHelpers';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [editingBooking, setEditingBooking] = useState(null);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get(isAdmin ? '/bookings' : '/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAdmin]);

  const confirmBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/status?status=APPROVED`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to confirm booking');
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking');
    }
  };

  const submitModify = async () => {
    try {
      await api.put(`/bookings/${editingBooking.id}/modify?startDate=${newStartDate}&endDate=${newEndDate}`);
      setEditingBooking(null);
      fetchBookings();
      alert('Dates modified and total price recalculated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to modify booking dates');
    }
  };

  const goToPayment = (booking) => {
    navigate('/payment', { state: { booking } });
  };

  const filteredBookings = bookings.filter(b => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || String(b.id).includes(s) || (b.vehicle && `${b.vehicle.brand} ${b.vehicle.model}`.toLowerCase().includes(s));
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const badgeStatus = (s) => s ? s.toLowerCase() : 'pending';

  if (loading) return <div className="page active"><p>Loading bookings...</p></div>;

  return (
    <div className="page active">
      <div className="section-hdr">
        <div>
          <div className="section-title">Bookings</div>
          <div className="section-sub">{isAdmin ? 'All rental reservations' : 'Your rental reservations'}</div>
        </div>
        {!isAdmin && (
          <Link to="/newbooking" className="btn btn-green" style={{textDecoration: 'none'}}>+ New Booking</Link>
        )}
      </div>

      <div className="table-wrap">
        <div className="table-filters">
          <input 
            className="search-input" 
            placeholder="🔍  Search bookings..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active (Paid)</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Booking #</th>
              {isAdmin && <th>Customer</th>}
              <th>Vehicle</th>
              <th>Start</th>
              <th>End</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{b.id}</td>
                {isAdmin && <td>User #{b.userId || 'N/A'}</td>}
                <td>
                  <div className="flex-center">
                    <img src={getVehicleImage(b.vehicle)} alt={b.vehicle?.brand} className="vehicle-thumb" style={{ objectFit: 'cover' }} />
                    <span className="text-bold">{b.vehicle?.brand} {b.vehicle?.model}</span>
                  </div>
                </td>
                <td>{b.startDate}</td>
                <td>{b.endDate}</td>
                <td className="text-bold">${b.totalPrice}</td>
                <td><span className={`badge badge-${badgeStatus(b.status)}`}>{b.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {isAdmin && b.status === 'PENDING' && (
                      <button className="btn btn-sm btn-green" onClick={() => confirmBooking(b.id)}>Confirm</button>
                    )}
                    {!isAdmin && b.status === 'APPROVED' && (
                      <button className="btn btn-sm btn-green" onClick={() => goToPayment(b)}>Pay Now</button>
                    )}
                    {!isAdmin && (b.status === 'PENDING' || b.status === 'APPROVED') && (
                      <button className="btn btn-sm btn-outline" onClick={() => {
                        setEditingBooking(b);
                        setNewStartDate(b.startDate);
                        setNewEndDate(b.endDate);
                      }}>Modify</button>
                    )}
                    {(b.status === 'ACTIVE' || b.status === 'COMPLETED') && (
                      <button className="btn btn-sm btn-outline" onClick={() => navigate(`/invoice/${b.id}`, { state: { booking: b } })}>📄 Invoice</button>
                    )}
                    {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.status !== 'ACTIVE' && (
                      <button className="btn btn-sm btn-danger" onClick={() => cancelBooking(b.id)}>Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr><td colSpan={isAdmin ? 8 : 7} style={{textAlign: 'center'}}>No bookings found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--card)', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '95%' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text)' }}>Modify Reservation #{editingBooking.id}</h3>
            
            <label className="form-label">New Start Date</label>
            <input type="date" className="search-input" style={{ width: '100%', marginBottom: '12px' }} value={newStartDate} onChange={e => setNewStartDate(e.target.value)} />
            
            <label className="form-label">New End Date</label>
            <input type="date" className="search-input" style={{ width: '100%', marginBottom: '24px' }} value={newEndDate} onChange={e => setNewEndDate(e.target.value)} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={submitModify} className="btn btn-green" style={{ flex: 1 }}>Save Changes</button>
              <button onClick={() => setEditingBooking(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
