import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { getVehicleImage } from '../utils/imageHelpers';

import { AuthContext } from '../context/AuthContext';

const Vehicles = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isStaff = isAdmin || isEmployee;
  
  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    brand: '', model: '', year: new Date().getFullYear(),
    pricePerDay: 50, transmission: 'Automatic', fuelType: 'Gas',
    licensePlate: '', images: '', status: 'AVAILABLE', capacity: 5,
    licensePlate: '', images: '', status: 'AVAILABLE', capacity: 5,
    mileage: 0, location: '', features: '', currentBranch: null
  });

  const fetchVehicles = async () => {
    try {
      const [vehRes, branchRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/branches')
      ]);
      setVehicles(Array.isArray(vehRes.data) ? vehRes.data : []);
      setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
    } catch (err) {
      console.error(err);
      setVehicles([]);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await api.delete(`/vehicles/${id}`);
        setVehicles(vehicles.filter(v => v.id !== id));
      } catch (err) {
        console.error("Failed to delete vehicle", err);
        alert("Failed to delete vehicle. It may be linked to existing bookings.");
      }
    }
  };

  const handleScheduleMaintenance = async (id) => {
    const costStr = window.prompt("Enter estimated maintenance cost ($):");
    if (!costStr) return;
    const desc = window.prompt("Enter maintenance description:");
    
    try {
      await api.post(`/maintenance/vehicle/${id}`, {
        maintenanceDate: new Date().toISOString().split('T')[0],
        cost: parseFloat(costStr),
        description: desc || 'Regular Maintenance'
      });
      fetchVehicles();
      alert("Maintenance scheduled successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to schedule maintenance.");
    }
  };

  const handleCompleteMaintenance = async (id) => {
    try {
      await api.put(`/maintenance/vehicle/${id}/complete`);
      fetchVehicles();
      alert("Vehicle marked as Available.");
    } catch (err) {
      console.error(err);
      alert("Failed to complete maintenance.");
    }
  };

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setEditingVehicle(null);
      setFormData({
        brand: '', model: '', year: new Date().getFullYear(),
        pricePerDay: 50, transmission: 'Automatic', fuelType: 'Gas',
        licensePlate: '', images: '', status: 'AVAILABLE', capacity: 5,
        licensePlate: '', images: '', status: 'AVAILABLE', capacity: 5,
        mileage: 0, location: '', features: '', currentBranch: null
      });
    }
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploadedImageUrls = formData.images ? formData.images.split(',').filter(Boolean) : [];

      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const uploadData = new FormData();
          uploadData.append("file", file);
          const res = await api.post('/upload', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return res.data;
        });
        const urls = await Promise.all(uploadPromises);
        uploadedImageUrls = [...uploadedImageUrls, ...urls]; // Append new uploads to existing ones
      }

      const payload = { 
        ...formData, 
        images: uploadedImageUrls.join(','),
        currentBranch: formData.currentBranchId ? { id: parseInt(formData.currentBranchId) } : null
      };

      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, payload);
      } else {
        await api.post('/vehicles', payload);
      }
      setIsModalOpen(false);
      setSelectedFiles([]);
      fetchVehicles();
    } catch (err) {
      console.error("Failed to save vehicle", err);
      alert("Failed to save vehicle.");
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || `${v.brand} ${v.model} ${v.licensePlate || ''}`.toLowerCase().includes(s);
    const matchType = !typeFilter || v.transmission === typeFilter || v.description === typeFilter;
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  if (loading) return <div className="page active"><p>Loading fleet...</p></div>;

  return (
    <div className="page active">
      <div className="section-hdr">
        <div>
          <div className="section-title">Fleet Directory</div>
          <div className="section-sub">Browse and manage available vehicles</div>
        </div>
        {isStaff && (
          <button className="btn btn-brand" onClick={() => handleOpenModal()}>+ Add Vehicle</button>
        )}
      </div>

      <div className="table-wrap">
        <div className="table-filters">
          <input 
            className="search-input" 
            placeholder="🔍  Search vehicles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Transmission</th>
              <th>Year</th>
              <th>Plate</th>
              <th>Branch</th>
              <th>Daily Rate</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map(v => (
              <tr key={v.id}>
                <td>
                  <div className="flex-center">
                    <img src={getVehicleImage(v)} alt={v.brand} className="vehicle-thumb" style={{ objectFit: 'cover' }} />
                    <div>
                      <div className="text-bold">{v.brand} {v.model}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{v.fuelType || 'Gas'} · {v.transmission || 'Auto'}</div>
                    </div>
                  </div>
                </td>
                <td>{v.transmission}</td>
                <td>{v.year}</td>
                <td style={{ fontFamily: 'monospace' }}>{v.licensePlate || 'N/A'}</td>
                <td style={{ fontSize: '12px' }}>{v.currentBranch ? v.currentBranch.name : 'Unassigned'}</td>
                <td className="text-bold">${v.pricePerDay}/day</td>
                <td>
                  <span className={`badge badge-${v.status === 'AVAILABLE' ? 'available' : 'rented'}`}>
                    {v.status === 'AVAILABLE' ? 'Available' : v.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {isStaff && (
                    <>
                      <button className="btn btn-sm btn-info" onClick={() => handleOpenModal(v)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v.id)}>Delete</button>
                    </>
                  )}
                  {isStaff && (
                    <>
                      {v.status === 'AVAILABLE' && (
                        <button className="btn btn-sm btn-outline" onClick={() => handleScheduleMaintenance(v.id)}>Maintenance</button>
                      )}
                      {v.status === 'MAINTENANCE' && (
                        <button className="btn btn-sm btn-green" onClick={() => handleCompleteMaintenance(v.id)}>Complete Maint.</button>
                      )}
                    </>
                  )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredVehicles.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>No vehicles match the filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'var(--card)', padding: '30px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px', fontFamily: '"Syne", sans-serif' }}>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Brand</label>
                  <input required className="search-input" style={{ width: '100%' }} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Model</label>
                  <input required className="search-input" style={{ width: '100%' }} value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Year</label>
                  <input required type="number" className="search-input" style={{ width: '100%' }} value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Daily Rate ($)</label>
                  <input required type="number" className="search-input" style={{ width: '100%' }} value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Transmission</label>
                  <select className="filter-select" style={{ width: '100%' }} value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})}>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Fuel Type</label>
                  <select className="filter-select" style={{ width: '100%' }} value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})}>
                    <option value="Gas">Gas</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>License Plate</label>
                  <input className="search-input" style={{ width: '100%' }} value={formData.licensePlate || ''} onChange={e => setFormData({...formData, licensePlate: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Mileage</label>
                  <input type="number" className="search-input" style={{ width: '100%' }} value={formData.mileage || 0} onChange={e => setFormData({...formData, mileage: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Location (City)</label>
                  <input className="search-input" style={{ width: '100%' }} placeholder="e.g. Istanbul" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Assigned Branch</label>
                  <select className="filter-select" style={{ width: '100%' }} value={formData.currentBranchId || (formData.currentBranch ? formData.currentBranch.id : '')} onChange={e => setFormData({...formData, currentBranchId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Features (Comma-separated)</label>
                <textarea className="search-input" style={{ width: '100%', minHeight: '60px', padding: '10px', resize: 'vertical' }} placeholder="Chilled AC, Bluetooth, Heated Seats, etc." value={formData.features || ''} onChange={e => setFormData({...formData, features: e.target.value})} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Upload Images</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  className="search-input" 
                  style={{ width: '100%', padding: '6px' }} 
                  onChange={(e) => {
                    setSelectedFiles(Array.from(e.target.files));
                  }} 
                />
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                  New files selected will be added to the existing images.
                </div>
                {formData.images && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {formData.images.split(',').filter(Boolean).map((imgPath, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <img src={imgPath.startsWith('http') ? imgPath : `http://localhost:8080${imgPath}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #444' }} />
                        <button type="button" onClick={() => {
                          const newImages = formData.images.split(',').filter(Boolean).filter((_, i) => i !== idx).join(',');
                          setFormData({...formData, images: newImages});
                        }} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e62b2b', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Status</label>
                <select className="filter-select" style={{ width: '100%' }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="AVAILABLE">Available</option>
                  <option value="RENTED">Rented</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" className="btn btn-green" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
