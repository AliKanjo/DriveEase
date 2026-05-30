import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CustomerTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  
  const [activeTicket, setActiveTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const currentUsername = localStorage.getItem('username');

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets/my');
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

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', newTicket);
      setNewTicket({ subject: '', message: '' });
      fetchTickets();
      alert('Support ticket submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit ticket');
    }
  };

  const handleReply = async () => {
    if (!replyText) return;
    try {
      await api.post(`/tickets/${activeTicket.id}/reply`, { message: replyText });
      setReplyText('');
      loadTicketReplies(activeTicket);
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    }
  };

  if (loading) return <div className="page active"><p>Loading tickets...</p></div>;

  return (
    <div className="page active" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-title">Support Tickets</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '20px', height: 'calc(100vh - 200px)' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>My Tickets</h3>
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
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>#{t.id}</span>
                  <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status}</span>
                </div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{t.subject}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{new Date(t.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
            {tickets.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)' }}>No tickets found</div>}
          </div>
          <div style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-brand" style={{ width: '100%' }} onClick={() => setActiveTicket('NEW')}>+ Open New Ticket</button>
          </div>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', display: 'flex', flexDirection: 'column' }}>
          {!activeTicket && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
              Select a ticket to view details or create a new one.
            </div>
          )}

          {activeTicket === 'NEW' && (
            <div style={{ padding: '30px' }}>
              <h2 style={{ marginBottom: '24px' }}>Open a New Ticket</h2>
              <form onSubmit={handleCreateTicket}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input required className="form-input" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea required className="form-input" rows="6" value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn btn-green">Submit Ticket</button>
              </form>
            </div>
          )}

          {activeTicket && activeTicket !== 'NEW' && (
            <>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: '8px' }}>{activeTicket.subject}</h2>
                  <div style={{ fontSize: '14px', color: 'var(--text3)' }}>Ticket #{activeTicket.id} • Opened on {new Date(activeTicket.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`badge badge-${activeTicket.status.toLowerCase()}`}>{activeTicket.status}</span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg2)' }}>
                {/* Original Message */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>Me</div>
                  <div style={{ background: 'var(--brand)', color: '#fff', padding: '12px 16px', borderRadius: '16px 16px 0 16px', maxWidth: '70%' }}>
                    {activeTicket.message}
                  </div>
                </div>

                {/* Replies */}
                {replies.map(r => {
                  const isMe = r.user.username === currentUsername;
                  return (
                    <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>
                        {isMe ? 'Me' : r.user.username + (r.user.role === 'ADMIN' ? ' (Support Team)' : '')} • {new Date(r.createdAt).toLocaleTimeString()}
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

              {activeTicket.status !== 'CLOSED' && activeTicket.status !== 'RESOLVED' && (
                <div style={{ padding: '20px', borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <textarea 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      style={{ flex: 1, padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', minHeight: '60px', resize: 'vertical' }}
                    />
                    <button className="btn btn-brand" onClick={handleReply}>Send</button>
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

export default CustomerTickets;
