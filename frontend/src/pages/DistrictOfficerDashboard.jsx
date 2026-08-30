import React, { useState } from 'react';
import {
    FaCheckCircle, FaClock, FaFileAlt, FaEye, FaTimes,
    FaHistory, FaLayerGroup, FaUserCheck
} from 'react-icons/fa';

/* ─── Mock Data ─── */
const pendingApplications = [
    { id: 'APP005', beneficiary: 'Anitha Reddy', age: 38, income: '₹1,80,000', scheme: 'Farmer Subsidy', fieldVerified: '08 Aug 2026', fieldOfficer: 'Rajan K.', score: 82, docs: ['Aadhaar Card', 'Land Pattadar', 'Income Cert'], fieldRemarks: 'Crops visible during ground visit. Land records match.' },
    { id: 'APP006', beneficiary: 'Mohan Das', age: 45, income: '₹2,40,000', scheme: 'Housing Scheme', fieldVerified: '07 Aug 2026', fieldOfficer: 'Priya S.', score: 67, docs: ['Aadhaar Card', 'House Plan', 'Income Cert'], fieldRemarks: 'Foundation laid. Structural report attached.' },
    { id: 'APP007', beneficiary: 'Lakshmi T.', age: 28, income: '₹90,000', scheme: 'Education Grant', fieldVerified: '09 Aug 2026', fieldOfficer: 'Rajan K.', score: 91, docs: ['Aadhaar Card', 'University ID', 'Fee Receipt'], fieldRemarks: 'Enrolled in B.Tech 2nd year. All docs valid.' },
];

const completedApplications = [
    { id: 'APP003', beneficiary: 'Kavitha P.', scheme: 'Education Grant', decision: 'Approved', decidedDate: '06 Aug 2026', remarks: 'All criteria met. Forwarded to Finance.' },
    { id: 'APP004', beneficiary: 'Lingam R.', scheme: 'MSME Assist', decision: 'Rejected', decidedDate: '05 Aug 2026', remarks: 'Udyam certificate mismatch detected.' },
];

const milestonePending = [
    { id: 1, beneficiary: 'Anitha Reddy', scheme: 'Farmer Subsidy', milestone: 'Stage 2 – Progress Report', due: '12 Aug 2026', submittedDate: '10 Aug 2026', proof: 'stage2_progress.pdf', requirement: 'Field progress photo and agronomist sign-off for stage 2 disbursement.', remarks: 'Second crop cycle started as per schedule.' },
    { id: 2, beneficiary: 'Mohan Das', scheme: 'Housing Scheme', milestone: 'Lintel Level Certificate', due: '15 Aug 2026', submittedDate: '10 Aug 2026', proof: 'lintel_cert.pdf', requirement: 'Engineer certificate showing construction up to lintel level.', remarks: 'Lintel work completed 09 Aug. Certificate attached.' },
];

/* ─── Helpers ─── */
const scoreColor = (s) => {
    if (s >= 75) return { text: '#059669', bg: '#d1fae5', bar: '#10b981' };
    if (s >= 50) return { text: '#d97706', bg: '#fef3c7', bar: '#f59e0b' };
    return { text: '#dc2626', bg: '#fee2e2', bar: '#ef4444' };
};

const ScoreChip = ({ score }) => {
    const c = scoreColor(score);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 90 }}>
            <span style={{ background: c.bg, color: c.text, fontWeight: 800, fontSize: '0.85rem', padding: '2px 10px', borderRadius: 20 }}>
                {score} / 100
            </span>
            <div style={{ height: 4, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: c.bar, borderRadius: 4 }} />
            </div>
        </div>
    );
};

/* ─── Application Detail Modal ─── */
const AppModal = ({ app, onClose }) => {
    const [remarks, setRemarks] = useState('');
    const handle = (action) => {
        if (!remarks.trim()) { alert('Please add officer remarks before deciding.'); return; }
        alert(`${app.id} → ${action}\nRemarks: ${remarks}`);
        onClose();
    };
    const c = scoreColor(app.score);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 740, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem', color: '#0f172a' }}>District Review — {app.id}</h3>
                        <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.87rem' }}>Field-verified application awaiting your secondary scrutiny.</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.3rem' }}><FaTimes /></button>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Beneficiary Details</strong>
                            <p style={{ margin: 0, fontSize: '0.87rem', color: '#475569', lineHeight: 1.7 }}>
                                Name: <b>{app.beneficiary}</b><br />Age: {app.age}<br />Income: {app.income}
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Field Verification</strong>
                            <p style={{ margin: 0, fontSize: '0.87rem', color: '#475569', lineHeight: 1.7 }}>
                                Officer: <b>{app.fieldOfficer}</b><br />Verified: {app.fieldVerified}<br />
                                Remarks: <i>{app.fieldRemarks}</i>
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Submitted Documents</strong>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.87rem' }}>
                                {app.docs.map((d, i) => <li key={i} style={{ color: '#0284c7', textDecoration: 'underline', lineHeight: 1.9, cursor: 'pointer' }}>{d}</li>)}
                            </ul>
                        </div>
                        <div style={{ background: c.bg, border: `1px solid ${c.bar}44`, padding: '1rem', borderRadius: 8 }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.6rem' }}>Eligibility Score</strong>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: c.text }}>{app.score}<span style={{ fontSize: '1rem', fontWeight: 500, color: '#94a3b8' }}>/100</span></div>
                            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                                <div style={{ width: `${app.score}%`, height: '100%', background: c.bar, borderRadius: 4 }} />
                            </div>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: c.text, fontWeight: 600 }}>
                                {app.score >= 75 ? '✓ High Eligibility' : app.score >= 50 ? '⚠ Moderate' : '✗ Low Eligibility'}
                            </p>
                        </div>
                    </div>
                    <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem', color: '#0f172a' }}>District Officer Decision</h4>
                        <div className="form-group">
                            <label>Officer Remarks <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>(Required)</span></label>
                            <textarea className="form-control" rows="3" placeholder="Enter your scrutiny notes..." value={remarks} onChange={e => setRemarks(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handle('Approved')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderColor: '#22c55e' }}>
                                <FaCheckCircle /> Approve &amp; Forward
                            </button>
                            <button onClick={() => handle('Re-verification')} className="btn-outline" style={{ flex: 1, justifyContent: 'center', color: '#d97706', borderColor: '#fcd34d' }}>
                                <FaHistory /> Send Back
                            </button>
                            <button onClick={() => handle('Rejected')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#fb7185,#e11d48)', borderColor: '#fb7185' }}>
                                <FaTimes /> Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Main Dashboard (Review Portal only) ─── */
const DistrictOfficerDashboard = () => {
    const [viewApp, setViewApp] = useState(null);

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

            {/* Header */}
            <div style={{ background: '#fff', padding: '1.75rem 2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.7rem', color: '#0f172a' }}>District Review Portal</h2>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Secondary scrutiny of field-verified applications before forwarding to Finance.</p>
            </div>

            <div style={{ padding: '0 2rem' }}>

                {/* Summary Cards */}
                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card"><div className="stat-icon amber"><FaClock /></div><div className="stat-info"><h4>{pendingApplications.length}</h4><p>Pending Review</p></div></div>
                    <div className="stat-card"><div className="stat-icon emerald"><FaCheckCircle /></div><div className="stat-info"><h4>{completedApplications.filter(a => a.decision === 'Approved').length}</h4><p>Approved</p></div></div>
                    <div className="stat-card"><div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}><FaTimes /></div><div className="stat-info"><h4 style={{ color: '#b91c1c' }}>{completedApplications.filter(a => a.decision === 'Rejected').length}</h4><p>Rejected</p></div></div>
                    <div className="stat-card"><div className="stat-icon blue"><FaLayerGroup /></div><div className="stat-info"><h4>{milestonePending.length}</h4><p>Milestones Pending</p></div></div>
                </div>

                {/* Pending Applications */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', marginBottom: '1.75rem' }}>
                    <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Pending Secondary Review</h3>
                    <p style={{ margin: '0 0 1.25rem', fontSize: '0.87rem', color: '#64748b' }}>Applications field-verified and forwarded for your scrutiny.</p>
                    <div className="custom-table-container">
                        <table className="custom-table">
                            <thead><tr><th>App ID</th><th>Beneficiary</th><th>Scheme</th><th>Field Officer</th><th>Eligibility Score</th><th>Action</th></tr></thead>
                            <tbody>
                                {pendingApplications.map(app => (
                                    <tr key={app.id}>
                                        <td><strong>{app.id}</strong></td>
                                        <td>{app.beneficiary}</td>
                                        <td>{app.scheme}</td>
                                        <td>{app.fieldOfficer}</td>
                                        <td><ScoreChip score={app.score} /></td>
                                        <td>
                                            <button onClick={() => setViewApp(app)} className="btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.83rem' }}>
                                                <FaEye /> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Past Decisions */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Past Decisions</h3>
                    <p style={{ margin: '0 0 1.25rem', fontSize: '0.87rem', color: '#64748b' }}>Applications you have already reviewed and decided on.</p>
                    <div className="custom-table-container">
                        <table className="custom-table">
                            <thead><tr><th>App ID</th><th>Beneficiary</th><th>Scheme</th><th>Decision</th><th>Date</th><th>Remarks</th></tr></thead>
                            <tbody>
                                {completedApplications.map(app => (
                                    <tr key={app.id}>
                                        <td><strong>{app.id}</strong></td>
                                        <td>{app.beneficiary}</td>
                                        <td>{app.scheme}</td>
                                        <td>
                                            <span className="badge" style={{ background: app.decision === 'Approved' ? '#dcfce7' : '#fee2e2', color: app.decision === 'Approved' ? '#16a34a' : '#dc2626' }}>
                                                {app.decision === 'Approved' ? '🟢' : '🔴'} {app.decision}
                                            </span>
                                        </td>
                                        <td>{app.decidedDate}</td>
                                        <td style={{ maxWidth: 220, fontSize: '0.84rem', color: '#475569' }}>{app.remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {viewApp && <AppModal app={viewApp} onClose={() => setViewApp(null)} />}
        </div>
    );
};

export default DistrictOfficerDashboard;
