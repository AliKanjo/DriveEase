import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTicket, setActiveTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const currentUsername = localStorage.getItem('username');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/all');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const loadTicketReplies = async (ticket) => {
    setActiveTicket(ticket);
    try {
      const res = await api.get(`/tickets/${ticket.id}/replies`);
      setReplies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async () => {
    if (!replyText) return;
    try {
      await api.post(`/tickets/${activeTicket.id}/reply`, { message: replyText });
      setReplyText('');
      loadTicketReplies(activeTicket);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    try {
      await api.put(`/tickets/${activeTicket.id}/priority?priority=${newPriority}`);
      activeTicket.priority = newPriority;
      setActiveTicket({...activeTicket});
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      if (status === 'RESOLVED') await api.put(`/tickets/${activeTicket.id}/resolve`);
      if (status === 'CLOSED') await api.put(`/tickets/${activeTicket.id}/close`);
      
      activeTicket.status = status;
      setActiveTicket({...activeTicket});
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page active"><p>Loading tickets...</p></div>;

  return (
    <div className="page active" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="section-title">Support Ticket Management</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', height: 'calc(100vh - 200px)' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>All Tickets</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tickets.map(t => (
              <div 
                key={t.id} 
                onClick={() => loadTicketReplies(t)}
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid var(--border)', 
                  cursor: 'pointer',
                  background: activeTicket?.id === t.id ? 'var(--bg2)' : 'transparent',
                  transition: 'background 0.2s',
                  borderLeft: `4px solid ${t.priority === 'URGENT' ? '#e53e3e' : t.priority === 'HIGH' ? '#ed8936' : t.priority === 'MEDIUM' ? '#ecc94b' : 'transparent'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>#{t.id} - {t.user?.username}</span>
                  <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span>
                </div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{t.subject}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  {t.priority !== 'MEDIUM' && <span style={{ fontWeight: 'bold' }}>{t.priority}</span>}
                </div>
              </div>
            ))}
            {tickets.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>No tickets found</div>}
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', display: 'flex', flexDirection: 'column' }}>
          {!activeTicket && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
              Select a ticket to manage.
            </div>
          )}

          {activeTicket && (
            <>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card)' }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: '8px' }}>{activeTicket.subject}</h2>
                  <div style={{ fontSize: '14px', color: 'var(--text3)' }}>Customer: {activeTicket.user?.username} • Ticket #{activeTicket.id}</div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '12px', marginRight: '8px', fontWeight: 'bold' }}>Priority:</label>
                    <select value={activeTicket.priority} onChange={handlePriorityChange} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  
                  {activeTicket.status !== 'CLOSED' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-sm btn-green" onClick={() => handleStatusUpdate('RESOLVED')}>Resolve</button>
                      <button className="btn btn-sm" style={{ background: '#718096', color: '#fff' }} onClick={() => handleStatusUpdate('CLOSED')}>Close</button>
                    </div>
                  )}
                  {activeTicket.status === 'CLOSED' && <span className="badge badge-closed">CLOSED</span>}
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg2)' }}>
                {/* Original Message */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>{activeTicket.user?.username}</div>
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', maxWidth: '70%' }}>
                    {activeTicket.message}
                  </div>
                </div>

                {/* Replies */}
                {replies.map(r => {
                  const isMe = r.user.username === currentUsername;
                  return (
                    <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>
                        {isMe ? 'Me (Support)' : r.user.username} • {new Date(r.createdAt).toLocaleTimeString()}
                      </div>
                      <div style={{ 
                        background: isMe ? 'var(--brand)' : 'var(--card)', 
                        color: isMe ? '#fff' : 'var(--text)', 
                        border: isMe ? 'none' : '1px solid var(--border)',
                        padding: '12px 16px', 
                        borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0', 
                        maxWidth: '70%' 
                      }}>
                        {r.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeTicket.status !== 'CLOSED' && (
                <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <textarea 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type response to customer..."
                      style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', minHeight: '60px', resize: 'vertical' }}
                    />
                    <button className="btn btn-primary" onClick={handleReply}>Send Reply</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;
