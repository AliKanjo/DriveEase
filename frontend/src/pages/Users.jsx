import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch users', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="page active"><p>Loading users...</p></div>;

  return (
    <div className="page active">
      <div className="section-hdr">
        <div>
          <div className="section-title">Users</div>
          <div className="section-sub">Manage customer and admin accounts</div>
        </div>
      </div>
      
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Role</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No users found</td>
              </tr>
            )}
            {users.map(u => (
              <tr key={u.id}>
                <td>#{u.id}</td>
                <td className="text-bold">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    {u.username}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.gender || '-'}</td>
                <td>
                  <span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
