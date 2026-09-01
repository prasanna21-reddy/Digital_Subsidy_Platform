import React, { useState, useEffect } from 'react';
import { auditService } from '../services/auditService';
import { FaListAlt, FaSearch } from 'react-icons/fa';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({ date: '', user: '', role: '', action: '', module: '', status: '' });

    useEffect(() => {
        setLogs(auditService.getLogs());
    }, []);

    const filteredLogs = logs.filter(l =>
        (!filters.date || (l.date || '').toLowerCase().includes(filters.date.toLowerCase())) &&
        (!filters.user || (l.user || '').toLowerCase().includes(filters.user.toLowerCase())) &&
        (!filters.role || (l.role || '').toLowerCase().includes(filters.role.toLowerCase())) &&
        (!filters.action || (l.action || '').toLowerCase().includes(filters.action.toLowerCase())) &&
        (!filters.module || (l.module || '').toLowerCase().includes(filters.module.toLowerCase())) &&
        (!filters.status || (l.status || '').toLowerCase().includes(filters.status.toLowerCase()))
    );

    const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    return (
        <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

            {/* Header */}
            <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.15rem' }}>
                        <FaListAlt />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>System Audit Logs</h2>
                        <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.2rem', marginBottom: 0 }}>Immutable ledger of every action by users and officers in this session.</p>
                    </div>
                </div>
                <span style={{ fontSize: '0.82rem', background: '#ede9fe', color: '#6366f1', padding: '0.3rem 1rem', borderRadius: 20, fontWeight: 700 }}>
                    {filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div style={{ padding: '0 2rem' }}>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>

                    {/* Filters */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {[
                            ['date', 'Filter Date…'],
                            ['user', 'Filter User…'],
                            ['role', 'Filter Role…'],
                            ['action', 'Filter Action…'],
                            ['module', 'Filter Module…'],
                            ['status', 'Filter Status…'],
                        ].map(([key, ph]) => (
                            <div key={key} style={{ position: 'relative' }}>
                                <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.75rem', pointerEvents: 'none' }} />
                                <input
                                    type="text"
                                    placeholder={ph}
                                    className="form-control"
                                    style={{ paddingLeft: '2rem' }}
                                    onChange={e => setFilter(key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="custom-table-container">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date &amp; Time</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Module</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((l, idx) => (
                                    <tr key={l.id || idx}>
                                        <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{filteredLogs.length - idx}</td>
                                        <td style={{ fontSize: '0.83rem', whiteSpace: 'nowrap' }}>{l.date}</td>
                                        <td><strong>{l.user}</strong></td>
                                        <td>
                                            <span className="badge" style={{
                                                background: l.role === 'FIELD_OFFICER' ? '#dbeafe' : l.role === 'DISTRICT_OFFICER' ? '#ede9fe' : l.role === 'FINANCE_OFFICER' ? '#d1fae5' : l.role === 'ADMIN' ? '#fee2e2' : '#f1f5f9',
                                                color: l.role === 'FIELD_OFFICER' ? '#1d4ed8' : l.role === 'DISTRICT_OFFICER' ? '#6d28d9' : l.role === 'FINANCE_OFFICER' ? '#065f46' : l.role === 'ADMIN' ? '#991b1b' : '#475569',
                                            }}>
                                                {l.role}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: 260, fontSize: '0.88rem', color: '#1e293b' }}>{l.action}</td>
                                        <td><span className="badge badge-pending">{l.module}</span></td>
                                        <td>
                                            <span className={l.status === 'Success' ? 'badge badge-approved' : 'badge badge-rejected'}>
                                                {l.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                            {logs.length === 0
                                                ? 'No audit logs yet. Actions by users and officers will appear here automatically.'
                                                : 'No logs match the current filters.'}
                                        </td>
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
