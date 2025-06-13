import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <div className="services-container">
      <h2 className="section-title">Our Services</h2>
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">📱</div>
          <h3>SMS Security Scanner</h3>
          <p>Real-time analysis of SMS messages to detect spam, phishing attempts, and malicious content.</p>
          <ul className="service-features">
            <li>Instant threat detection</li>
            <li>Spam pattern recognition</li>
            <li>Phishing attempt alerts</li>
            <li>Confidence scoring</li>
          </ul>
          <Link to="/scan" className="service-button">
            Try SMS Scanner
          </Link>
          <span className="status-badge live">LIVE</span>
        </div>

        <div className="service-card coming-soon">
          <div className="service-icon">🔒</div>
          <h3>Advanced Security Features</h3>
          <p>Enhanced security features coming soon to protect your messages.</p>
          <ul className="service-features">
            <li>Message encryption</li>
            <li>Secure file sharing</li>
            <li>Advanced threat detection</li>
            <li>Custom security rules</li>
          </ul>
          <button className="service-button" disabled>
            Coming Soon
          </button>
          <span className="status-badge">SOON</span>
        </div>
      </div>
    </div>
  );
};

export default Services; 