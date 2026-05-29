import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getVehicleImage } from '../utils/imageHelpers';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, bookRes] = await Promise.all([
          api.get('/vehicles'),
          isAdmin ? api.get('/bookings') : api.get('/bookings/my')
        ]);
        setVehicles(vehRes.data);
        setBookings(bookRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    if (user) fetchData();
  }, [user, isAdmin]);

  if (loading) return <div className="page active"><p>Loading...</p></div>;

  // Compute stats
  const activeBookings = bookings.filter(b => b.status === 'APPROVED' || b.status === 'ACTIVE' || b.status === 'CONFIRMED').length;
  const revenue = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'COMPLETED').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const avail = vehicles.filter(v => v.status === 'AVAILABLE').length;

  const stats = isAdmin
    ? [
        { icon: '🚗', val: vehicles.length, lbl: 'Total Vehicles', delta: 'All time', up: true, bg: '#e6f4e6' },
        { icon: '📅', val: activeBookings, lbl: 'Active Bookings', delta: 'Currently active', up: true, bg: '#e6f0ff' },
        { icon: '💰', val: `$${revenue.toLocaleString()}`, lbl: 'Total Revenue', delta: 'All time', up: true, bg: '#fff8e6' },
        { icon: '✅', val: avail, lbl: 'Available Now', delta: `${vehicles.length - avail} in use`, up: false, bg: '#f0e6ff' }
      ]
    : [
        { icon: '📅', val: bookings.length, lbl: 'Total Bookings', delta: 'All time', up: true, bg: '#e6f4e6' },
        { icon: '✅', val: activeBookings, lbl: 'Active Rentals', delta: 'Currently active', up: true, bg: '#e6f0ff' },
        { icon: '🏁', val: bookings.filter(b => b.status === 'COMPLETED').length, lbl: 'Completed', delta: 'All time', up: true, bg: '#fff8e6' },
        { icon: '💳', val: `$${revenue.toLocaleString()}`, lbl: 'Total Spent', delta: 'All time', up: true, bg: '#f0e6ff' }
      ];

  const recentBookings = [...bookings].reverse().slice(0, 5);
  const topVehicles = [...vehicles].slice(0, 6);

  const badgeStatus = (s) => s ? s.toLowerCase() : 'pending';

  return (
    <div className="page active">
      <div style={{ marginBottom: '22px' }}>
        <h1 className="section-title">Welcome back, {user?.username} 👋</h1>
        <p style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '4px' }}>Here's what's happening with your fleet today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((s, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
            <div className={`stat-delta ${s.up ? 'delta-up' : 'delta-dn'}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <div className="section-hdr">
            <div><div className="section-title">Recent Bookings</div></div>
            <Link to="/bookings" className="btn btn-outline btn-sm" style={{textDecoration: 'none'}}>View all</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No bookings found</td></tr>}
                {recentBookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="flex-center">
                        <img src={getVehicleImage(b.vehicle)} alt={b.vehicle?.brand} className="vehicle-thumb" style={{ objectFit: 'cover' }} />
                        <span className="text-bold">{b.vehicle?.brand} {b.vehicle?.model}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {b.startDate} <br/> {b.endDate}
                    </td>
                    <td className="text-bold">${b.totalPrice}</td>
                    <td><span className={`badge badge-${badgeStatus(b.status)}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isAdmin && (
          <div>
            <div className="section-hdr">
              <div><div className="section-title">Fleet Status</div></div>
            <Link to="/vehicles" className="btn btn-outline btn-sm" style={{textDecoration: 'none'}}>Manage</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Rate/day</th>
                </tr>
              </thead>
              <tbody>
                {topVehicles.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No vehicles found</td></tr>}
                {topVehicles.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div className="flex-center">
                        <img src={getVehicleImage(v)} alt={v.brand} className="vehicle-thumb" style={{ objectFit: 'cover' }} />
                        <span className="text-bold">{v.brand} {v.model}</span>
                      </div>
                    </td>
                    <td>{v.year}</td>
                    <td>
                      <span className={`badge badge-${v.status === 'AVAILABLE' ? 'available' : 'rented'}`}>
                        {v.status === 'AVAILABLE' ? 'Available' : 'Rented'}
                      </span>
                    </td>
                    <td className="text-bold">${v.pricePerDay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
