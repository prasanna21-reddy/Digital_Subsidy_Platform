import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaChartBar, FaMapMarkedAlt, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { applicationService } from '../services/applicationService';
import { schemeService } from '../services/schemeService';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const AdminReports = () => {
    const [applications, setApplications] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [apps, sch] = await Promise.all([
                    applicationService.getAllApplications(),
                    schemeService.getSchemes(),
                ]);
                setApplications(Array.isArray(apps) ? apps : []);
                setSchemes(Array.isArray(sch) ? sch : []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // --- Scheme summary: group applications by scheme ---
    const schemeSummary = schemes.map(scheme => {
        const schemeApps = applications.filter(a =>
            String(a.schemeId || a.scheme?.id) === String(scheme.id) ||
            (a.scheme?.name || a.schemeName) === scheme.name
        );
        const approved = schemeApps.filter(a => ['DISTRICT_VERIFIED', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING', 'PAYMENT_SUCCESSFUL'].includes(String(a.status)));
        const disbursed = schemeApps.filter(a => ['PAYMENT_SUCCESSFUL'].includes(String(a.status)));
        const totalBudget = scheme.budget || scheme.maxAmount || 0;
        const approvedAmt = approved.length * (totalBudget / (schemeApps.length || 1));
        const disbursedAmt = disbursed.length * (totalBudget / (schemeApps.length || 1));
        const utilRate = totalBudget > 0 ? Math.round((disbursedAmt / totalBudget) * 100) : 0;
        return {
            id: scheme.id,
            name: scheme.name,
            total: schemeApps.length,
            approved: fmt(Math.round(approvedAmt)),
            disbursed: fmt(Math.round(disbursedAmt)),
            remaining: fmt(Math.max(0, Math.round(totalBudget - disbursedAmt))),
            uiRate: utilRate + '%',
        };
    }).filter(s => s.total > 0);

    // --- Compliance numbers from applications ---
    const completedMilestones = applications.filter(a => a.status === 'PAYMENT_SUCCESSFUL').length;
    const pendingMilestones = applications.filter(a => ['PENDING_FIELD_VERIFICATION', 'FIELD_VERIFIED', 'DISTRICT_VERIFIED', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING'].includes(a.status)).length;
    const overdueMilestones = 0; // no due-date tracking yet
    const totalProcessed = completedMilestones + pendingMilestones;
    const complianceRate = totalProcessed > 0 ? Math.round((completedMilestones / totalProcessed) * 100) + '%' : 'N/A';

    // --- Utilization reports from localStorage ---
    const allUrReports = (() => {
        const reports = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith('utilizationReports_')) continue;
            try {
                const arr = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(arr)) {
                    const email = key.replace('utilizationReports_', '');
                    arr.forEach(r => reports.push({ ...r, email }));
                }
            } catch (e) { }
        }
        return reports;
    })();

    const utilizationTotal = allUrReports.reduce((s, r) => s + Number(r.amountUtilized || 0), 0);
    const urVerified = allUrReports.filter(r => ['VERIFIED', 'DISTRICT_VERIFIED', 'FORWARDED_TO_DISTRICT'].includes(r.status)).length;
    const urPending = allUrReports.filter(r => !r.status || r.status === 'SUBMITTED').length;

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

            {/* Header */}
            <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>Administrative Reports</h2>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.2rem' }}>Live system analytics derived from real application and disbursement data.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => window.print()}>
                        <FaFilePdf /> Download PDF
                    </button>
                </div>
            </div>

            <div style={{ padding: '0 2rem' }}>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: 12, marginBottom: '2rem' }}>
                        Loading real-time report data…
                    </div>
                )}

                {/* Summary Metrics */}
                {!loading && (
                    <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
                        <div className="stat-card">
                            <div className="stat-icon blue"><FaChartBar /></div>
                            <div className="stat-info"><h4>{applications.length}</h4><p>Total Applications</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon emerald"><FaShieldAlt /></div>
                            <div className="stat-info"><h4>{completedMilestones}</h4><p>Completed (Paid)</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon amber"><FaChartBar /></div>
                            <div className="stat-info"><h4>{pendingMilestones}</h4><p>In-Progress</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon purple"><FaChartBar /></div>
                            <div className="stat-info"><h4>{fmt(utilizationTotal)}</h4><p>Total Utilized (Reported)</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}><FaChartBar /></div>
                            <div className="stat-info"><h4>{urVerified}/{allUrReports.length}</h4><p>Utilization Reports Verified</p></div>
                        </div>
                    </div>
                )}

                {/* Scheme Summary */}
                {!loading && (
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FaChartBar style={{ color: '#6366f1' }} /> Scheme Summary Report
                        </h3>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Scheme Name</th>
                                        <th>Total Apps</th>
                                        <th>Est. Approved Amt</th>
                                        <th>Est. Disbursed</th>
                                        <th>Remaining</th>
                                        <th>Utilization %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schemeSummary.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No applications linked to schemes yet.</td></tr>
                                    ) : schemeSummary.map(s => (
                                        <tr key={s.id}>
                                            <td><strong>{s.name}</strong></td>
                                            <td>{s.total}</td>
                                            <td>{s.approved}</td>
                                            <td style={{ color: '#16a34a', fontWeight: 600 }}>{s.disbursed}</td>
                                            <td>{s.remaining}</td>
                                            <td><span className="badge badge-submitted">{s.uiRate}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Utilization Reports Summary */}
                {!loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaMapMarkedAlt style={{ color: '#0284c7' }} /> Utilization Reports Breakdown
                            </h3>
                            <div className="custom-table-container">
                                <table className="custom-table">
                                    <thead><tr><th>Beneficiary</th><th>Scheme</th><th>Stage</th><th>Amount</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {allUrReports.length === 0
                                            ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No utilization reports submitted yet.</td></tr>
                                            : allUrReports.slice(0, 10).map((r, i) => (
                                                <tr key={r.id || i}>
                                                    <td><strong>{r.beneficiaryName || r.email}</strong></td>
                                                    <td>{r.schemeName || '—'}</td>
                                                    <td>{r.disbursementStage || '—'}</td>
                                                    <td style={{ color: '#0369a1', fontWeight: 600 }}>{fmt(r.amountUtilized)}</td>
                                                    <td>
                                                        <span className="badge" style={{
                                                            background: r.status === 'VERIFIED' || r.status === 'DISTRICT_VERIFIED' ? '#d1fae5' : r.status === 'REJECTED' ? '#fee2e2' : r.status === 'FORWARDED_TO_DISTRICT' ? '#dbeafe' : '#fef3c7',
                                                            color: r.status === 'VERIFIED' || r.status === 'DISTRICT_VERIFIED' ? '#065f46' : r.status === 'REJECTED' ? '#991b1b' : r.status === 'FORWARDED_TO_DISTRICT' ? '#1d4ed8' : '#92400e'
                                                        }}>
                                                            {r.status || 'SUBMITTED'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaExclamationTriangle style={{ color: '#d97706' }} /> Application Status Breakdown
                            </h3>
                            <div className="custom-table-container">
                                <table className="custom-table">
                                    <thead><tr><th>Status</th><th>Count</th><th>%</th></tr></thead>
                                    <tbody>
                                        {(() => {
                                            const total = applications.length || 1;
                                            const groups = {};
                                            applications.forEach(a => {
                                                const s = a.status || 'UNKNOWN';
                                                groups[s] = (groups[s] || 0) + 1;
                                            });
                                            return Object.entries(groups).length === 0
                                                ? [<tr key="empty"><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No applications found.</td></tr>]
                                                : Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                                                    <tr key={status}>
                                                        <td><span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>{status.replace(/_/g, ' ')}</span></td>
                                                        <td><strong>{count}</strong></td>
                                                        <td style={{ color: '#64748b' }}>{Math.round((count / total) * 100)}%</td>
                                                    </tr>
                                                ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}



            </div>
        </div>
    );
};

export default AdminReports;
