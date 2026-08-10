import React, { useState } from 'react';
import { FaCheckCircle, FaTimes, FaHistory, FaEye } from 'react-icons/fa';

const milestonePending = [
    { id: 1, beneficiary: 'Ramu', scheme: 'Farmer Scheme', milestone: 'Stage 1 Proof', due: '10 Aug', status: 'Pending', requirement: 'Photograph of field with crops planted. Area: 1.5 hectares.', proof: 'farmer_stage1_proof.jpg', submittedDate: '08 Aug', remarks: 'Crop planting completed on 07 Aug.' },
    { id: 2, beneficiary: 'Suresh', scheme: 'Housing Scheme', milestone: 'Foundation Certificate', due: '12 Aug', status: 'Pending', requirement: 'Structural engineer sign-off on foundation layer.', proof: 'housing_foundation.pdf', submittedDate: '09 Aug', remarks: 'Foundation laid on 05 Aug, engineer inspected.' },
];

const milestoneCompleted = [
    { id: 1, beneficiary: 'Kavitha', scheme: 'Education Grant', milestone: 'Enrollment Proof', verifiedDate: '05 Aug', remarks: 'University ID and admission letter verified.', status: 'Verified' },
    { id: 2, beneficiary: 'Lingam', scheme: 'MSME Assist', milestone: 'GST Registration', verifiedDate: '06 Aug', remarks: 'GST certificate confirmed and cross-checked.', status: 'Verified' },
];

const tabStyle = (active) => ({
    background: 'none', border: 'none', padding: '0.55rem 1.25rem',
    fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
    color: active ? '#0284c7' : '#64748b',
    borderBottom: active ? '3px solid #0284c7' : '3px solid transparent',
    marginBottom: '-0.65rem', transition: 'all 0.2s',
});

const ReviewModal = ({ milestone, onClose }) => {
    const [remarks, setRemarks] = useState('');
    const handle = (action) => {
        if ((action === 'Reject' || action === 'Re-verification') && !remarks.trim()) {
            alert('Please add remarks before ' + action);
            return;
        }
        alert(`Milestone "${milestone.milestone}" → ${action}\nRemarks: ${remarks}`);
        onClose();
    };
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>Milestone Review — {milestone.milestone}</h3>
                        <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>{milestone.beneficiary} · {milestone.scheme}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem' }}><FaTimes /></button>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Milestone Requirement</strong>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>{milestone.requirement}</p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Uploaded Proof</strong>
                            <a href="#" style={{ fontSize: '0.88rem', color: '#0284c7', textDecoration: 'underline' }}>{milestone.proof}</a>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Dates</strong>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                                Due Date: <b>{milestone.due}</b><br />Submitted: <b>{milestone.submittedDate}</b>
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Beneficiary Remarks</strong>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>{milestone.remarks}</p>
                        </div>
                    </div>
                    <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Verification Decision</h4>
                        <div className="form-group">
                            <label>Officer Remarks <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>(Required for Reject / Re-verification)</span></label>
                            <textarea className="form-control" rows="3" placeholder="Enter remarks after reviewing the submitted proof..." value={remarks} onChange={e => setRemarks(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handle('Verify')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderColor: '#22c55e' }}>
                                <FaCheckCircle /> Verify
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

const FieldMilestoneVerification = () => {
    const [tab, setTab] = useState('PENDING');
    const [reviewItem, setReviewItem] = useState(null);

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>
            <div style={{ background: '#fff', padding: '1.75rem 2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.7rem', color: '#0f172a' }}>Milestone Verification</h2>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Stage-by-stage milestone proof review — primarily Milestone 3.</p>
            </div>

            <div style={{ padding: '0 2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem' }}>
                    {[['PENDING', 'Pending'], ['COMPLETED', 'Completed']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)} style={tabStyle(tab === key)}>{label}</button>
                    ))}
                </div>

                {/* PENDING */}
                {tab === 'PENDING' && (
                    <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Pending Milestone Reviews</h3>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: '#64748b' }}>Beneficiaries who have uploaded proof and are waiting for your review.</p>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead><tr><th>Beneficiary</th><th>Scheme</th><th>Milestone</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {milestonePending.map(m => (
                                        <tr key={m.id}>
                                            <td><strong>{m.beneficiary}</strong></td>
                                            <td>{m.scheme}</td>
                                            <td>{m.milestone}</td>
                                            <td>{m.due}</td>
                                            <td><span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>🟡 {m.status}</span></td>
                                            <td>
                                                <button onClick={() => setReviewItem(m)} className="btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.83rem' }}>
                                                    <FaEye /> Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* COMPLETED */}
                {tab === 'COMPLETED' && (
                    <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '12px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Completed Milestone Verifications</h3>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: '#64748b' }}>Milestones that have been successfully verified by you.</p>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead><tr><th>Beneficiary</th><th>Scheme</th><th>Milestone</th><th>Verified On</th><th>Remarks</th><th>Status</th></tr></thead>
                                <tbody>
                                    {milestoneCompleted.map(m => (
                                        <tr key={m.id}>
                                            <td><strong>{m.beneficiary}</strong></td>
                                            <td>{m.scheme}</td>
                                            <td>{m.milestone}</td>
                                            <td>{m.verifiedDate}</td>
                                            <td style={{ maxWidth: '220px', fontSize: '0.85rem', color: '#475569' }}>{m.remarks}</td>
                                            <td><span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>🟢 {m.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {reviewItem && <ReviewModal milestone={reviewItem} onClose={() => setReviewItem(null)} />}
        </div>
    );
};

export default FieldMilestoneVerification;
