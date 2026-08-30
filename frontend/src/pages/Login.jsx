import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaEnvelope, FaLock, FaUserCheck, FaSignInAlt, FaEye, FaEyeSlash, FaKey, FaTimes, FaCheckCircle
} from 'react-icons/fa';
import { authService } from '../services/authService';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ── Login state ──
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

    // ── Forgot Password modal state ──
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [fpEmail, setFpEmail] = useState('');
    const [fpNewPassword, setFpNewPassword] = useState('');
    const [fpConfirmPassword, setFpConfirmPassword] = useState('');
    const [fpShowNew, setFpShowNew] = useState(false);
    const [fpShowConfirm, setFpShowConfirm] = useState(false);
    const [fpLoading, setFpLoading] = useState(false);
    const [fpError, setFpError] = useState('');

    useEffect(() => {
        setErrorMessage('');
    }, [location.pathname, location.search]);

    /* ─── Role → dashboard path mapping ─── */
    const getDashboardPath = (role) => {
        const r = (role || '').toUpperCase().replace(/[\s-]+/g, '_').replace(/^ROLE_/, '');
        if (r.includes('FIELD_OFFICER')) return '/field-officer';
        if (r.includes('DISTRICT_OFFICER')) return '/district-officer';
        if (r.includes('FINANCE_OFFICER')) return '/finance-officer';
        if (r === 'ADMIN' || r === 'ADMINISTRATOR' || r === 'SYSTEM_ADMIN') return '/admin';
        return '/dashboard';
    };

    const validateLogin = () => {
        if (!email || !password) {
            setErrorMessage('Please enter your email and password.');
            return false;
        }
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
        const isPhone = /^[6-9]\d{9}$/.test(email);
        if (!isEmail && !isPhone) {
            setErrorMessage('Please enter a valid email address or 10-digit phone number.');
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
                navigate(getDashboardPath(response.role));
            } else {
                setErrorMessage(response.error || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            setErrorMessage(error.message || 'Login error – could not connect to server.');
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── Forgot Password handlers ─── */
    const openForgotModal = (e) => {
        e.preventDefault();
        setFpEmail('');
        setFpNewPassword('');
        setFpConfirmPassword('');
        setFpError('');
        setShowForgotModal(true);
    };

    const closeForgotModal = () => {
        setShowForgotModal(false);
        setFpError('');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setFpError('');

        if (!fpEmail.trim()) {
            setFpError('Please enter your registered email or phone number.');
            return;
        }
        if (fpNewPassword.length < 6) {
            setFpError('New password must be at least 6 characters.');
            return;
        }
        if (fpNewPassword !== fpConfirmPassword) {
            setFpError('Passwords do not match. Please re-enter.');
            return;
        }

        setFpLoading(true);
        try {
            const result = await authService.resetPassword(fpEmail.trim(), fpNewPassword);
            if (result.success) {
                setShowForgotModal(false);
                setSuccessMessage('✅ Password reset successfully! Please sign in with your new password.');
                setEmail(fpEmail.trim());
            } else {
                setFpError(result.error || 'Password reset failed. Please try again.');
            }
        } catch (err) {
            setFpError('Could not connect to server. Please try again.');
        } finally {
            setFpLoading(false);
        }
    };

    /* ─── Shared input style ─── */
    const inputWrap = { position: 'relative' };
    const eyeBtn = {
        position: 'absolute', right: '0.85rem', top: '50%',
        transform: 'translateY(-50%)', background: 'transparent',
        border: 'none', color: '#64748b', cursor: 'pointer',
        fontSize: '1.1rem', display: 'flex', alignItems: 'center',
        padding: '0.25rem', borderRadius: '4px', outline: 'none',
    };

    return (
        <div className="animate-fade-in" style={{ padding: '2.5rem 1rem', background: '#ffffff', minHeight: '80vh' }}>
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span className="badge badge-submitted"
                        style={{ marginBottom: '0.75rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                        <FaUserCheck /> Beneficiary Access Portal
                    </span>
                    <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Citizen Beneficiary Sign In
                    </h2>
                    <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                        Sign in to apply for schemes, track verification progress &amp; check grant disbursements.
                    </p>
                </div>

                {/* ── Form Card ── */}
                <div style={{
                    background: '#ffffff', borderRadius: 'var(--radius-xl)',
                    padding: '2.5rem', border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                }}>

                    {/* Success banner after reset */}
                    {successMessage && (
                        <div style={{
                            background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
                            padding: '0.85rem', borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem', textAlign: 'center',
                            fontSize: '0.9rem', fontWeight: 600, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        }}>
                            <FaCheckCircle /> {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div style={{
                            background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c',
                            padding: '0.85rem', borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem', textAlign: 'center',
                            fontSize: '0.9rem', fontWeight: 600,
                        }}>
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit}>

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="login-email" style={{ color: '#1e293b' }}>
                                <FaEnvelope /> Email Address / Registered Phone
                            </label>
                            <input
                                type="text" id="login-email" className="form-control"
                                placeholder="Enter email or 10-digit phone"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                required autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="login-password" style={{ color: '#1e293b' }}>
                                <FaLock /> Password
                            </label>
                            <div style={inputWrap}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="login-password" className="form-control"
                                    placeholder="Enter password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingRight: '2.5rem' }}
                                    required autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    style={eyeBtn}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                            <a href="#" onClick={openForgotModal}
                                style={{ fontSize: '0.85rem', color: '#0284c7', textDecoration: 'underline', fontWeight: 600 }}>
                                Forgot Password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="btn-brand" disabled={isLoading}
                            style={{
                                width: '100%', justifyContent: 'center', padding: '0.85rem',
                                fontSize: '1rem', fontWeight: 700,
                                background: 'linear-gradient(135deg,#38bdf8 0%,#60a5fa 100%)',
                                color: '#ffffff',
                            }}>
                            <FaSignInAlt /> {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>

                    </form>

                    {/* Footer */}
                    <div style={{
                        textAlign: 'center', marginTop: '1.75rem',
                        paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0',
                        fontSize: '0.9rem', color: '#64748b',
                    }}>
                        New beneficiary?{' '}
                        <Link to="/register" style={{ color: '#0284c7', fontWeight: 700 }}>
                            Register Account
                        </Link>
                        <br /><br />
                        <Link to="/officer-login" style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>
                            Are you a Government Officer? Sign in here.
                        </Link>
                    </div>

                </div>
            </div>

            {/* ══════════════════════════════
                  FORGOT PASSWORD MODAL
            ══════════════════════════════ */}
            {showForgotModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: '1rem',
                }}>
                    <div style={{
                        background: '#ffffff', borderRadius: 'var(--radius-xl)',
                        padding: '2.25rem', width: '100%', maxWidth: '460px',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
                        border: '1px solid #e2e8f0', position: 'relative',
                    }}>

                        {/* Close button */}
                        <button onClick={closeForgotModal} style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: '#f1f5f9', border: 'none', borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#64748b', fontSize: '0.9rem',
                        }}>
                            <FaTimes />
                        </button>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem auto', fontSize: '1.4rem', color: '#0284c7',
                            }}>
                                <FaKey />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.35rem' }}>
                                Reset Password
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                                Enter your registered email/phone and choose a new password.
                            </p>
                        </div>

                        {/* Error */}
                        {fpError && (
                            <div style={{
                                background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c',
                                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                                marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600,
                            }}>
                                {fpError}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword}>

                            {/* Registered Email / Phone */}
                            <div className="form-group">
                                <label style={{ color: '#1e293b', fontWeight: 600 }}>
                                    <FaEnvelope style={{ marginRight: '0.35rem' }} />
                                    Registered Email / Phone
                                </label>
                                <input
                                    type="text" className="form-control"
                                    placeholder="Enter your registered email or phone"
                                    value={fpEmail} onChange={(e) => setFpEmail(e.target.value)}
                                    required autoFocus
                                />
                            </div>

                            {/* New Password */}
                            <div className="form-group">
                                <label style={{ color: '#1e293b', fontWeight: 600 }}>
                                    <FaLock style={{ marginRight: '0.35rem' }} />
                                    New Password
                                </label>
                                <div style={inputWrap}>
                                    <input
                                        type={fpShowNew ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder="Minimum 6 characters"
                                        value={fpNewPassword}
                                        onChange={(e) => setFpNewPassword(e.target.value)}
                                        style={{ paddingRight: '2.5rem' }}
                                        required
                                    />
                                    <button type="button" onClick={() => setFpShowNew(!fpShowNew)}
                                        style={eyeBtn} aria-label="Toggle new password">
                                        {fpShowNew ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="form-group">
                                <label style={{ color: '#1e293b', fontWeight: 600 }}>
                                    <FaLock style={{ marginRight: '0.35rem' }} />
                                    Confirm New Password
                                </label>
                                <div style={inputWrap}>
                                    <input
                                        type={fpShowConfirm ? 'text' : 'password'}
                                        className="form-control"
                                        placeholder="Repeat your new password"
                                        value={fpConfirmPassword}
                                        onChange={(e) => setFpConfirmPassword(e.target.value)}
                                        style={{
                                            paddingRight: '2.5rem',
                                            borderColor: fpConfirmPassword && fpNewPassword !== fpConfirmPassword
                                                ? '#f43f5e' : '',
                                        }}
                                        required
                                    />
                                    <button type="button" onClick={() => setFpShowConfirm(!fpShowConfirm)}
                                        style={eyeBtn} aria-label="Toggle confirm password">
                                        {fpShowConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {fpConfirmPassword && fpNewPassword !== fpConfirmPassword && (
                                    <p style={{ color: '#f43f5e', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                                        Passwords do not match.
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={closeForgotModal}
                                    className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-brand" disabled={fpLoading}
                                    style={{
                                        flex: 2, justifyContent: 'center',
                                        background: 'linear-gradient(135deg,#38bdf8 0%,#60a5fa 100%)',
                                        opacity: fpLoading ? 0.7 : 1,
                                    }}>
                                    {fpLoading ? 'Updating...' : 'Confirm New Password'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Login;
