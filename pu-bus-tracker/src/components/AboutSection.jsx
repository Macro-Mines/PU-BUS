import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './AboutSection.css';

export default function AboutSection({ isOpen, onClose }) {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
    } else {
      const timer = setTimeout(() => {
        setRender(false);
      }, 300); // match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!render) return null;

  return createPortal(
    <div className={`about-backdrop ${isOpen ? 'open' : 'closed'}`} onClick={onClose}>
      <div className="about-modal" onClick={e => e.stopPropagation()}>
        {/* ... Rest of the component structure remains same ... */}
        <button className="about-close-btn" onClick={onClose} aria-label="Close">×</button>
        
        <div className="about-header">
          <div className="about-icon">🚌</div>
          <h2>PU BUS Tracker</h2>
          <span className="about-version">v1.0.0</span>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h3>About the App</h3>
            <p>
              PU BUS Tracker is designed to help students and staff of Pondicherry University 
              easily track university buses in real-time. It eliminates the uncertainty of waiting 
              at bus stops by providing live locations, routes, and estimated arrivals.
            </p>
          </section>

          <section className="about-section developer-section">
            <h3>Developer Profile</h3>
            <div className="developer-card">
              <div className="card-chip"></div>
              <div className="card-top">
                <div className="dev-name">ABHINAV RAJ</div>
                <div className="card-logo">❁</div>
              </div>
              
              <div className="dev-id-number">PONDICHERRY UNIVERSITY</div>
              
              <div className="dev-footer">
                <div className="dev-details">
                  <span className="detail-label">COURSE</span>
                  <span className="detail-value">MBA FINANCIAL TECHNOLOGY</span>
                  <span className="detail-value">Dept. Of Banking Technology</span>
                </div>
                
                <div className="social-links">
                  <a href="mailto:25mbaftpy0016@pondiuni.ac.in" className="social-btn email" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </a>
                  <a href="https://www.linkedin.com/in/abhinav-raj-fintech" className="social-btn linkedin" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="https://www.instagram.com/macro_mines?igsh=bTJtOTY2cXhsejFk" className="social-btn instagram" target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}
