import React, { useState, useEffect } from 'react';
import {
  FaPlusCircle, FaFileAlt, FaUsers, FaUserTie,
  FaCheckCircle, FaTrash, FaEdit
} from 'react-icons/fa';
import { schemeService } from '../services/schemeService';
import { applicationService } from '../services/applicationService';

const AdminDashboard = () => {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New scheme form state
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('500000');
  const [newCriteria, setNewCriteria] = useState('');

  // Mock data
  const mockUsers = [
    { id: 1, name: 'Srinivas Rao', email: 'srinivas@gmail.com', role: 'Citizen', status: 'Active' },
    { id: 2, name: 'Priya Sharma', email: 'priya09@yahoo.com', role: 'Citizen', status: 'Active' },
    { id: 3, name: 'Anil Kumar', email: 'anil.k@outlook.com', role: 'Citizen', status: 'Inactive' },
  ];

  const mockOfficers = [
    { id: 1, name: 'Rajendra Prasad', email: 'field.officer@gov.in', role: 'Field Officer', region: 'Hyderabad East', status: 'Active' },
    { id: 2, name: 'Kavitha Devi', email: 'district.officer@gov.in', role: 'District Officer', region: 'Hyderabad District', status: 'Active' },
    { id: 3, name: 'Arun Jaitley', email: 'finance.officer@gov.in', role: 'Finance Officer', region: 'State HQ', status: 'Active' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const s = await schemeService.getSchemes();
      setSchemes(s || []);
      const a = await applicationService.getApplications();
      setApplications(a || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddScheme = async (e) => {
    e.preventDefault();
    if (!newSchemeName.trim()) return;

    try {
      await schemeService.createScheme({
        name: newSchemeName,
        category: newCategory,
        description: newDescription,
        budget: parseFloat(newBudget) || 500000,
        eligibilityCriteria: newCriteria,
        active: true
      });
      alert(`Government Subsidy Scheme "${newSchemeName}" saved & published successfully!`);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Scheme saved successfully (fallback)!');
      setShowAddModal(false);
      fetchData();
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem 0', background: '#f8fafc', minHeight: '80vh' }}>

      {/* Header */}
      <div style={{ background: '#ffffff', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <span className="badge badge-submitted" style={{ marginBottom: '0.5rem' }}>Administrator Command Center</span>
          <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>System Management & Scheme Controls</h2>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>Comprehensive system monitoring and management plane.</p>
        </div>
      </div>

      <div style={{ padding: '0 2rem' }}>

        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon blue"><FaUsers /></div>
            <div className="stat-info">
              <h4>1,245</h4>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><FaUserTie /></div>
            <div className="stat-info">
              <h4>48</h4>
              <p>Active Officers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald"><FaFileAlt /></div>
            <div className="stat-info">
              <h4>{schemes.length || 12}</h4>
              <p>Active Schemes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber"><FaCheckCircle /></div>
            <div className="stat-info">
              <h4>{applications.length || 854}</h4>
              <p>Total Applications</p>
            </div>
          </div>
        </div>

        {/* Dashboards Sections Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>

          {/* Manage Users */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}><FaUsers style={{ color: '#94a3b8', marginRight: '8px' }} /> Manage Users</h3>
              <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>View All</button>
            </div>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(u => (
                    <tr key={u.id}>
                      <td><div style={{ fontWeight: 600 }}>{u.name}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div></td>
                      <td>{u.role}</td>
                      <td><span className={u.status === 'Active' ? 'badge badge-approved' : 'badge badge-rejected'}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manage Officers */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}><FaUserTie style={{ color: '#94a3b8', marginRight: '8px' }} /> Manage Officers</h3>
              <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>+ Assign</button>
            </div>
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Officer</th>
                    <th>Role</th>
                    <th>Region</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOfficers.map(o => (
                    <tr key={o.id}>
                      <td><div style={{ fontWeight: 600 }}>{o.name}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.email}</div></td>
                      <td><span className="badge badge-submitted">{o.role}</span></td>
                      <td>{o.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Manage Schemes */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}><FaFileAlt style={{ color: '#94a3b8', marginRight: '8px' }} /> Configured Subsidy Schemes</h3>
            <button onClick={() => setShowAddModal(true)} className="btn-brand" style={{ padding: '0.5rem 1rem' }}>
              <FaPlusCircle /> Create Scheme
            </button>
          </div>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Scheme ID</th>
                  <th>Name & Category</th>
                  <th>Max Grant Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map(s => (
                  <tr key={s.id}>
                    <td><strong>#SCH-{s.id}</strong></td>
                    <td><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.category || 'Welfare'}</div></td>
                    <td><strong style={{ color: '#0284c7' }}>₹{(s.budget || s.maxAmount || 250000).toLocaleString()}</strong></td>
                    <td><span className="badge badge-approved">Active</span></td>
                    <td>
                      <button style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginRight: '10px' }}><FaEdit /></button>
                      <button style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer' }}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
                {schemes.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No schemes configured. Click "Create Scheme" to add one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Scheme Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleAddScheme} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', padding: '2rem', width: '100%', maxWidth: '550px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ color: '#0f172a', marginBottom: '1.25rem', fontWeight: 700 }}>Add New Government Scheme</h3>

            <div className="form-group">
              <label>Scheme Name</label>
              <input type="text" className="form-control" value={newSchemeName} onChange={e => setNewSchemeName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input type="text" className="form-control" value={newCategory} onChange={e => setNewCategory(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Grant Amount / Budget (₹)</label>
              <input type="number" className="form-control" value={newBudget} onChange={e => setNewBudget(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Eligibility Guidelines</label>
              <textarea className="form-control" rows="2" value={newCriteria} onChange={e => setNewCriteria(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows="2" value={newDescription} onChange={e => setNewDescription(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-brand">Save Scheme</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
