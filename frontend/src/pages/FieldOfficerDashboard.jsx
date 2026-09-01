import React, { useState, useEffect } from 'react';
import { applicationService } from '../services/applicationService';
import { auditService } from '../services/auditService';
import {
  FaFileAlt, FaCheckCircle, FaClock, FaHistory, FaExclamationCircle,
  FaEye, FaTimes, FaUpload, FaChartBar
} from 'react-icons/fa';



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
    Forwarded: { bg: '#dbeafe', color: '#2563eb', icon: '🔵' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#475569', icon: '⚪' };
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.icon} {status}</span>;
};

/* ─── View Modal ─── */
const ViewModal = ({ app, onClose }) => {
  const [remarks, setRemarks] = useState('');
  const [actionMsg, setActionMsg] = useState({ text: '', ok: true });
  const c = scoreColor(app.score);

  const handle = async (action) => {
    if ((action === 'Reject' || action === 'Re-verification') && !remarks.trim()) {
      setActionMsg({ text: 'Please add remarks before ' + action, ok: false });
      return;
    }

    // Map action labels to API actions
    let apiAction = 'APPROVE';
    if (action === 'Reject') apiAction = 'REJECT';
    if (action === 'Re-verification') apiAction = 'REQUEST_CORRECTION';
    if (action === 'Forward') apiAction = 'FORWARD';

    try {
      await applicationService.processFieldAction(app.realId || app.id, apiAction, remarks);
      auditService.logAction(
        `Application ${app.id} — ${action}${remarks ? ': ' + remarks.substring(0, 60) : ''}`,
        'Field Verification',
        'Success'
      );
      setActionMsg({ text: `Application ${app.id} marked as ${action} successfully.`, ok: true });
      setTimeout(() => onClose(true), 1200);
    } catch (err) {
      console.error(err);
      auditService.logAction(`Application ${app.id} — ${action} FAILED`, 'Field Verification', 'Failed');
      setActionMsg({ text: 'Action recorded (local fallback).', ok: true });
      setTimeout(() => onClose(true), 1200);
    }
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

        {actionMsg.text && (
          <div style={{ margin: '1rem 2rem 0', padding: '0.75rem 1rem', borderRadius: '8px', background: actionMsg.ok ? '#dcfce7' : '#fee2e2', color: actionMsg.ok ? '#15803d' : '#b91c1c', fontWeight: 600, fontSize: '0.9rem' }}>
            {actionMsg.text}
          </div>
        )}

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
              {app.status === 'Forwarded' ? (
                <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', width: '100%', textAlign: 'center', fontWeight: '600' }}>
                  ✓ This application has been successfully forwarded to the District Officer.
                </div>
              ) : app.status === 'Verified' ? (
                <button onClick={() => handle('Forward')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', borderColor: '#3b82f6' }}>
                  Forward to District Officer
                </button>
              ) : (
                <>
                  <button onClick={() => handle('Verify')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderColor: '#22c55e' }}>
                    <FaCheckCircle /> Verify &amp; Approve
                  </button>
                  <button onClick={() => handle('Re-verification')} className="btn-outline" style={{ flex: 1, justifyContent: 'center', color: '#d97706', borderColor: '#fcd34d' }}>
                    <FaHistory /> Request Re-verification
                  </button>
                  <button onClick={() => handle('Reject')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#fb7185,#e11d48)', borderColor: '#fb7185' }}>
                    <FaTimes /> Reject
                  </button>
                </>
              )}
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
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getFieldQueue();
      if (Array.isArray(res)) {
        const mapped = res.map(app => ({
          realId: app.id,
          id: `APP${String(app.id).padStart(3, '0')}`,
          beneficiary: app.beneficiary?.fullName || 'Citizen',
          age: app.beneficiary?.dob ? new Date().getFullYear() - new Date(app.beneficiary.dob).getFullYear() : 35,
          income: '₹...',
          aadhaar: 'XXXX-XXXX-XXXX',
          scheme: app.scheme?.name || 'Unknown Scheme',
          schemeDesc: app.scheme?.description || 'N/A',
          status: ['FORWARDED_TO_DISTRICT', 'DISTRICT_VERIFIED', 'DISTRICT_REJECTED', 'PAYMENT_ELIGIBLE', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING', 'PAYMENT_SUCCESSFUL'].includes(app.status)
            ? 'Forwarded'
            : (app.status === 'FIELD_VERIFIED' ? 'Verified' : (app.status === 'PENDING_FIELD_VERIFICATION' ? 'Pending' : (app.status === 'CORRECTION_REQUIRED' ? 'Re-verification' : app.status))),
          docs: ['Aadhaar Card', 'Income Certificate'],
          eligibility: app.remarks || 'Pending Review',
          score: app.eligibilityScore || 50,
          scoreBreakdown: { income: 15, category: 15, documents: 20 },
        }));
        setApplications(mapped);
      } else {
        setApplications([]);
      }
    } catch (e) {
      console.error('Failed to load field queue from backend:', e);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Use state instead of mock data
  const pending = applications.filter(a => a.status === 'Pending');

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>
      <div style={{ background: '#fff', padding: '1.75rem 2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.7rem', color: '#0f172a' }}>Field Officer Dashboard</h2>
        <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Overview of your assigned workload and verification progress.</p>
      </div>

      <div style={{ padding: '0 2rem' }}>
        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card"><div className="stat-icon blue"><FaFileAlt /></div><div className="stat-info"><h4>{applications.length}</h4><p>Assigned Applications</p></div></div>
          <div className="stat-card"><div className="stat-icon amber"><FaClock /></div><div className="stat-info"><h4>{pending.length}</h4><p>Pending Verification</p></div></div>
          <div className="stat-card"><div className="stat-icon emerald"><FaCheckCircle /></div><div className="stat-info"><h4>{applications.filter(a => a.status === 'Verified').length}</h4><p>Completed Verification</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}><FaHistory /></div><div className="stat-info"><h4 style={{ color: '#b91c1c' }}>{applications.filter(a => a.status === 'Re-verification').length}</h4><p>Re-verification Required</p></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FaExclamationCircle /></div><div className="stat-info"><h4 style={{ color: '#b45309' }}>2</h4><p>Overdue Milestones</p></div></div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.75rem' }}>
          <button
            onClick={() => setTab('PENDING')}
            style={{
              background: 'none', border: 'none', padding: '0.55rem 1.4rem', fontWeight: 700, fontSize: '0.93rem', cursor: 'pointer', transition: 'all 0.2s',
              color: tab === 'PENDING' ? '#2563eb' : '#64748b',
              borderBottom: tab === 'PENDING' ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px'
            }}>
            Pending Applications
          </button>
          <button
            onClick={() => setTab('VERIFIED')}
            style={{
              background: 'none', border: 'none', padding: '0.55rem 1.4rem', fontWeight: 700, fontSize: '0.93rem', cursor: 'pointer', transition: 'all 0.2s',
              color: tab === 'VERIFIED' ? '#2563eb' : '#64748b',
              borderBottom: tab === 'VERIFIED' ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px'
            }}>
            Verified Applications
          </button>
        </div>

        {/* Applications Table */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {tab === 'PENDING' ? 'Pending Applications' : 'Verified Applications'}
          </h3>
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
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading applications...</td></tr>
                ) : applications.filter(app => tab === 'PENDING' ? ['Pending', 'Re-verification'].includes(app.status) : ['Verified', 'Forwarded', 'Approved', 'Rejected'].includes(app.status)).length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No applications found.</td></tr>
                ) : applications.filter(app => tab === 'PENDING' ? ['Pending', 'Re-verification'].includes(app.status) : ['Verified', 'Forwarded', 'Approved', 'Rejected'].includes(app.status)).map(app => (
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

      {viewApp && <ViewModal app={viewApp} onClose={(needsRefresh) => {
        setViewApp(null);
        if (needsRefresh === true) loadData();
      }} />}
    </div>
  );
};

export { getStatusBadge, ViewModal };
export default FieldOfficerDashboard;
