import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <h2>Drive<span className="text-gradient">Ease</span></h2>
          <p>Premium vehicle rental experiences designed for you.</p>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Explore</h4>
            <a href="/vehicles">Our Fleet</a>
            <a href="#">Pricing</a>
            <a href="#">Locations</a>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} DriveEase. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
