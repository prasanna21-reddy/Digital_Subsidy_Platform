import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaShieldAlt, FaArrowRight, FaCalculator
} from 'react-icons/fa';

const Home = () => {
  return (
    <div className="home-container animate-fade-in" style={{ paddingBottom: '3rem', background: '#ffffff' }}>

      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '3.5rem 2rem', marginBottom: '3rem' }}>
        <span className="badge badge-submitted" style={{ marginBottom: '1rem', padding: '0.45rem 1.1rem', background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a' }}>
          <FaShieldAlt /> Direct Benefit Transfer (DBT) National Tracking Portal
        </span>
        <h1 className="hero-title">
          Transparent & Digitized Government Subsidy Tracking
        </h1>
        <p className="hero-subtitle">
          Empowering citizens with automated eligibility verification, multi-stage transparent officer approvals, and direct bank disbursement tracking.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn-brand" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', textDecoration: 'none' }}>
            Apply for Subsidy <FaArrowRight />
          </Link>
          <Link to="/login" className="btn-outline" style={{ padding: '0.85rem 2rem', fontSize: '1.05rem', textDecoration: 'none' }}>
            Track Application Status
          </Link>
        </div>
      </section>

      {/* 4-Step Approval Lifecycle */}
      <section className="glass-card" style={{ padding: '2.5rem', margin: '3rem 0', background: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a' }}>How the Subsidy Workflow Operates</h2>
          <p style={{ color: '#475569' }}>From online application to direct bank account disbursement</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>

          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              1
            </div>
            <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>1. Citizen Submission</h4>
            <p style={{ fontSize: '0.88rem', color: '#475569' }}>Fill online application form, select target scheme, and input identity & income attributes.</p>
          </div>

          <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fef08a' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              <FaCalculator />
            </div>
            <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>2. Automated Scoring</h4>
            <p style={{ fontSize: '0.88rem', color: '#475569' }}>System computes an automated eligibility score out of 100 based on Income, Category, and Documents.</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#faf5ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              3
            </div>
            <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>3. 3-Officer Review</h4>
            <p style={{ fontSize: '0.88rem', color: '#475569' }}>Field Officer ground-check → District Officer scrutiny → Finance Officer final approval.</p>
          </div>

          <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #a7f3d0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#d1fae5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1rem' }}>
              4
            </div>
            <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>4. Bank Disbursement</h4>
            <p style={{ fontSize: '0.88rem', color: '#475569' }}>Direct credit to beneficiary bank account with instant transaction reference tracking number.</p>
          </div>

        </div>
      </section>

      {/* Active Schemes Grid */}
      <section style={{ margin: '3rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Active Government Welfare Schemes</h2>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>Check eligibility guidelines and apply online</p>
          </div>
          <Link to="/schemes" className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}>
            View All Schemes →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
            <div>
              <span className="badge badge-submitted" style={{ marginBottom: '0.75rem' }}>Housing Welfare</span>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>Pradhan Mantri Awas Yojana</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Financial housing assistance grant for economically weaker sections & low income families.</p>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <strong>Eligibility:</strong> Annual income ≤ ₹3,00,000 / Category: General, OBC, SC, ST
              </div>
            </div>
            <Link to="/login" className="btn-brand" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
              Apply Now
            </Link>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
            <div>
              <span className="badge badge-approved" style={{ marginBottom: '0.75rem' }}>Agriculture</span>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>PM-KISAN Samman Nidhi</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Direct annual income support of ₹6,000 in three equal installments for land-holding farmer families.</p>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '1.25rem', padding: '0.75rem', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a' }}>
                <strong>Eligibility:</strong> Small & marginal farmers with valid land records.
              </div>
            </div>
            <Link to="/login" className="btn-emerald" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
              Apply Now
            </Link>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff' }}>
            <div>
              <span className="badge badge-review" style={{ marginBottom: '0.75rem' }}>Education</span>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem' }}>National Higher Education Grant</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Scholarship grant for undergraduate & postgraduate students.</p>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                <strong>Eligibility:</strong> Students with family annual income below ₹2,50,000.
              </div>
            </div>
            <Link to="/login" className="btn-brand" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
              Apply Now
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
