import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLandmark, FaUserCircle, FaSignOutAlt, FaPlusCircle, FaListAlt, FaUserCheck, FaUserShield } from 'react-icons/fa';
import { authService } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || 'CITIZEN';
  const beneficiaryType = localStorage.getItem('beneficiaryType') || '';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch (userRole.toUpperCase()) {
      case 'FIELD_OFFICER': return '/field-officer';
      case 'DISTRICT_OFFICER': return '/district-officer';
      case 'FINANCE_OFFICER': return '/finance-officer';
      case 'ADMIN': return '/admin';
      default: return '/dashboard';
    }
  };

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.85rem 2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}>
            <FaLandmark />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
              DBT Portal
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
              DIRECT BENEFIT TRANSFER
            </span>
          </div>
        </Link>

        {/* Links & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/all-schemes" style={{ color: '#334155', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <FaListAlt style={{ color: '#38bdf8' }} /> Schemes Catalog
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/apply" style={{ color: '#334155', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
                <FaPlusCircle style={{ color: '#38bdf8' }} /> Apply Now
              </Link>

              <Link to={getDashboardPath()} className="badge badge-submitted" style={{ padding: '0.45rem 0.9rem', textTransform: 'none', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <FaUserCircle /> {userName} ({userRole === 'CITIZEN' && beneficiaryType ? beneficiaryType : userRole.replace('_', ' ')})
              </Link>

              <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

              {/* User Entry Button */}
              <Link
                to="/login"
                className="btn-brand"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem', textDecoration: 'none', background: 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)', color: '#ffffff' }}
              >
                <FaUserCheck /> User Login
              </Link>

              {/* Admin / Officer Entry Button */}
              <Link
                to="/officer-login"
                className="btn-outline"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem', textDecoration: 'none', background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}
              >
                <FaUserShield /> Officer Portal
              </Link>

            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
