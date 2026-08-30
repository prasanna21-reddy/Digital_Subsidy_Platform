import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane, FaCheckCircle, FaHeadset, FaCommentAlt } from 'react-icons/fa';
import '../styles/Footer.css';

const Footer = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('General Feedback');
  const [citizenContact, setCitizenContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
      setCitizenContact('');
      alert('Thank you! Your feedback/grievance has been recorded. Reference Ticket: #FBK-' + Math.floor(100000 + Math.random() * 900000));
    }, 1500);
  };

  return (
    <footer className="footer">
      <div className="container footer-container">
        
        {/* Column 1: System Info */}
        <div className="footer-section">
          <h3>Government Subsidy Tracking System</h3>
          <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Official Direct Benefit Transfer (DBT) Portal for transparent, end-to-end subsidy tracking, eligibility verification, and grant disbursement.
          </p>
          <div style={{ background: '#f0f9ff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.82rem', color: '#0369a1', fontWeight: 600 }}>
            ✓ Verified Government Direct Benefit Transfer Portal
          </div>
        </div>

        {/* Column 2: Helpline & Support Details */}
        <div className="footer-section">
          <h4><FaHeadset style={{ color: '#0284c7', marginRight: '0.5rem' }} /> Helpline & Support</h4>
          <ul className="support-list">
            <li>
              <FaPhoneAlt style={{ color: '#0284c7' }} />
              <div>
                <strong>Toll-Free Helpline:</strong>
                <div>1800-180-1551 / 1800-11-0001</div>
              </div>
            </li>
            <li>
              <FaEnvelope style={{ color: '#0284c7' }} />
              <div>
                <strong>Support Email:</strong>
                <div>helpdesk@dbt.gov.in</div>
              </div>
            </li>
            <li>
              <FaClock style={{ color: '#0284c7' }} />
              <div>
                <strong>Working Hours:</strong>
                <div>Mon - Sat: 9:00 AM - 6:00 PM IST</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Column 3: Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/schemes">All Active Schemes</Link></li>
            <li><Link to="/track-status">Track Application Status</Link></li>
            <li><Link to="/utilization-report">Fund Utilization Analytics</Link></li>
            <li><Link to="/login?type=officer">Officer Sign In Portal</Link></li>
          </ul>
        </div>

        {/* Column 4: Citizen Feedback & Portal Inquiry */}
        <div className="footer-section">
          <h4><FaCommentAlt style={{ color: '#0284c7', marginRight: '0.5rem' }} /> Citizen Feedback</h4>
          <form onSubmit={handleFeedbackSubmit} className="feedback-form">
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="feedback-input"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            >
              <option value="General Feedback">General Feedback</option>
              <option value="Portal Issue">Report Technical Issue</option>
              <option value="Application Inquiry">Application Status Inquiry</option>
              <option value="Grievance">File Citizen Grievance</option>
            </select>

            <input
              type="text"
              placeholder="Your Email or Phone (Optional)"
              value={citizenContact}
              onChange={(e) => setCitizenContact(e.target.value)}
              className="feedback-input"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            />

            <textarea
              placeholder="Write your feedback or inquiry here..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows="2"
              className="feedback-input"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', resize: 'none' }}
              required
            />

            <button type="submit" className="btn-brand" style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem', justifyContent: 'center' }} disabled={submitted}>
              {submitted ? <><FaCheckCircle /> Submitting...</> : <><FaPaperPlane /> Submit Feedback</>}
            </button>
          </form>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Government Subsidy & Grant Disbursement System. Department of Direct Benefit Transfer.</p>
      </div>
    </footer>
  );
};

export default Footer;
