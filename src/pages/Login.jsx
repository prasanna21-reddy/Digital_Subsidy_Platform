import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaEnvelope, FaLock, FaUserShield, FaSignInAlt, FaUserCheck,
  FaIdBadge, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { authService } from '../services/authService';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const isOfficerPortal = location.pathname.includes('officer') || queryParams.get('type') === 'officer' || queryParams.get('type') === 'admin';
  const mainPortal = isOfficerPortal ? 'ADMIN' : 'USER';


  const [selectedOfficerRole, setSelectedOfficerRole] = useState('FIELD_OFFICER');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setErrorMessage('');
  }, [location.pathname, location.search]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter your email/ID and password.');
      return;
    }

    setIsLoading(true);

    try {
      const roleToSubmit = mainPortal === 'USER' ? 'CITIZEN' : selectedOfficerRole;

      const response = await authService.login(email, password, roleToSubmit);

      if (response.success) {
        const userRole = response.role || roleToSubmit;
        let dashboardPath = '/dashboard';
        if (userRole === 'FIELD_OFFICER' || userRole === 'Field Officer') dashboardPath = '/field-officer';
        else if (userRole === 'DISTRICT_OFFICER' || userRole === 'District Officer') dashboardPath = '/district-officer';
        else if (userRole === 'FINANCE_OFFICER' || userRole === 'Finance Officer') dashboardPath = '/finance-officer';
        else if (userRole === 'ADMIN' || userRole === 'Admin') dashboardPath = '/admin';

        navigate(dashboardPath);
      } else {
        setErrorMessage(response.error || 'Invalid credentials or authentication failed.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Login error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 1rem', background: '#ffffff', minHeight: '80vh' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {mainPortal === 'USER' ? (
            <>
              <span className="badge badge-submitted" style={{ marginBottom: '0.75rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                <FaUserCheck /> Beneficiary Access Portal
              </span>
              <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>
                Citizen Beneficiary Sign In
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                Sign in to apply for schemes, track verification progress & check grant disbursements.
              </p>
            </>
          ) : (
            <>
              <span className="badge badge-approved" style={{ marginBottom: '0.75rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                <FaUserShield /> Government Officer Portal
              </span>
              <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>
                Officer & Admin Sign In
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                Official login for Field Officers, District Officers, Finance Officers & Administrators.
              </p>
            </>
          )}
        </div>

        {/* Form Card Surface */}
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)'
        }}>

          {errorMessage && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>



            {/* OFFICER / ADMIN DESIGNATION SELECTION */}
            {mainPortal === 'ADMIN' && (
              <div style={{ marginBottom: '1.75rem', background: '#f0fdf4', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #bbf7d0' }}>
                <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#15803d', marginBottom: '0.75rem' }}>
                  <FaIdBadge /> Select Government Officer Designation:
                </label>

                <select
                  className="form-control"
                  value={selectedOfficerRole}
                  onChange={(e) => setSelectedOfficerRole(e.target.value)}
                  style={{ fontWeight: 600, borderColor: '#4ade80' }}
                >
                  <option value="FIELD_OFFICER">Field Officer</option>
                  <option value="DISTRICT_OFFICER">District Officer</option>
                  <option value="FINANCE_OFFICER">Finance Officer</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            )}

            {/* CREDENTIAL FIELDS */}
            <div className="form-group">
              <label htmlFor="email" style={{ color: '#1e293b' }}>
                <FaEnvelope /> {mainPortal === 'USER' ? 'Email Address / Registered Phone' : 'Official Email ID / Employee Code'}
              </label>
              <input
                type="text"
                id="email"
                className="form-control"
                placeholder={mainPortal === 'USER' ? 'Enter email or 10-digit phone' : 'officer@gov.in or EMP-ID'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" style={{ color: '#1e293b' }}><FaLock /> Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-brand"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '1.5rem',
                padding: '0.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                background: mainPortal === 'USER' ? 'linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff'
              }}
              disabled={isLoading}
            >
              <FaSignInAlt /> {isLoading ? 'Authenticating...' : mainPortal === 'USER' ? 'Sign In' : `Sign In as ${selectedOfficerRole.replace(/_/g, ' ')}`}
            </button>

          </form>

          {/* Dedicated Registration Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>
            {mainPortal === 'USER' ? (
              <>
                New beneficiary?{' '}
                <Link to="/register?type=user" style={{ color: '#0284c7', fontWeight: 700 }}>
                  Register as Beneficiary
                </Link>
              </>
            ) : (
              <>
                New officer account?{' '}
                <Link to="/register?type=admin" style={{ color: '#059669', fontWeight: 700 }}>
                  Register as Government Officer
                </Link>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
