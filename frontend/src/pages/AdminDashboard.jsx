import React, { useState, useEffect } from 'react';
import {
  FaPlusCircle, FaFileAlt, FaUsers, FaUserTie,
  FaCheckCircle, FaTrash, FaEdit, FaTimes
} from 'react-icons/fa';
import { schemeService } from '../services/schemeService';
import { applicationService } from '../services/applicationService';
import { adminDashboardService } from '../services/adminDashboardService';

const AdminDashboard = () => {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({ totalUsers: 0, activeOfficers: 0, totalApplications: 0, totalAuditLogs: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', ok: true });

  // New scheme form state
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('500000');
  const [newCriteria, setNewCriteria] = useState('');

  // Edit scheme state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editScheme, setEditScheme] = useState(null);
  const [editSchemeName, setEditSchemeName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editCriteria, setEditCriteria] = useState('');

  // Removed mock data for production
  const mockUsers = [];
  const mockOfficers = [];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const s = await schemeService.getSchemes();
      setSchemes(s || []);
    } catch (e) {
      console.error(e);
    }

    try {
      const a = await applicationService.getAllApplications();
      setApplications(a || []);
    } catch (e) {
      console.error(e);
    }

    try {
      const dashboardSummary = await adminDashboardService.getSummary();
      setSummary({
        totalUsers: Number(dashboardSummary?.totalUsers ?? 0),
        activeOfficers: Number(dashboardSummary?.activeOfficers ?? 0),
        totalApplications: Number(dashboardSummary?.totalApplications ?? applications.length ?? 0),
        totalAuditLogs: Number(dashboardSummary?.totalAuditLogs ?? 0),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddScheme = async (e) => {
    e.preventDefault();
    if (!newSchemeName.trim()) return;
    try {
      await schemeService.createScheme({
        name: newSchemeName, category: newCategory,
        description: newDescription,
        budget: parseFloat(newBudget) || 500000,
        eligibilityCriteria: newCriteria, active: true
      });
      setStatusMsg({ text: `Scheme "${newSchemeName}" saved & published successfully!`, ok: true });
      setShowAddModal(false);
      setNewSchemeName(''); setNewCategory('General');
      setNewDescription(''); setNewBudget('500000'); setNewCriteria('');
      await fetchData();
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: 'Failed to create scheme: ' + (err.message || 'Server error'), ok: false });
      await fetchData();
    }
  };

  /* ── Open Edit Modal ── */
  const handleOpenEdit = (scheme) => {
    setEditScheme(scheme);
    setEditSchemeName(scheme.name || '');
    setEditCategory(scheme.category || 'General');
    setEditDescription(scheme.description || '');
    setEditBudget(String(scheme.budget || scheme.maxAmount || 500000));
    setEditCriteria(scheme.eligibilityCriteria || '');
    setShowEditModal(true);
  };

  const handleEditScheme = async (e) => {
    e.preventDefault();
    if (!editSchemeName.trim()) return;
    const updated = {
      id: editScheme.id,
      name: editSchemeName,
      category: editCategory,
      description: editDescription,
      budget: parseFloat(editBudget) || editScheme.budget,
      eligibilityCriteria: editCriteria,
      active: editScheme.active !== false,
    };
    try {
      await schemeService.updateScheme(updated.id, updated);
      setStatusMsg({ text: `Scheme "${editSchemeName}" updated successfully!`, ok: true });
      setShowEditModal(false);
      setEditScheme(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: 'Failed to update scheme: ' + (err.message || 'Server error'), ok: false });
      await fetchData();
    }
  };

  /* ── Delete Scheme ── */
  const handleDeleteScheme = async (scheme) => {
    try {
      await schemeService.deleteScheme(scheme.id);
    } catch (e) {
      console.error(e);
    }
    await fetchData();
  };

  /* ── Render ── */
  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

      {/* Status Toast */}
      {statusMsg.text && (
        <div style={{
          position: 'fixed', top: '1.2rem', right: '1.5rem', zIndex: 9999,
          background: statusMsg.ok ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${statusMsg.ok ? '#86efac' : '#fca5a5'}`,
          color: statusMsg.ok ? '#15803d' : '#b91c1c',
          padding: '0.75rem 1.5rem', borderRadius: '10px',
          fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          {statusMsg.text}
          <button onClick={() => setStatusMsg({ text: '', ok: true })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#fff', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <span className="badge badge-submitted" style={{ marginBottom: '0.5rem' }}>Administrator Command Center</span>
          <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>System Management &amp; Scheme Controls</h2>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>Comprehensive system monitoring and management plane.</p>
        </div>
      </div>

      <div style={{ padding: '0 2rem' }}>

        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon blue"><FaUsers /></div>
            <div className="stat-info"><h4>{summary.totalUsers}</h4><p>Total Users</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><FaUserTie /></div>
            <div className="stat-info"><h4>{summary.activeOfficers}</h4><p>Active Officers</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald"><FaFileAlt /></div>
            <div className="stat-info"><h4>{schemes.length}</h4><p>Active Schemes</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber"><FaCheckCircle /></div>
            <div className="stat-info"><h4>{summary.totalApplications || applications.length}</h4><p>Total Applications</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FaCheckCircle /></div>
            <div className="stat-info"><h4>{summary.totalAuditLogs}</h4><p>Audit Logs</p></div>
          </div>
        </div>

        {/* Users & Officers tables removed as per instructions to rely on DB data, 
            which is currently not available for users/officers */}

        {/* Scheme Management */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}><FaFileAlt style={{ color: '#94a3b8', marginRight: 8 }} /> Configured Subsidy Schemes</h3>
            <button onClick={() => setShowAddModal(true)} className="btn-brand" style={{ padding: '0.5rem 1rem' }}>
              <FaPlusCircle /> Create Scheme
            </button>
          </div>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Scheme ID</th><th>Name &amp; Category</th>
                  <th>Max Grant Amount</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map(s => (
                  <tr key={s.id}>
                    <td><strong>#SCH-{s.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.category || 'Welfare'}</div>
                    </td>
                    <td><strong style={{ color: '#0284c7' }}>₹{(s.budget || s.maxAmount || 250000).toLocaleString()}</strong></td>
                    <td><span className="badge badge-approved">Active</span></td>
                    <td>
                      <button
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Scheme"
                        style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginRight: 10, fontSize: '1rem' }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteScheme(s)}
                        title="Delete Scheme"
                        style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', fontSize: '1rem' }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {schemes.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No schemes configured. Click "Create Scheme" to add one.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Add Scheme Modal ── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleAddScheme} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 550, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#0f172a', margin: 0, fontWeight: 700 }}>Add New Government Scheme</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem' }}><FaTimes /></button>
            </div>
            <div className="form-group"><label>Scheme Name</label>
              <input type="text" className="form-control" value={newSchemeName} onChange={e => setNewSchemeName(e.target.value)} required /></div>
            <div className="form-group"><label>Category</label>
              <input type="text" className="form-control" value={newCategory} onChange={e => setNewCategory(e.target.value)} required /></div>
            <div className="form-group"><label>Grant Amount / Budget (₹)</label>
              <input type="number" className="form-control" value={newBudget} onChange={e => setNewBudget(e.target.value)} required /></div>
            <div className="form-group"><label>Eligibility Guidelines</label>
              <textarea className="form-control" rows="2" value={newCriteria} onChange={e => setNewCriteria(e.target.value)} required /></div>
            <div className="form-group"><label>Description</label>
              <textarea className="form-control" rows="2" value={newDescription} onChange={e => setNewDescription(e.target.value)} required /></div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-brand">Save Scheme</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit Scheme Modal ── */}
      {showEditModal && editScheme && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleEditScheme} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: 550, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#0f172a', margin: 0, fontWeight: 700 }}>Edit Scheme — #SCH-{editScheme.id}</h3>
              <button type="button" onClick={() => { setShowEditModal(false); setEditScheme(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.25rem' }}><FaTimes /></button>
            </div>
            <div className="form-group"><label>Scheme Name</label>
              <input type="text" className="form-control" value={editSchemeName} onChange={e => setEditSchemeName(e.target.value)} required /></div>
            <div className="form-group"><label>Category</label>
              <input type="text" className="form-control" value={editCategory} onChange={e => setEditCategory(e.target.value)} required /></div>
            <div className="form-group"><label>Grant Amount / Budget (₹)</label>
              <input type="number" className="form-control" value={editBudget} onChange={e => setEditBudget(e.target.value)} required /></div>
            <div className="form-group"><label>Eligibility Guidelines</label>
              <textarea className="form-control" rows="2" value={editCriteria} onChange={e => setEditCriteria(e.target.value)} /></div>
            <div className="form-group"><label>Description</label>
              <textarea className="form-control" rows="2" value={editDescription} onChange={e => setEditDescription(e.target.value)} /></div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => { setShowEditModal(false); setEditScheme(null); }} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-brand" style={{ background: 'linear-gradient(135deg,#38bdf8,#0284c7)', borderColor: '#38bdf8' }}>
                Update Scheme
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
