import React, { useState } from 'react';
import {
  FaFileAlt, FaCheckCircle, FaClock, FaHistory, FaExclamationCircle,
  FaEye, FaTimes, FaUpload, FaChartBar
} from 'react-icons/fa';

/* ─── Mock Data ─── */
const allApplications = [
  {
    id: 'APP001', beneficiary: 'Ramu', age: 42, income: '₹2,00,000',
    aadhaar: 'XXXX-XXXX-1234', scheme: 'Farmer Scheme',
    schemeDesc: 'Pradhan Mantri Farmer Grant – small/marginal farmers.',
    status: 'Pending',
    docs: ['Aadhaar Card', 'Income Certificate', 'Land Registry'],
    eligibility: 'Meets criteria – income < ₹3L, land docs valid.',
    score: 78,
    scoreBreakdown: { income: 28, category: 30, documents: 20 },
  },
  {
    id: 'APP002', beneficiary: 'Suresh', age: 35, income: '₹1,50,000',
    aadhaar: 'XXXX-XXXX-9876', scheme: 'Housing Scheme',
    schemeDesc: 'Rural Housing Subsidy for pucca house construction.',
    status: 'Verified',
    docs: ['Aadhaar Card', 'Income Certificate', 'House Mapping'],
    eligibility: 'Eligible – income & location verified.',
    score: 91,
    scoreBreakdown: { income: 30, category: 40, documents: 21 },
  },
  {
    id: 'APP003', beneficiary: 'Kavitha', age: 21, income: '₹1,00,000',
    aadhaar: 'XXXX-XXXX-6543', scheme: 'Education Grant',
    schemeDesc: 'University Fee Scholarship for higher studies.',
    status: 'Pending',
    docs: ['Aadhaar Card', 'University ID', 'Income Certificate'],
    eligibility: 'Highly eligible – low income slab.',
    score: 85,
    scoreBreakdown: { income: 30, category: 35, documents: 20 },
  },
  {
    id: 'APP004', beneficiary: 'Lingam', age: 50, income: '₹2,80,000',
    aadhaar: 'XXXX-XXXX-3311', scheme: 'MSME Assist',
    schemeDesc: 'MSME working capital credit for small enterprises.',
    status: 'Re-verification',
    docs: ['Aadhaar Card', 'Udyam Certificate', 'GST Return'],
    eligibility: 'Re-check required – Udyam cert mismatch.',
    score: 52,
    scoreBreakdown: { income: 18, category: 24, documents: 10 },
  },
];

/* ─── Score helpers ─── */
const scoreColor = (s) => {
  if (s >= 75) return { text: '#059669', bg: '#d1fae5', bar: '#10b981' };
  if (s >= 50) return { text: '#d97706', bg: '#fef3c7', bar: '#f59e0b' };
  return { text: '#dc2626', bg: '#fee2e2', bar: '#ef4444' };
};

const ScoreBadge = ({ score }) => {
  const c = scoreColor(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          background: c.bg, color: c.text,
          fontWeight: 800, fontSize: '0.88rem',
          padding: '2px 10px', borderRadius: 20,
          border: `1px solid ${c.bar}22`,
          letterSpacing: '0.3px',
        }}>
          {score} / 100
        </span>
      </div>
      {/* mini progress bar */}
      <div style={{ height: 5, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', width: '100%' }}>
        <div style={{
          width: `${score}%`, height: '100%',
          background: c.bar,
          borderRadius: 4,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  const map = {
    Pending: { bg: '#fef3c7', color: '#d97706', icon: '🟡' },
    Verified: { bg: '#dcfce7', color: '#16a34a', icon: '🟢' },
    'Re-verification': { bg: '#fee2e2', color: '#ef4444', icon: '🔴' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#475569', icon: '⚪' };
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.icon} {status}</span>;
};

/* ─── View Modal ─── */
const ViewModal = ({ app, onClose }) => {
  const [remarks, setRemarks] = useState('');
  const c = scoreColor(app.score);

  const handle = (action) => {
    if ((action === 'Reject' || action === 'Re-verification') && !remarks.trim()) {
      alert('Please add remarks before ' + action);
      return;
    }
    alert(`${app.id} → ${action}\nRemarks: ${remarks}`);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '760px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>

        {/* Modal Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.35rem', color: '#0f172a' }}>Application Details — {app.id}</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>Review submitted info and take field verification action.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.3rem' }}><FaTimes /></button>
        </div>

        <div style={{ padding: '2rem' }}>

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.5rem' }}>Beneficiary Details</strong>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.7 }}>
                Name: <b>{app.beneficiary}</b><br />Age: {app.age}<br />Annual Income: {app.income}<br />Aadhaar: {app.aadhaar}
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.5rem' }}>Scheme Details</strong>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>{app.schemeDesc}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.5rem' }}>Submitted Documents</strong>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem' }}>
                {app.docs.map((d, i) => <li key={i} style={{ color: '#0284c7', cursor: 'pointer', textDecoration: 'underline', lineHeight: 1.9 }}>{d}</li>)}
              </ul>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.5rem' }}>Eligibility &amp; Status</strong>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#475569' }}>{app.eligibility}</p>
              {getStatusBadge(app.status)}
            </div>
          </div>

          {/* ── Eligibility Scoring Panel ── */}
          <div style={{ background: '#f8fafc', border: `1.5px solid ${c.bar}55`, borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.1rem' }}>
              <FaChartBar style={{ color: c.text, fontSize: '1rem' }} />
              <strong style={{ color: '#0f172a', fontSize: '1rem' }}>Eligibility Scoring</strong>
              <span style={{ marginLeft: 'auto', background: c.bg, color: c.text, fontWeight: 800, fontSize: '1.1rem', padding: '3px 18px', borderRadius: 24, border: `1px solid ${c.bar}44` }}>
                {app.score} / 100
              </span>
            </div>

            {/* Overall bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
                <span>Overall Score</span>
                <span style={{ color: c.text, fontWeight: 700 }}>
                  {app.score >= 75 ? 'High Eligibility' : app.score >= 50 ? 'Moderate Eligibility' : 'Low Eligibility'}
                </span>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${app.score}%`, height: '100%', background: `linear-gradient(90deg, ${c.bar}, ${c.bar}cc)`, borderRadius: 6, transition: 'width 0.6s ease' }} />
              </div>
            </div>

            {/* Sub-score rows */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Income Score', value: app.scoreBreakdown.income, max: 30 },
                { label: 'Category Score', value: app.scoreBreakdown.category, max: 40 },
                { label: 'Document Score', value: app.scoreBreakdown.documents, max: 30 },
              ].map(({ label, value, max }) => {
                const pct = Math.round((value / max) * 100);
                const sc = scoreColor(pct);
                return (
                  <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: sc.text }}>{value}<span style={{ fontWeight: 500, fontSize: '0.8rem', color: '#94a3b8' }}>/{max}</span></div>
                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: sc.bar, borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ margin: '1rem 0 0', fontSize: '0.82rem', color: c.text, fontWeight: 600 }}>
              {app.score >= 75
                ? '✓ Score meets threshold. Eligible for approval.'
                : app.score >= 50
                  ? '⚠ Moderate score. Requires manual field review.'
                  : '✗ Low score. Application may be flagged for rejection.'}
            </p>
          </div>

          {/* ── Field Verification Action ── */}
          <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Field Verification Action</h4>
            <div className="form-group">
              <label>Verification Remarks <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>(Required for Reject / Re-verification)</span></label>
              <textarea className="form-control" rows="3" placeholder="Enter findings from field visit..." value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Upload Verification Proof <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>(Optional)</span></label>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.25rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
                <FaUpload style={{ color: '#94a3b8', fontSize: '1.4rem', marginBottom: '0.4rem' }} />
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>Click to attach photo or document</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => handle('Verify')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderColor: '#22c55e' }}>
                <FaCheckCircle /> Verify &amp; Approve
              </button>
              <button onClick={() => handle('Re-verification')} className="btn-outline" style={{ flex: 1, justifyContent: 'center', color: '#d97706', borderColor: '#fcd34d' }}>
                <FaHistory /> Request Re-verification
              </button>
              <button onClick={() => handle('Reject')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#fb7185,#e11d48)', borderColor: '#fb7185' }}>
                <FaTimes /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Dashboard ─── */
const FieldOfficerDashboard = () => {
  const [viewApp, setViewApp] = useState(null);
  const pending = allApplications.filter(a => a.status === 'Pending');

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>
      <div style={{ background: '#fff', padding: '1.75rem 2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.7rem', color: '#0f172a' }}>Field Officer Dashboard</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Overview of your assigned workload and verification progress.</p>
      </div>

      <div style={{ padding: '0 2rem' }}>
        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card"><div className="stat-icon blue"><FaFileAlt /></div><div className="stat-info"><h4>{allApplications.length}</h4><p>Assigned Applications</p></div></div>
          <div className="stat-card"><div className="stat-icon amber"><FaClock /></div><div className="stat-info"><h4>{pending.length}</h4><p>Pending Verification</p></div></div>
          <div className="stat-card"><div className="stat-icon emerald"><FaCheckCircle /></div><div className="stat-info"><h4>{allApplications.filter(a => a.status === 'Verified').length}</h4><p>Completed Verification</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}><FaHistory /></div><div className="stat-info"><h4 style={{ color: '#b91c1c' }}>{allApplications.filter(a => a.status === 'Re-verification').length}</h4><p>Re-verification Required</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FaExclamationCircle /></div><div className="stat-info"><h4 style={{ color: '#b45309' }}>2</h4><p>Overdue Milestones</p></div></div>
        </div>

        {/* Applications Table */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontWeight: 700, color: '#0f172a' }}>Recent Verification Activity</h3>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Beneficiary</th>
                  <th>Scheme</th>
                  <th>Eligibility Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allApplications.map(app => (
                  <tr key={app.id}>
                    <td><strong>{app.id}</strong></td>
                    <td>{app.beneficiary}</td>
                    <td>{app.scheme}</td>
                    <td><ScoreBadge score={app.score} /></td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>
                      <button onClick={() => setViewApp(app)} className="btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.83rem' }}>
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewApp && <ViewModal app={viewApp} onClose={() => setViewApp(null)} />}
    </div>
  );
};

export { allApplications, getStatusBadge, ViewModal };
export default FieldOfficerDashboard;
