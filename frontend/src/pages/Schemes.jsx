import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaPlusCircle, FaTrash, FaEdit } from 'react-icons/fa';
import { schemeService } from '../services/schemeService';

const Schemes = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newDescription, setNewDescription] = useState('');
  const [newBudget, setNewBudget] = useState('500000');
  const [newCriteria, setNewCriteria] = useState('');

  const userRole = localStorage.getItem('userRole') || localStorage.getItem('role') || 'CITIZEN';
  const isAdmin = userRole.toUpperCase() === 'ADMIN';
  const isLoggedIn = !!localStorage.getItem('jwtToken');

  const handleApplyClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/apply');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const data = await schemeService.getSchemes();
      setSchemes(data || []);
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
      alert(`Scheme "${newSchemeName}" created successfully!`);
      setNewSchemeName('');
      setNewCategory('General');
      setNewDescription('');
      setNewBudget('500000');
      setNewCriteria('');
      setShowAddModal(false);
      fetchSchemes();
    } catch (err) {
      console.error(err);
      alert('Scheme created locally.');
      setShowAddModal(false);
      fetchSchemes();
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete scheme: ${name}?`)) {
      await schemeService.deleteScheme(id);
      fetchSchemes();
    }
  };

  const filtered = schemes.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in" style={{ padding: '1rem 0', background: '#ffffff', minHeight: '80vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Government Subsidy Schemes Directory</h2>
          <p style={{ color: '#475569' }}>Explore active government subsidy & grant schemes and check eligibility criteria.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="btn-brand">
            <FaPlusCircle /> Create New Scheme
          </button>
        )}
      </div>

      <div style={{ maxWidth: '550px', margin: '0 auto 2.5rem auto' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search schemes by keyword or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem', borderColor: '#bae6fd' }}
          />
          <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#38bdf8' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {filtered.map(scheme => (
          <div key={scheme.id} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-submitted">{scheme.category || 'Welfare'}</span>
                <strong style={{ color: '#0284c7', fontSize: '1.1rem', fontWeight: 800 }}>₹{(scheme.budget || scheme.maxAmount || 250000).toLocaleString()}</strong>
              </div>

              <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: 700 }}>{scheme.name}</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{scheme.description}</p>

              <div style={{ padding: '0.85rem', background: '#f0f9ff', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#334155', border: '1px solid #bae6fd', marginBottom: '1.5rem' }}>
                <strong>Eligibility:</strong> {scheme.eligibilityCriteria || 'Income below ₹3,00,000 / Valid Aadhaar'}
              </div>
            </div>

            {isAdmin ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(scheme.id, scheme.name)} className="btn-brand" style={{ background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)', borderColor: '#fb7185', flex: 1, justifyContent: 'center' }}>
                  <FaTrash /> Delete
                </button>
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="btn-brand"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Apply for Scheme
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            No schemes found matching your search.
          </div>
        )}
      </div>

      {/* Add Scheme Modal */}
      {showAddModal && isAdmin && (
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

export default Schemes;
