import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

const AdminReports = () => {

    // Reports Data
    const schemeSummary = [
        { id: 1, name: 'Farmer Scheme', total: 120, approved: '₹12,00,000', disbursed: '₹8,00,000', remaining: '₹4,00,000', uiRate: '66%' },
        { id: 2, name: 'Housing Scheme', total: 45, approved: '₹20,00,000', disbursed: '₹5,00,000', remaining: '₹15,00,000', uiRate: '25%' },
    ];

    const regionalReport = [
        { id: 1, district: 'Hyderabad', totalApps: 340, totalDisbursed: '₹45,00,000' },
        { id: 2, district: 'Warangal', totalApps: 110, totalDisbursed: '₹12,50,000' },
    ];

    const overdueReport = [
        { id: 1, beneficiary: 'Raju G.', scheme: 'Housing Scheme', milestone: 'Foundation check', due: '05 Aug', overdue: 5, status: 'Overdue' }
    ];

    const complianceReport = { comp: 420, pending: 85, overdue: 12, rate: '97%' };

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

            {/* Header */}
            <div style={{ background: '#ffffff', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>Administrative Reports</h2>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.2rem' }}>Extract macro-level system analytics, scheme utilizations, and compliance metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', borderColor: '#fca5a5' }}><FaFilePdf /> Download PDF</button>
                    <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', borderColor: '#86efac' }}><FaFileExcel /> Download Excel</button>
                </div>
            </div>

            <div style={{ padding: '0 2rem' }}>
                {/* Scheme Summary */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Scheme Summary Report</h3>
                    <div className="custom-table-container">
                        <table className="custom-table">
                            <thead><tr><th>Scheme Name</th><th>Total Apps</th><th>Approved Amount</th><th>Disbursed</th><th>Remaining</th><th>Utilization</th></tr></thead>
                            <tbody>{schemeSummary.map(s => <tr key={s.id}><td><strong>{s.name}</strong></td><td>{s.total}</td><td>{s.approved}</td><td style={{ color: '#16a34a', fontWeight: 600 }}>{s.disbursed}</td><td>{s.remaining}</td><td><span className="badge badge-submitted">{s.uiRate}</span></td></tr>)}</tbody>
                        </table>
                    </div>
                </div>

                {/* Regional & Overdue */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Regional Report</h3>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead><tr><th>District</th><th>Total Apps</th><th>Total Disbursed</th></tr></thead>
                                <tbody>{regionalReport.map(r => <tr key={r.id}><td><strong>{r.district}</strong></td><td>{r.totalApps}</td><td>{r.totalDisbursed}</td></tr>)}</tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Overdue Report</h3>
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead><tr><th>Beneficiary</th><th>Scheme</th><th>Milestone</th><th>Overdue</th></tr></thead>
                                <tbody>{overdueReport.map(r => <tr key={r.id}><td>{r.beneficiary}</td><td>{r.scheme}</td><td>{r.milestone}</td><td><span className="badge" style={{ background: '#fee2e2', color: '#ef4444' }}>{r.overdue} Days</span></td></tr>)}</tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Compliance Report */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#0f172a' }}>Compliance Report</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a' }}>{complianceReport.comp}</div><div style={{ color: '#15803d' }}>Completed Milestones</div>
                        </div>
                        <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fde68a', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>{complianceReport.pending}</div><div style={{ color: '#b45309' }}>Pending Milestones</div>
                        </div>
                        <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{complianceReport.overdue}</div><div style={{ color: '#b91c1c' }}>Overdue Milestones</div>
                        </div>
                        <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bae6fd', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7' }}>{complianceReport.rate}</div><div style={{ color: '#0369a1' }}>Compliance Rate</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminReports;
