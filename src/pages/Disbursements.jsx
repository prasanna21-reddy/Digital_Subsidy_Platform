import React from 'react';
import { FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationCircle, FaLock, FaSpinner } from 'react-icons/fa';

const Disbursements = () => {

    const disbursementsData = [
        { id: 1, name: 'Ramu', scheme: 'Farmer Scheme', stage: 'Stage 1', amount: '₹20,000', due: '10 Aug', status: 'Released', code: 'success' },
        { id: 2, name: 'Suresh', scheme: 'Housing Scheme', stage: 'Stage 2', amount: '₹15,000', due: '15 Aug', status: 'Pending', code: 'pending' },
        { id: 3, name: 'Lingam', scheme: 'MSME Assist', stage: 'Stage 3', amount: '₹40,000', due: '05 Aug', status: 'Overdue', code: 'overdue' },
        { id: 4, name: 'Kavitha', scheme: 'Education Grant', stage: 'Stage 2', amount: '₹15,000', due: '20 Aug', status: 'Locked', code: 'locked' }
    ];

    const getStatusBadge = (statusObj) => {
        switch (statusObj.code) {
            case 'success': return <span className="badge" style={{ background: '#dcfce7', color: '#16a34a' }}>🟢 {statusObj.status}</span>;
            case 'pending': return <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>🟡 {statusObj.status}</span>;
            case 'completed': return <span className="badge" style={{ background: '#e0e7ff', color: '#4f46e5' }}>🔵 {statusObj.status}</span>;
            case 'overdue': return <span className="badge" style={{ background: '#fee2e2', color: '#ef4444' }}>🔴 {statusObj.status}</span>;
            case 'locked': return <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>⚪ {statusObj.status}</span>;
            default: return <span className="badge badge-submitted">{statusObj.status}</span>;
        }
    };

    const StageTracker = ({ activeStageStr }) => {
        const stageNum = parseInt(activeStageStr.replace('Stage ', ''));

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                {/* Stage 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: stageNum >= 1 ? '#16a34a' : '#94a3b8' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: stageNum > 1 ? '#16a34a' : (stageNum === 1 ? '#f59e0b' : '#e2e8f0'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                        {stageNum > 1 ? <FaCheckCircle size={10} /> : (stageNum === 1 ? <FaSpinner size={10} className="spinner" /> : <FaLock size={8} />)}
                    </div>
                    Stg 1
                </div>
                <div style={{ height: '2px', width: '15px', background: stageNum > 1 ? '#16a34a' : '#e2e8f0', marginTop: '-12px' }}></div>

                {/* Stage 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: stageNum >= 2 ? '#16a34a' : '#94a3b8' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: stageNum > 2 ? '#16a34a' : (stageNum === 2 ? '#f59e0b' : '#e2e8f0'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                        {stageNum > 2 ? <FaCheckCircle size={10} /> : (stageNum === 2 ? <FaSpinner size={10} className="spinner" /> : <FaLock size={8} />)}
                    </div>
                    Stg 2
                </div>
                <div style={{ height: '2px', width: '15px', background: stageNum > 2 ? '#16a34a' : '#e2e8f0', marginTop: '-12px' }}></div>

                {/* Stage 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: stageNum >= 3 ? '#16a34a' : '#94a3b8' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: stageNum >= 3 ? '#16a34a' : '#e2e8f0', color: stageNum >= 3 ? '#fff' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                        {stageNum >= 3 ? <FaCheckCircle size={10} /> : <FaLock size={8} />}
                    </div>
                    Stg 3
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

            {/* Header */}
            <div style={{ background: '#ffffff', padding: '2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>Staged Fund Disbursements</h2>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.2rem' }}>Monitor milestone completions and sequence-locked stagewise releases.</p>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    * Notice: Actual processing is executed by Finance Officers.
                </div>
            </div>

            <div style={{ padding: '0 2rem' }}>

                {/* Summary Cards */}
                <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
                    <div className="stat-card">
                        <div className="stat-icon emerald"><FaMoneyBillWave /></div>
                        <div className="stat-info"><h4>₹5,00,000</h4><p>Total Approved Amount</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon blue"><FaCheckCircle /></div>
                        <div className="stat-info"><h4>₹2,50,000</h4><p>Total Disbursed</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber"><FaClock /></div>
                        <div className="stat-info"><h4>₹1,50,000</h4><p>Pending Disbursements</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><FaLock /></div>
                        <div className="stat-info"><h4>₹1,00,000</h4><p>Remaining Locked Amount</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}><FaExclamationCircle /></div>
                        <div className="stat-info"><h4 style={{ color: '#b91c1c' }}>2</h4><p style={{ color: '#ef4444' }}>Overdue Milestones</p></div>
                    </div>
                </div>

                {/* Disbursements Table */}
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700 }}>Disbursement Schedule</h3>
                        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.85rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ color: '#16a34a' }}>🟢</span> Released</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ color: '#d97706' }}>🟡</span> Pending</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ color: '#4f46e5' }}>🔵</span> Completed</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ color: '#ef4444' }}>🔴</span> Overdue</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ color: '#64748b' }}>⚪</span> Locked</span>
                        </div>
                    </div>

                    <div className="custom-table-container">
                        <table className="custom-table" style={{ verticalAlign: 'middle' }}>
                            <thead>
                                <tr>
                                    <th>Beneficiary</th>
                                    <th>Scheme</th>
                                    <th style={{ minWidth: '180px' }}>Milestone Stages</th>
                                    <th>Stage Label</th>
                                    <th>Amount</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disbursementsData.map(d => (
                                    <tr key={d.id}>
                                        <td><strong>{d.name}</strong></td>
                                        <td>{d.scheme}</td>
                                        <td><StageTracker activeStageStr={d.stage} /></td>
                                        <td style={{ fontWeight: 600, color: '#334155' }}>{d.stage}</td>
                                        <td style={{ color: '#16a34a', fontWeight: 700 }}>{d.amount}</td>
                                        <td>{d.due}</td>
                                        <td>{getStatusBadge(d)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Disbursements;
