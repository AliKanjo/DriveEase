import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    vehicles: [],
    bookings: [],
    users: []
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [vehRes, bookRes, userRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/bookings'),
          api.get('/users')
        ]);
        setData({
          vehicles: vehRes.data,
          bookings: bookRes.data,
          users: userRes.data
        });
      } catch (err) {
        console.error("Failed to load report data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  if (loading) return <div className="page active"><p>Loading analytics...</p></div>;

  const { vehicles, bookings, users } = data;

  // Key Metrics
  const totalRevenue = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'COMPLETED').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const avgBookingVal = bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0;
  const activeBookings = bookings.filter(b => b.status === 'ACTIVE' || b.status === 'APPROVED');
  const utilization = vehicles.length > 0 ? ((activeBookings.length / vehicles.length) * 100).toFixed(1) : 0;

  // Vehicle Popularity
  const vehicleStats = vehicles.map(v => {
    const vBookings = bookings.filter(b => b.vehicle && b.vehicle.id === v.id);
    const vRev = vBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    return { ...v, timesRented: vBookings.length, revenueGenerated: vRev };
  }).sort((a, b) => b.timesRented - a.timesRented).slice(0, 5);

  return (
    <div className="page active">
      <div className="section-hdr">
        <div>
          <div className="section-title">Reports & Analytics</div>
          <div className="section-sub">Business insights and performance metrics</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => window.print()}>Export PDF</button>
      </div>
      
      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff8e6' }}>💰</div>
          <div className="stat-val">${totalRevenue.toLocaleString()}</div>
          <div className="stat-lbl">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e6f0ff' }}>📈</div>
          <div className="stat-val">${avgBookingVal}</div>
          <div className="stat-lbl">Avg Booking Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0e6ff' }}>🔥</div>
          <div className="stat-val">{utilization}%</div>
          <div className="stat-lbl">Fleet Utilization</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e6f4e6' }}>👥</div>
          <div className="stat-val">{users.length}</div>
          <div className="stat-lbl">Total Registered Users</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Popular Vehicles Table */}
        <div>
          <div className="section-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Top Performing Vehicles</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Times Rented</th>
                  <th>Revenue Generated</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {vehicleStats.map(v => (
                  <tr key={v.id}>
                    <td className="text-bold">{v.brand} {v.model}</td>
                    <td>{v.timesRented}</td>
                    <td className="text-bold text-green">${v.revenueGenerated.toLocaleString()}</td>
                    <td style={{ width: '150px' }}>
                      <div style={{ background: 'var(--bg2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--accent)', height: '100%', width: `${Math.min(100, (v.timesRented / (bookings.length || 1)) * 100 * 3)}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
                {vehicleStats.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>No vehicle data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Status Breakdown (CSS Chart) */}
        <div>
          <div className="section-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Booking Status Breakdown</div>
          <div className="profile-card" style={{ background: 'var(--card)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            
            {['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(status => {
              const count = bookings.filter(b => b.status === status).length;
              const percent = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
              const color = status === 'COMPLETED' ? '#5cb85c' : status === 'ACTIVE' ? '#3182ce' : status === 'CANCELLED' ? '#e53e3e' : '#dd6b20';
              
              return (
                <div key={status} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                    <span>{status}</span>
                    <span>{count} ({percent.toFixed(1)}%)</span>
                  </div>
                  <div style={{ background: 'var(--bg2)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: color, height: '100%', width: `${percent}%`, transition: 'width 1s ease-in-out' }}></div>
                  </div>
                </div>
              );
            })}
            {bookings.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text3)' }}>No bookings to analyze</p>}

          </div>
        </div>
      </div>

    </div>
  );
};

export default Reports;
