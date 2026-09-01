import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaHistory, FaEye, FaLayerGroup } from 'react-icons/fa';
import { auditService } from '../services/auditService';

const tabStyle = (active) => ({
    background: 'none', border: 'none',
    padding: '0.55rem 1.4rem',
    fontWeight: 700, fontSize: '0.93rem',
    cursor: 'pointer',
    color: active ? '#2563eb' : '#64748b',
    borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s',
});

const getReportStatusMeta = (status) => {
    const value = String(status || 'SUBMITTED').toUpperCase();
    if (value === 'FORWARDED_TO_DISTRICT') return { status: 'FORWARDED_TO_DISTRICT', decision: 'Pending' };
    if (value === 'VERIFIED' || value === 'DISTRICT_VERIFIED') return { status: 'VERIFIED', decision: 'Verified' };
    if (value === 'REJECTED' || value === 'DISTRICT_REJECTED') return { status: 'REJECTED', decision: 'Rejected' };
    if (value === 'CORRECTION_REQUIRED') return { status: 'CORRECTION_REQUIRED', decision: 'Re-verification' };
    return { status: 'SUBMITTED', decision: 'Pending' };
};

const readUtilizationReports = () => {
    const reports = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('utilizationReports_')) continue;
        const email = key.replace('utilizationReports_', '');
        try {
            const savedReports = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(savedReports)) {
                savedReports.forEach((report) => {
                    const state = getReportStatusMeta(report.status);
                    if (!['FORWARDED_TO_DISTRICT', 'VERIFIED', 'DISTRICT_VERIFIED', 'REJECTED', 'DISTRICT_REJECTED', 'CORRECTION_REQUIRED'].includes(state.status) && !report.forwardedToDistrict) {
                        return;
                    }
                    reports.push({
                        ...report,
                        email,
                        beneficiary: report.beneficiaryName || localStorage.getItem('userName') || email,
                        scheme: report.schemeName || 'Unknown Scheme',
                        milestone: `${report.disbursementStage || 'Stage'} - ${report.purpose || 'Utilization'}`,
                        due: 'N/A',
                        submittedDate: report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('en-IN') : 'N/A',
                        proof: report.document?.name || 'No file',
                        requirement: `Utilized Amount: ₹${report.amountUtilized || 0}\n\nDescription:\n${report.description || 'none'}`,
                        remarks: report.officerRemarks || `Utilization Date: ${report.utilizationDate || 'N/A'}`,
                        status: state.status,
                        decision: state.decision,
                        verifiedOn: report.verifiedOn || 'N/A',
                        rawId: report.id,
                        rawEmail: email,
                        id: `ur_${report.id}`,
                    });
                });
            }
        } catch (e) {
            console.warn('Could not read district milestone reports', e);
        }
    }
    return reports;
};

const updateUtilizationStatus = (reportId, email, nextStatus, decision, remarks) => {
    const key = `utilizationReports_${email}`;
    const savedReports = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = savedReports.map((report) => {
        if (report.id !== reportId) return report;
        return {
            ...report,
            status: nextStatus,
            decision,
            officerRemarks: remarks,
            verifiedOn: new Date().toLocaleDateString('en-IN'),
            forwardedToDistrict: false,
            financeEligible: nextStatus === 'DISTRICT_VERIFIED' || nextStatus === 'VERIFIED',
        };
    });
    localStorage.setItem(key, JSON.stringify(updated));
};

const MilestoneModal = ({ item, onClose, refresh }) => {
    const [remarks, setRemarks] = useState('');
    const handle = (action) => {
        if (!remarks.trim()) { alert('Please add remarks before deciding.'); return; }
        const nextStatus = action === 'Verified' ? 'DISTRICT_VERIFIED' : action === 'Rejected' ? 'DISTRICT_REJECTED' : 'CORRECTION_REQUIRED';
        const decision = action === 'Verified' ? 'Approved by District Officer' : action === 'Rejected' ? 'Rejected by District Officer' : 'Corrections requested';
        updateUtilizationStatus(item.rawId, item.rawEmail, nextStatus, decision, remarks);
        auditService.logAction(
            `Utilization Report "${item.milestone}" (Beneficiary: ${item.beneficiary}) → ${action}: ${remarks.substring(0, 80)}`,
            'District Milestone Verification',
            'Success'
        );
        alert(`Milestone "${item.milestone}" → ${action}\nRemarks: ${remarks}`);
        refresh();
        onClose();
    };
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>Milestone Review — {item.milestone}</h3>
                        <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>{item.beneficiary} · {item.scheme}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem' }}><FaTimes /></button>
                </div>
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Requirement</strong>
                            <p style={{ margin: 0, fontSize: '0.87rem', color: '#475569' }}>{item.requirement}</p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Uploaded Proof</strong>
                            <span style={{ fontSize: '0.87rem', color: '#0284c7', textDecoration: 'underline' }}>{item.proof}</span>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Dates</strong>
                            <p style={{ margin: 0, fontSize: '0.87rem', color: '#475569' }}>
                                Due: <b>{item.due}</b><br />Submitted: <b>{item.submittedDate}</b>
                            </p>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.4rem' }}>Beneficiary Remarks</strong>
                            <p style={{ margin: 0, fontSize: '0.87rem', color: '#475569' }}>{item.remarks}</p>
                        </div>
                    </div>
                    <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem', color: '#0f172a' }}>Verification Decision</h4>
                        <div className="form-group">
                            <label>Officer Remarks <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>(Required)</span></label>
                            <textarea className="form-control" rows="3" placeholder="Enter remarks after reviewing proof..." value={remarks} onChange={e => setRemarks(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handle('Verified')} className="btn-brand" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg,#22c55e,#16a34a)', borderColor: '#22c55e' }}>
                                <FaCheckCircle /> Verify
                            </button>
                            <button onClick={() => handle('Re-verification')} className="btn-outline" style={{ flex: 1, justifyContent: 'center', color: '#d97706', borderColor: '#fcd34d' }}>
                                <FaHistory /> Request Re-verification
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

const DistrictMilestoneVerification = () => {
    const [tab, setTab] = useState('PENDING');
    const [reviewItem, setReviewItem] = useState(null);
    const [milestonePending, setMilestonePending] = useState([]);
    const [milestoneCompleted, setMilestoneCompleted] = useState([]);

    useEffect(() => {
        const pending = [];
        const completed = [];

        readUtilizationReports().forEach((report) => {
            const mapped = {
                ...report,
                beneficiary: report.beneficiary || 'Beneficiary',
                scheme: report.scheme || 'Unknown Scheme',
                milestone: report.milestone || 'Utilization Report',
                due: report.due || 'N/A',
                submittedDate: report.submittedDate || 'N/A',
                proof: report.proof || 'No file',
                remarks: report.remarks || 'No remarks',
                status: report.status,
                decision: report.decision,
                verifiedOn: report.verifiedOn || 'N/A',
            };

            if (report.status === 'FORWARDED_TO_DISTRICT') {
                pending.push(mapped);
            } else {
                completed.push(mapped);
            }
        });

        setMilestonePending(pending);
        setMilestoneCompleted(completed);
    }, []);

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>
            <div style={{ background: '#fff', padding: '1.75rem 2rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem' }}>
                        <FaLayerGroup />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.7rem', color: '#0f172a' }}>Milestone Verification</h2>
                        <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Review stage-by-stage milestone proof submissions from beneficiaries.</p>
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '0.6rem 1.2rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#d97706' }}>{milestonePending.length}</span>
                        <span style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>Pending Reviews</span>
                    </div>
                    <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.6rem 1.2rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#16a34a' }}>{milestoneCompleted.length}</span>
                        <span style={{ fontSize: '0.85rem', color: '#14532d', fontWeight: 600 }}>Completed</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.75rem' }}>
                    {[
                        ['PENDING', `Pending Reviews (${milestonePending.length})`],
                        ['COMPLETED', `Completed (${milestoneCompleted.length})`],
                    ].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)} style={tabStyle(tab === key)}>{label}</button>
                    ))}
                </div>

                {tab === 'PENDING' && (
                    <div className="animate-fade-in" style={{ background: '#fff', borderRadius: 12, padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Pending Milestone Reviews</h3>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.87rem', color: '#64748b' }}>Beneficiaries who have uploaded milestone proof and are awaiting your approval.</p>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Beneficiary</th>
                                        <th>Scheme</th>
                                        <th>Milestone</th>
                                        <th>Submitted</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {milestonePending.length === 0 ? (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No pending reviews.</td></tr>
                                    ) : milestonePending.map(m => (
                                        <tr key={m.id}>
                                            <td><strong>{m.beneficiary}</strong></td>
                                            <td>{m.scheme}</td>
                                            <td>{m.milestone}</td>
                                            <td>{m.submittedDate}</td>
                                            <td>{m.due}</td>
                                            <td><span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>🟡 Pending</span></td>
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

                {tab === 'COMPLETED' && (
                    <div className="animate-fade-in" style={{ background: '#fff', borderRadius: 12, padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ margin: '0 0 0.3rem', fontWeight: 700, color: '#0f172a' }}>Completed Milestone Verifications</h3>
                        <p style={{ margin: '0 0 1.25rem', fontSize: '0.87rem', color: '#64748b' }}>Milestones you have already reviewed and decided on.</p>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Beneficiary</th>
                                        <th>Scheme</th>
                                        <th>Milestone</th>
                                        <th>Verified On</th>
                                        <th>Decision</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {milestoneCompleted.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>No completed verifications.</td></tr>
                                    ) : milestoneCompleted.map(m => (
                                        <tr key={m.id}>
                                            <td><strong>{m.beneficiary}</strong></td>
                                            <td>{m.scheme}</td>
                                            <td>{m.milestone}</td>
                                            <td>{m.verifiedOn}</td>
                                            <td><span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>🟢 {m.decision}</span></td>
                                            <td style={{ maxWidth: 220, fontSize: '0.84rem', color: '#475569' }}>{m.remarks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {reviewItem && <MilestoneModal item={reviewItem} onClose={() => setReviewItem(null)} refresh={() => {
                const pending = [];
                const completed = [];
                readUtilizationReports().forEach((report) => {
                    const mapped = {
                        ...report,
                        beneficiary: report.beneficiary || 'Beneficiary',
                        scheme: report.scheme || 'Unknown Scheme',
                        milestone: report.milestone || 'Utilization Report',
                        due: report.due || 'N/A',
                        submittedDate: report.submittedDate || 'N/A',
                        proof: report.proof || 'No file',
                        remarks: report.remarks || 'No remarks',
                        status: report.status,
                        decision: report.decision,
                        verifiedOn: report.verifiedOn || 'N/A',
                    };
                    if (report.status === 'FORWARDED_TO_DISTRICT') pending.push(mapped);
                    else completed.push(mapped);
                });
                setMilestonePending(pending);
                setMilestoneCompleted(completed);
            }} />}
        </div>
    );
};

export default DistrictMilestoneVerification;
