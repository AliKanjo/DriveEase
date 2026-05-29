import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Invoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  useEffect(() => {
    if (!booking) {
      navigate('/bookings');
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Syne", sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Screen Only Actions */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={() => navigate(-1)} className="btn btn-outline">← Back</button>
          <button onClick={handlePrint} className="btn btn-green">🖨️ Download / Print Invoice</button>
        </div>

        {/* Printable Area */}
        <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', color: '#1a202c' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #edf2f7', paddingBottom: '30px', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--brand)' }}>DriveEase</h1>
              <div style={{ color: '#718096', marginTop: '5px', fontSize: '14px' }}>Premium Car Rentals</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#2d3748' }}>INVOICE</h2>
              <div style={{ fontSize: '14px', color: '#718096', marginTop: '5px' }}>#INV-{booking.id}-{new Date().getFullYear()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', fontSize: '14px' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Billed To:</div>
              <div>Customer ID: #{booking.userId}</div>
              <div>Booking ID: #{booking.id}</div>
              <div>Date Issued: {new Date().toLocaleDateString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', color: '#4a5568', marginBottom: '8px' }}>Rental Period:</div>
              <div>Pickup: {booking.startDate}</div>
              <div>Return: {booking.endDate}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#4a5568' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#4a5568' }}>Rate / Day</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#4a5568' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                <td style={{ padding: '16px 12px' }}>
                  <div style={{ fontWeight: '600' }}>{booking.vehicle?.brand} {booking.vehicle?.model} {booking.vehicle?.year}</div>
                  <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>{booking.vehicle?.transmission} • {booking.vehicle?.fuelType}</div>
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>₺{booking.vehicle?.pricePerDay}</td>
                <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: '600' }}>₺{booking.totalPrice}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #edf2f7' }}>
                <span style={{ color: '#718096' }}>Subtotal</span>
                <span>₺{booking.totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #edf2f7' }}>
                <span style={{ color: '#718096' }}>Tax (0%)</span>
                <span>₺0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontWeight: '800', fontSize: '20px' }}>
                <span>Total Paid</span>
                <span style={{ color: '#38a169' }}>₺{booking.totalPrice}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '60px', textAlign: 'center', color: '#a0aec0', fontSize: '13px', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
            Thank you for choosing DriveEase. Drive safely!
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; }
        }
      `}} />
    </div>
  );
};

export default Invoice;
