import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  
  // Recharts Data
  const statusColors = {
    PENDING: '#dd6b20',
    APPROVED: '#ecc94b',
    ACTIVE: '#3182ce',
    COMPLETED: '#38a169',
    CANCELLED: '#e53e3e'
  };
  
  const statusData = Object.keys(statusColors).map(status => ({
    name: status,
    value: bookings.filter(b => b.status === status).length,
    color: statusColors[status]
  })).filter(d => d.value > 0);

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

        {/* Booking Status Breakdown (Recharts) */}
        <div>
          <div className="section-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Booking Status Breakdown</div>
          <div className="profile-card" style={{ background: 'var(--card)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', height: '100%', minHeight: '300px' }}>
            
            {bookings.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text3)' }}>No bookings to analyze</p>
            )}

          </div>
        </div>
      </div>
      
      {/* Revenue by Vehicle Chart */}
      <div style={{ marginTop: '30px' }}>
        <div className="section-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Revenue by Top Vehicles</div>
        <div className="profile-card" style={{ background: 'var(--card)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
          {vehicleStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehicleStats}>
                <XAxis dataKey="brand" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenueGenerated" name="Revenue" fill="#3182ce" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text3)' }}>No vehicle data available</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Reports;
