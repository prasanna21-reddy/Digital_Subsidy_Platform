import React, { useState } from 'react';

const AuditLogs = () => {
    // Audit Logs Data
    const auditLogs = [
        { id: 1, date: '10 Aug, 10:30', user: 'Officer 01', role: 'Finance Officer', action: 'Released Stage 1', module: 'Disbursement', status: 'Success' },
        { id: 2, date: '10 Aug, 11:15', user: 'Officer 02', role: 'District Officer', action: 'Approved Application', module: 'Application', status: 'Success' },
        { id: 3, date: '10 Aug, 12:00', user: 'Admin', role: 'Admin', action: 'Resolved Overdue', module: 'Compliance', status: 'Success' },
    ];

    // Filter State
    const [filters, setFilters] = useState({ date: '', user: '', role: '', action: '', module: '', status: '' });

    const filteredLogs = auditLogs.filter(l =>
        l.date.toLowerCase().includes(filters.date.toLowerCase()) &&
        l.user.toLowerCase().includes(filters.user.toLowerCase()) &&
        l.role.toLowerCase().includes(filters.role.toLowerCase()) &&
        l.action.toLowerCase().includes(filters.action.toLowerCase()) &&
        l.module.toLowerCase().includes(filters.module.toLowerCase()) &&
        l.status.toLowerCase().includes(filters.status.toLowerCase())
    );

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

            {/* Header */}
            <div style={{ background: '#ffffff', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>System Audit Logs</h2>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.2rem' }}>Immutable ledger of recent system activities, parameter changes, and logins.</p>
                </div>
            </div>

            <div style={{ padding: '0 2rem' }}>
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                    {/* Filters */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <input type="text" placeholder="Filter Date..." className="form-control" onChange={e => setFilters({ ...filters, date: e.target.value })} />
                        <input type="text" placeholder="Filter User..." className="form-control" onChange={e => setFilters({ ...filters, user: e.target.value })} />
                        <input type="text" placeholder="Filter Role..." className="form-control" onChange={e => setFilters({ ...filters, role: e.target.value })} />
                        <input type="text" placeholder="Filter Action..." className="form-control" onChange={e => setFilters({ ...filters, action: e.target.value })} />
                        <input type="text" placeholder="Filter Module..." className="form-control" onChange={e => setFilters({ ...filters, module: e.target.value })} />
                        <input type="text" placeholder="Filter Status..." className="form-control" onChange={e => setFilters({ ...filters, status: e.target.value })} />
                    </div>

                    <div className="custom-table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Module</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map(l => (
                                    <tr key={l.id}>
                                        <td>{l.date}</td>
                                        <td><strong>{l.user}</strong></td>
                                        <td>{l.role}</td>
                                        <td>{l.action}</td>
                                        <td><span className="badge badge-pending">{l.module}</span></td>
                                        <td><span className={l.status === 'Success' ? 'badge badge-approved' : 'badge badge-rejected'}>{l.status}</span></td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No audit logs match your filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuditLogs;
