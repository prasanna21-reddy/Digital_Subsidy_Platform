import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome, FaFileAlt, FaUserEdit, FaCheckCircle,
  FaMoneyBillWave, FaSignOutAlt,
  FaSearch, FaHistory, FaBell, FaChartBar
} from 'react-icons/fa';
import { authService } from '../services/authService';

const Sidebar = () => {
  const navigate = useNavigate();
  const rawRole = localStorage.getItem('userRole') || localStorage.getItem('role') || 'CITIZEN';
  const userName = localStorage.getItem('userName') || 'User';
  const role = rawRole.toUpperCase().replace(/[\s-]+/g, '_').replace(/^ROLE_/, '');

  let navLinks = [];

  if (role === 'FIELD_OFFICER') {
    navLinks = [
      { name: 'Applications', path: '/field-officer', icon: <FaFileAlt /> },
      { name: 'Milestone Verification', path: '/field-milestone', icon: <FaCheckCircle /> },
      { name: 'Profile', path: '/profile', icon: <FaUserEdit /> },
    ];
  } else if (role === 'DISTRICT_OFFICER') {
    navLinks = [
      { name: 'District Review Portal', path: '/district-officer', icon: <FaCheckCircle /> },
      { name: 'Milestone Verification', path: '/district-milestone', icon: <FaBell /> },
      { name: 'My Profile', path: '/profile', icon: <FaUserEdit /> },
    ];
  } else if (role === 'FINANCE_OFFICER') {
    navLinks = [
      { name: 'Disbursement Queue', path: '/finance-officer', icon: <FaMoneyBillWave /> },
      { name: 'Stage Monitoring', path: '/disbursements', icon: <FaCheckCircle /> },
      { name: 'My Profile', path: '/profile', icon: <FaUserEdit /> },
    ];
  } else if (role === 'ADMIN') {
    navLinks = [
      { name: 'System Control Panel', path: '/admin', icon: <FaHome /> },
      { name: 'Schemes Management', path: '/schemes', icon: <FaFileAlt /> },
      { name: 'Disbursements', path: '/disbursements', icon: <FaMoneyBillWave /> },
      { name: 'Audit Logs', path: '/audit-logs', icon: <FaHistory /> },
      { name: 'Reports', path: '/reports', icon: <FaChartBar /> },
      { name: 'My Profile', path: '/profile', icon: <FaUserEdit /> },
    ];
  } else {
    navLinks = [
      { name: 'My Applications', path: '/dashboard', icon: <FaHome /> },
      { name: 'Track Status', path: '/track-status', icon: <FaSearch /> },
      { name: 'Available Schemes', path: '/schemes', icon: <FaFileAlt /> },
      { name: 'Fund Utilization', path: '/utilization-report', icon: <FaChartBar /> },
      { name: 'My Profile', path: '/profile', icon: <FaUserEdit /> },
    ];
  }

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="glass-card" style={{ width: '240px', borderRadius: '0', minHeight: 'calc(100vh - 70px)', padding: '1.5rem 1rem', borderTop: 0, borderBottom: 0, borderLeft: 0 }}>
      {/* Profile summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{userName}</h4>
          <span className="badge badge-submitted" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', marginTop: '0.2rem' }}>
            {role.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {navLinks.map((item, idx) => (
            <li key={idx}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#0f172a' : '#475569',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                })}
              >
                <span style={{ fontSize: '1.05rem', color: 'var(--accent-blue)' }}>{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={handleLogout}
          className="btn-outline"
          style={{ width: '100%', justifyContent: 'center', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.2)', fontSize: '0.88rem' }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
