import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaClock, FaCheckCircle, FaLock, FaSpinner, FaFolderOpen } from 'react-icons/fa';
import { applicationService } from '../services/applicationService';

const getStatusCode = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'PAYMENT_SUCCESSFUL') return 'success';
    if (['APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING', 'DISTRICT_VERIFIED'].includes(s)) return 'pending';
    if (['PENDING_FIELD_VERIFICATION', 'FIELD_VERIFIED', 'FORWARDED_TO_DISTRICT'].includes(s)) return 'locked';
    if (['REJECTED', 'DISTRICT_REJECTED'].includes(s)) return 'rejected';
    return 'locked';
};

const getStageLabel = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'PAYMENT_SUCCESSFUL') return 'Stage 3 – Completed';
    if (['APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING'].includes(s)) return 'Stage 2 – Payment Ready';
    if (s === 'DISTRICT_VERIFIED') return 'Stage 2 – District Approved';
    if (['FIELD_VERIFIED', 'FORWARDED_TO_DISTRICT'].includes(s)) return 'Stage 1 – Field Verified';
    return 'Stage 1 – Pending';
};

const StatusBadge = ({ code, label }) => {
    const map = {
        success: { bg: '#dcfce7', color: '#16a34a', emoji: '🟢' },
        pending: { bg: '#fef3c7', color: '#d97706', emoji: '🟡' },
        locked: { bg: '#f1f5f9', color: '#64748b', emoji: '⚪' },
        rejected: { bg: '#fee2e2', color: '#ef4444', emoji: '🔴' },
    };
    const s = map[code] || map.locked;
    return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.emoji} {label}</span>;
};

const StageTracker = ({ status }) => {
    const s = String(status || '').toUpperCase();
    const activeStage = s === 'PAYMENT_SUCCESSFUL' ? 3 : ['DISTRICT_VERIFIED', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING'].includes(s) ? 2 : 1;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
            {[1, 2, 3].map(stage => (
                <React.Fragment key={stage}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeStage >= stage ? '#16a34a' : '#94a3b8' }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: '50%',
                            background: activeStage > stage ? '#16a34a' : activeStage === stage ? '#f59e0b' : '#e2e8f0',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2
                        }}>
                            {activeStage > stage
                                ? <FaCheckCircle size={10} />
                                : activeStage === stage
                                    ? <FaSpinner size={10} />
                                    : <FaLock size={8} />}
                        </div>
                        Stg {stage}
                    </div>
                    {stage < 3 && <div style={{ height: 2, width: 15, background: activeStage > stage ? '#16a34a' : '#e2e8f0', marginTop: -12 }} />}
                </React.Fragment>
            ))}
        </div>
    );
};

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

const Disbursements = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const apps = await applicationService.getAllApplications();
                const history = [];

                if (Array.isArray(apps)) {
                    apps.forEach(app => {
                        let name = app.beneficiary?.user?.fullName || app.beneficiary?.fullName || app.beneficiary?.email || app.applicantName || 'Beneficiary';
                        if (!name || name === 'Citizen') name = app.beneficiary?.user?.email || app.beneficiary?.email || 'Beneficiary';
                        if (name.includes('@')) name = name.split('@')[0];

                        history.push({
                            id: app.id,
                            appId: `APP${String(app.id).padStart(3, '0')}`,
                            beneficiary: name,
                            scheme: app.scheme?.name || 'Unknown Scheme',
                            stageNum: app.status === 'PAYMENT_SUCCESSFUL' ? 1.5 : (['DISTRICT_VERIFIED', 'APPROVED_FOR_PAYMENT', 'PAYMENT_PENDING'].includes(String(app.status)) ? 1 : 0),
                            status: app.status,
                            amount: app.scheme?.budget || 10000,
                            code: getStatusCode(app.status)
                        });
                    });
                }

                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (!key || !key.startsWith('utilizationReports_')) continue;
                    try {
                        const reports = JSON.parse(localStorage.getItem(key) || '[]');
                        if (!Array.isArray(reports)) continue;
                        reports.forEach((report) => {
                            if (report.status === 'DISTRICT_VERIFIED' || report.status === 'VERIFIED') {
                                // Find matching app
                                const emailOrName = report.beneficiaryName || key.replace('utilizationReports_', '');
                                const appMatch = history.find(h => h.beneficiary.toLowerCase().includes(emailOrName.toLowerCase().split('@')[0]));
                                if (appMatch) {
                                    appMatch.stageNum += 1;
                                    appMatch.amount += Number(report.amountUtilized || 0);
                                    if (appMatch.stageNum >= 3) {
                                        appMatch.stageNum = 3;
                                    }
                                }
                            }
                        });
                    } catch (e) { }
                }

                setApplications(history);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const disbursementApps = applications.filter(a => a.stageNum > 0 || ['PENDING_FIELD_VERIFICATION', 'FIELD_VERIFIED', 'FORWARDED_TO_DISTRICT'].includes(a.status));

    const releasedApps = disbursementApps.filter(a => a.stageNum >= 1.5);
    const pendingApps = disbursementApps.filter(a => a.stageNum === 1 || (a.stageNum > 1.5 && a.stageNum < 3 && a.stageNum % 1 !== 0));
    const lockedApps = disbursementApps.filter(a => a.stageNum === 0);

    const sumAmount = (arr) => arr.reduce((s, a) => s + Number(a.amount || 0), 0);
    const totalApproved = sumAmount(disbursementApps);
    const totalDisbursed = sumAmount(releasedApps);
    const totalPending = sumAmount(pendingApps);
    const totalLocked = sumAmount(lockedApps);

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

            {/* Header */}
            <div style={{ background: '#fff', padding: '2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>Staged Fund Disbursements</h2>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.2rem' }}>Live view of milestone completions and sequence-locked stagewise releases.</p>
                </div>

            </div>

            <div style={{ padding: '0 2rem' }}>
                {/* Summary Cards */}
                <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
                    <div className="stat-card">
                        <div className="stat-icon emerald"><FaMoneyBillWave /></div>
                        <div className="stat-info"><h4>{fmt(totalApproved)}</h4><p>Total Approved Amount</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue"><FaCheckCircle /></div>
                        <div className="stat-info"><h4>{fmt(totalDisbursed)}</h4><p>Total Disbursed</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber"><FaClock /></div>
                        <div className="stat-info"><h4>{fmt(totalPending)}</h4><p>Pending Disbursements</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><FaLock /></div>
                        <div className="stat-info"><h4>{fmt(totalLocked)}</h4><p>Locked (Awaiting Approval)</p></div>
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700 }}>Disbursement Schedule</h3>
                        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                            <span>🟢 Released</span>
                            <span>🟡 Pending Release</span>
                            <span>⚪ Locked</span>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading disbursement data…</div>
                    ) : disbursementApps.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <FaFolderOpen style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                            <p>No applications in the disbursement pipeline yet.</p>
                            <p style={{ fontSize: '0.85rem' }}>Applications must be approved by District Officer before appearing here.</p>
                        </div>
                    ) : (
                        <div className="custom-table-container">
                            <table className="custom-table" style={{ verticalAlign: 'middle' }}>
                                <thead>
                                    <tr>
                                        <th>App ID</th>
                                        <th>Beneficiary</th>
                                        <th>Scheme</th>
                                        <th style={{ minWidth: '160px' }}>Stage Progress</th>
                                        <th>Current Stage</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disbursementApps.map(app => {
                                        const logicalStage = Math.floor(app.stageNum) === 0 ? 1 : Math.floor(app.stageNum);
                                        const stageLabel = app.stageNum >= 3 ? 'Stage 3 – Completed' : (app.stageNum >= 2 ? 'Stage 2 – Disbursed' : (app.stageNum >= 1.5 ? 'Stage 1 – Disbursed' : 'Stage 1 – Pending'));

                                        return (
                                            <tr key={app.id}>
                                                <td><strong>#{app.appId}</strong></td>
                                                <td><strong>{app.beneficiary}</strong></td>
                                                <td>{app.scheme}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        {[1, 2, 3].map(stage => (
                                                            <React.Fragment key={stage}>
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: logicalStage >= stage ? '#16a34a' : '#94a3b8' }}>
                                                                    <div style={{
                                                                        width: 20, height: 20, borderRadius: '50%',
                                                                        background: logicalStage > stage || app.stageNum >= stage + 0.5 ? '#16a34a' : logicalStage === stage && app.stageNum % 1 === 0 ? '#f59e0b' : '#e2e8f0',
                                                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2
                                                                    }}>
                                                                        {logicalStage > stage || app.stageNum >= stage + 0.5
                                                                            ? <FaCheckCircle size={10} />
                                                                            : logicalStage === stage && app.stageNum % 1 === 0
                                                                                ? <FaSpinner size={10} />
                                                                                : <FaLock size={8} />}
                                                                    </div>
                                                                    Stg {stage}
                                                                </div>
                                                                {stage < 3 && <div style={{ height: 2, width: 15, background: logicalStage > stage || app.stageNum >= stage + 0.5 ? '#16a34a' : '#e2e8f0', marginTop: -12 }} />}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 600, color: '#334155', fontSize: '0.83rem' }}>{stageLabel}</td>
                                                <td style={{ color: '#16a34a', fontWeight: 700 }}>{fmt(app.amount)}</td>
                                                <td><StatusBadge code={app.code} label={String(app.status || '').replace(/_/g, ' ')} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Disbursements;
