import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/all');
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleHide = async (id) => {
    try {
      await api.put(`/reviews/${id}/hide`);
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page active"><p>Loading reviews...</p></div>;

  return (
    <div className="page active">
      <div className="section-title">Review Moderation</div>
      
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>User</th>
              <th>Vehicle</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>{r.user?.username}</td>
                <td>{r.vehicle?.brand} {r.vehicle?.model}</td>
                <td>{'⭐'.repeat(r.rating)}</td>
                <td><div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</div></td>
                <td>
                  <span className={`badge badge-${r.hidden ? 'danger' : 'active'}`}>{r.hidden ? 'HIDDEN' : 'VISIBLE'}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={`btn btn-sm ${r.hidden ? 'btn-green' : 'btn-danger'}`} onClick={() => handleHide(r.id)}>
                      {r.hidden ? 'Unhide' : 'Hide'}
                    </button>
                    <button className="btn btn-sm" style={{ background: '#718096', color: '#fff' }} onClick={() => handleDelete(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>No reviews found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviews;
