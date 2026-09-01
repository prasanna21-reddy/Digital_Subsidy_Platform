import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Role → allowed paths mapping
const ROLE_HOME = {
    FIELD_OFFICER: '/field-officer',
    DISTRICT_OFFICER: '/district-officer',
    FINANCE_OFFICER: '/finance-officer',
    ADMIN: '/admin',
    CITIZEN: '/dashboard',
};

// Paths each role is allowed to visit (besides their "home")
const ROLE_ALLOWED_PATHS = {
    FIELD_OFFICER: ['/field-officer', '/field-milestone', '/profile'],
    DISTRICT_OFFICER: ['/district-officer', '/district-milestone', '/profile'],
    FINANCE_OFFICER: ['/finance-officer', '/disbursements', '/profile'],
    ADMIN: ['/admin', '/schemes', '/disbursements', '/audit-logs', '/reports', '/profile'],
    CITIZEN: ['/dashboard', '/track-status', '/schemes', '/apply', '/utilization-report', '/profile'],
};

const normaliseRole = (raw) =>
    (raw || 'CITIZEN')
        .toUpperCase()
        .replace(/[\s-]+/g, '_')
        .replace(/^ROLE_/, '');

const DashboardLayout = () => {
    const location = useLocation();

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const token = localStorage.getItem('jwtToken');

    // Not logged in → send to login
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    const role = normaliseRole(localStorage.getItem('userRole') || localStorage.getItem('role'));
    const homePath = ROLE_HOME[role] || '/dashboard';
    const allowedPaths = ROLE_ALLOWED_PATHS[role] || ROLE_ALLOWED_PATHS.CITIZEN;

    // Current path (strip trailing slash)
    const currentPath = '/' + location.pathname.replace(/^\/+/, '');

    // Check if current path is within allowed paths for this role
    const isAllowed = allowedPaths.some(
        (p) => currentPath === p || currentPath.startsWith(p + '/')
    );

    // Wrong role visiting a protected page → redirect to their own home
    if (!isAllowed) {
        return <Navigate to={homePath} replace />;
    }

    return (
        <div className="app" style={{ minHeight: '100vh', background: '#ffffff' }}>
            <div
                className="dashboard-container"
                style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'flex-start' }}
            >
                <Sidebar />
                <main
                    className="dashboard-content"
                    style={{ flex: 1, padding: '1.5rem 2rem', background: '#ffffff', minWidth: 0, width: '100%' }}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
