import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <section className="container" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
          Drive the <span className="text-gradient">Future</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Experience the ultimate freedom on the road. Premium vehicle rentals tailored to your lifestyle, just a tap away.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/vehicles" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>View Our Fleet</Link>
          <Link to="/register" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Create Account</Link>
        </div>
      </section>

      <section className="container" style={{ padding: '4rem 1.5rem 8rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Premium Fleet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>From luxury sedans to powerful SUVs, our diverse fleet ensures you find the perfect match.</p>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Seamless Booking</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Our streamlined reservation system makes booking a vehicle quick, easy, and completely transparent.</p>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>24/7 Support</h3>
            <p style={{ color: 'var(--text-secondary)' }}>We're here for you around the clock to ensure your journey is smooth and worry-free.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
