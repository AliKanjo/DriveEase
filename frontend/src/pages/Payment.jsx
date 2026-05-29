import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const [cardNum, setCardNum] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!booking) {
    return (
      <div className="page active">
        <p>No booking selected for payment.</p>
        <Link to="/bookings" className="btn btn-outline">Back to Bookings</Link>
      </div>
    );
  }

  const formatCard = (val) => {
    let v = val.replace(/\D/g, '').substring(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    let v = val.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    return v;
  };

  const processPayment = async () => {
    if (cardNum.replace(/\s/g, '').length < 16 || !cardHolder || cardExp.length < 5 || cardCvv.length < 3) {
      alert('Please fill all payment details correctly.');
      return;
    }

    setIsProcessing(true);
    try {
      // Create payment on the backend
      await api.post('/payments', {
        bookingId: booking.id,
        method: 'CREDIT_CARD'
      });
      alert(`Payment successful! Booking #${booking.id} is now Active.`);
      navigate('/bookings');
    } catch (err) {
      console.error(err);
      alert('Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const tax = Math.round(booking.totalPrice * 0.08);

  return (
    <div className="page active">
      <div className="section-hdr">
        <div>
          <div className="section-title">Payment</div>
          <div className="section-sub">Complete your booking</div>
        </div>
        <Link to="/bookings" className="btn btn-outline" style={{textDecoration: 'none'}}>← Back</Link>
      </div>

      <div className="payment-steps" style={{ maxWidth: '600px', marginBottom: '32px' }}>
        <div className="payment-step"><div className="step-dot done">✓</div><div className="step-label">Select vehicle</div></div>
        <div className="payment-step"><div className="step-dot done">✓</div><div className="step-label">Admin Approval</div></div>
        <div className="payment-step"><div className="step-dot active">3</div><div className="step-label">Payment</div></div>
        <div className="payment-step"><div className="step-dot">4</div><div className="step-label">Confirmation</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        <div>
          <div className="card-visual">
            <div className="chip"></div>
            <div className="card-num">{cardNum || '•••• •••• •••• ••••'}</div>
            <div className="card-bottom">
              <div>
                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '2px' }}>CARD HOLDER</div>
                <div className="card-holder">{cardHolder || 'YOUR NAME'}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', opacity: 0.6, marginBottom: '2px' }}>EXPIRES</div>
                <div className="card-exp">{cardExp || 'MM/YY'}</div>
              </div>
            </div>
          </div>

          <div className="payment-card">
            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Card number</label>
                <input 
                  className="form-input" 
                  maxLength="19" 
                  placeholder="1234 5678 9012 3456" 
                  value={cardNum}
                  onChange={e => setCardNum(formatCard(e.target.value))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Card holder name</label>
                <input 
                  className="form-input" 
                  placeholder="John Doe" 
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry / CVV</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input 
                    className="form-input" 
                    maxLength="5" 
                    placeholder="MM/YY" 
                    value={cardExp}
                    onChange={e => setCardExp(formatExpiry(e.target.value))}
                  />
                  <input 
                    className="form-input" 
                    maxLength="3" 
                    placeholder="CVV" 
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="payment-card" style={{ margin: 0 }}>
            <div style={{ fontWeight: 600, marginBottom: '14px', fontSize: '15px' }}>Billing address</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country</label>
                <select className="form-input">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ZIP code</label>
                <input className="form-input" placeholder="10001" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="booking-summary">
            <h3>Order Summary</h3>
            <div style={{ padding: '14px', background: 'var(--bg2)', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
              <strong>🚗 {booking.vehicle?.brand} {booking.vehicle?.model}</strong><br/>
              <span style={{ color: 'var(--text3)', fontSize: '13px' }}>{booking.startDate} → {booking.endDate}</span>
            </div>
            <div className="summary-row"><span className="label">Base Amount</span><span className="value">${booking.totalPrice - tax}</span></div>
            <div className="summary-row"><span className="label">Taxes (8%)</span><span className="value">${tax}</span></div>
            <div className="summary-total"><span>Total</span><span>${booking.totalPrice}</span></div>
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '18px', padding: '13px', fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, borderRadius: '12px', background: 'var(--brand)' }}
              onClick={processPayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : '🔒 Pay Now'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text3)', marginTop: '10px' }}>
              256-bit SSL encryption · Simulated payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
