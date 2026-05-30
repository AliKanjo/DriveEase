import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminSms = () => {
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSms = async () => {
      try {
        const res = await api.get('/sms');
        setSmsLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch SMS logs");
      } finally {
        setLoading(false);
      }
    };
    fetchSms();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Simulated SMS Dispatch Log</h1>
      </div>
      <p style={{ color: 'var(--text2)', marginBottom: '20px' }}>
        View the history of automated SMS text messages sent to customers.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : smsLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card)', borderRadius: '12px' }}>
          No SMS logs found.
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Recipient</th>
                <th>Phone Number</th>
                <th>Type</th>
                <th>Message Payload</th>
              </tr>
            </thead>
            <tbody>
              {smsLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.user?.username}</td>
                  <td><span style={{ fontFamily: 'monospace', background: 'var(--bg2)', padding: '2px 6px', borderRadius: '4px' }}>{log.phoneNumber}</span></td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      background: log.type === 'RENTAL_REMINDER' ? 'rgba(52, 152, 219, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                      color: log.type === 'RENTAL_REMINDER' ? '#3498db' : '#e74c3c'
                    }}>
                      {log.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px' }}>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSms;
