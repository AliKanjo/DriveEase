import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DamageReporting = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [vehicleId, setVehicleId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MINOR');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchReports = async () => {
    try {
      const res = await api.get('/damage-reports');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/bookings')
      ]);
      setVehicles(vRes.data);
      setBookings(bRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchDependencies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!vehicleId) {
      setFormError('Please select a vehicle.');
      return;
    }
    try {
      await api.post('/damage-reports', {
        vehicleId: parseInt(vehicleId),
        bookingId: bookingId ? parseInt(bookingId) : null,
        description,
        severity
      });
      setVehicleId(''); setBookingId(''); setDescription(''); setSeverity('MINOR');
      fetchReports();
      setFormSuccess('Damage report submitted successfully.');
    } catch (err) {
      console.error(err);
      setFormError('Failed to submit report. Please try again.');
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/damage-reports/${id}/resolve`);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page active"><p>Loading reports...</p></div>;

  return (
    <div className="page active">
      <div className="section-title">Damage Inspections</div>
      <div className="section-sub">Report and track vehicle damages</div>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, background: 'var(--card)', padding: '20px', borderRadius: '12px' }}>
          <h3>Submit New Report</h3>
          <form onSubmit={handleCreate} style={{ marginTop: '15px' }}>
            <label className="form-label">Vehicle</label>
            <select className="filter-select" style={{ width: '100%', marginBottom: '10px' }} value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
              <option value="">Select Vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.licensePlate || v.id})</option>
              ))}
            </select>
            
            <label className="form-label">Related Booking (Optional)</label>
            <select className="filter-select" style={{ width: '100%', marginBottom: '10px' }} value={bookingId} onChange={e => setBookingId(e.target.value)}>
              <option value="">None</option>
              {bookings.map(b => (
                <option key={b.id} value={b.id}>Booking #{b.id} - {b.user?.username}</option>
              ))}
            </select>
            
            <label className="form-label">Severity</label>
            <select className="filter-select" style={{ width: '100%', marginBottom: '10px' }} value={severity} onChange={e => setSeverity(e.target.value)}>
              <option value="MINOR">Minor</option>
              <option value="MODERATE">Moderate</option>
              <option value="SEVERE">Severe</option>
            </select>
            
            <label className="form-label">Description</label>
            <textarea className="search-input" style={{ width: '100%', marginBottom: '15px', minHeight: '80px', padding: '10px' }} value={description} onChange={e => setDescription(e.target.value)} required />
            
            {formError && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '10px' }}>{formError}</div>}
            {formSuccess && <div style={{ color: '#38a169', fontSize: '13px', marginBottom: '10px' }}>{formSuccess}</div>}
            <button type="submit" className="btn btn-green" style={{ width: '100%' }}>Submit Report</button>
          </form>
        </div>
        
        <div style={{ flex: 2 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Report #</th>
                  <th>Vehicle</th>
                  <th>Severity</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.vehicle?.brand} {r.vehicle?.model}</td>
                    <td><span className={`badge badge-${r.severity === 'SEVERE' ? 'rented' : (r.severity === 'MINOR' ? 'available' : 'pending')}`}>{r.severity}</span></td>
                    <td>{r.reporterUsername}</td>
                    <td>{r.isResolved ? <span style={{ color: 'green' }}>Resolved</span> : <span style={{ color: 'red' }}>Open</span>}</td>
                    <td>
                      {!r.isResolved && (
                        <button className="btn btn-sm btn-green" onClick={() => handleResolve(r.id)}>Mark Resolved</button>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center' }}>No damage reports found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageReporting;
