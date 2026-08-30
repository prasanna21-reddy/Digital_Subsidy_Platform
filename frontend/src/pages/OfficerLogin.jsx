import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaEnvelope, FaLock, FaUserShield, FaSignInAlt, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { authService } from '../services/authService';

const OfficerLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setErrorMessage('');
    }, []);

    const getDashboardPath = (role) => {
        const r = (role || '').toUpperCase().replace(/[\s-]+/g, '_').replace(/^ROLE_/, '');

        if (r.includes('FIELD_OFFICER')) return '/field-officer';
        if (r.includes('DISTRICT_OFFICER')) return '/district-officer';
        if (r.includes('FINANCE_OFFICER')) return '/finance-officer';
        if (r === 'ADMIN' || r === 'ADMINISTRATOR' || r === 'SYSTEM_ADMIN') return '/admin';

        return '/dashboard'; // Fallback
    };

    const validateLogin = () => {
        if (!email || !password) {
            setErrorMessage('Please enter your email/ID and password.');
            return false;
        }

        if (email.length < 5) {
            setErrorMessage('Please enter a valid Officer Email or EMP-ID (minimum 5 characters).');
            return false;
        }
        return true;
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        if (!validateLogin()) return;

        setIsLoading(true);

        try {
            const response = await authService.login(email, password);

            if (response.success) {
                const resolvedRole = response.role;
                navigate(getDashboardPath(resolvedRole));
            } else {
                setErrorMessage(response.error || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            setErrorMessage(error.message || 'Login error – could not connect to server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="animate-fade-in"
            style={{ padding: '2.5rem 1rem', background: '#ffffff', minHeight: '80vh' }}
        >
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span
                        className="badge badge-approved"
                        style={{ marginBottom: '0.75rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
                    >
                        <FaUserShield /> Government Officer Portal
                    </span>
                    <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Authorized Personnel Only
                    </h2>
                    <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                        Official login for Field Officers, District Officers, Finance Officers & Administrator.
                    </p>
                </div>

                {/* ── Form Card ── */}
                <div
                    style={{
                        background: '#ffffff',
                        borderRadius: 'var(--radius-xl)',
                        padding: '2.5rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                    }}
                >
                    {errorMessage && (
                        <div
                            style={{
                                background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c',
                                padding: '0.85rem', borderRadius: 'var(--radius-md)',
                                marginBottom: '1.5rem', textAlign: 'center',
                                fontSize: '0.9rem', fontWeight: 600,
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit}>

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="login-email" style={{ color: '#1e293b' }}>
                                <FaEnvelope /> Official Email ID / Employee Code
                            </label>
                            <input
                                type="text"
                                id="login-email"
                                className="form-control"
                                placeholder="officer@gov.in or EMP-ID"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="login-password" style={{ color: '#1e293b' }}>
                                <FaLock /> Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="login-password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingRight: '2.5rem' }}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    style={{
                                        position: 'absolute', right: '0.85rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'transparent',
                                        border: 'none', color: '#64748b', cursor: 'pointer',
                                        fontSize: '1.1rem', display: 'flex', alignItems: 'center',
                                        padding: '0.25rem', borderRadius: '4px', outline: 'none',
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                            <a href="#" style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'underline' }}>Forgot Password?</a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-brand"
                            disabled={isLoading}
                            style={{
                                width: '100%', justifyContent: 'center',
                                padding: '0.85rem',
                                fontSize: '1rem', fontWeight: 700,
                                background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
                                color: '#ffffff',
                            }}
                        >
                            <FaSignInAlt /> {isLoading ? 'Authenticating...' : 'Secure Sign In'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default OfficerLogin;
