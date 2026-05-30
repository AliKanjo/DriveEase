import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit-logs');
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const s = searchTerm.toLowerCase();
    return (
      (log.username && log.username.toLowerCase().includes(s)) ||
      (log.action && log.action.toLowerCase().includes(s)) ||
      (log.entityName && log.entityName.toLowerCase().includes(s))
    );
  });

  if (loading) return <div className="page active"><p>Loading audit logs...</p></div>;

  return (
    <div className="page active">
      <div className="section-title" style={{ marginBottom: '20px' }}>Audit Logs</div>
      
      <div className="table-wrap">
        <div className="table-filters">
          <input 
            className="search-input" 
            placeholder="🔍  Search by user, action, or entity..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Type</th>
              <th>Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{log.id}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{log.username}</td>
                <td><span className="badge badge-info">{log.action}</span></td>
                <td>{log.entityName}</td>
                <td style={{ fontFamily: 'monospace' }}>{log.entityId}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
