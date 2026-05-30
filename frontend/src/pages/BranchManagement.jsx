import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/branches', { name, city, location });
      setName(''); setCity(''); setLocation('');
      fetchBranches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this branch?')) {
      try {
        await api.delete(`/branches/${id}`);
        fetchBranches();
      } catch (err) {
        console.error(err);
        alert('Failed to delete branch. It might have associated vehicles or bookings.');
      }
    }
  };

  if (loading) return <div className="page active"><p>Loading branches...</p></div>;

  return (
    <div className="page active">
      <div className="section-title">Branch Management</div>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, background: 'var(--card)', padding: '20px', borderRadius: '12px' }}>
          <h3>Add New Branch</h3>
          <form onSubmit={handleCreate} style={{ marginTop: '15px' }}>
            <label className="form-label">Branch Name</label>
            <input className="search-input" style={{ width: '100%', marginBottom: '10px' }} value={name} onChange={e => setName(e.target.value)} required />
            
            <label className="form-label">City</label>
            <input className="search-input" style={{ width: '100%', marginBottom: '10px' }} value={city} onChange={e => setCity(e.target.value)} required />
            
            <label className="form-label">Location / Address</label>
            <input className="search-input" style={{ width: '100%', marginBottom: '15px' }} value={location} onChange={e => setLocation(e.target.value)} required />
            
            <button type="submit" className="btn btn-brand" style={{ width: '100%' }}>Create Branch</button>
          </form>
        </div>
        
        <div style={{ flex: 2 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{b.name}</td>
                    <td>{b.city}</td>
                    <td>{b.location}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No branches found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchManagement;
