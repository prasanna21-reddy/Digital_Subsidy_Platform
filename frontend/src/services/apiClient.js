const BASE_URL = 'http://localhost:8081';

// Auth endpoints don't need (or want) an existing token in the header
const AUTH_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/register', '/auth/reset-password'];

export const apiClient = {
    async request(endpoint, options = {}) {
        const isAuthEndpoint = AUTH_ENDPOINTS.some(path => endpoint.includes(path));
        const token = localStorage.getItem('jwtToken');

        const headers = {
            'Content-Type': 'application/json',
            // Only attach the token for non-auth endpoints
            ...(!isAuthEndpoint && token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
        };

        const url = endpoint.startsWith('/api') ? `${BASE_URL}${endpoint}` : `${BASE_URL}/api/v1${endpoint}`;
        const response = await fetch(url, config);

        // Only clear the JWT token on true 401 Unauthorized.
        // Do NOT clear userRole or isAuthenticated here — wiping them causes
        // the route guard to default to CITIZEN role and bounce the user to /dashboard
        // on every failed API data call (e.g. backend temporarily unavailable).
        // Session flags are only cleared on explicit logout (authService.logout).
        if (response.status === 401) {
            localStorage.removeItem('jwtToken');
            // Don't redirect here — DashboardLayout route guard handles navigation
        }

        if (!response.ok) {
            let errorMessage = 'An error occurred on the server';
            try {
                const data = await response.json();
                errorMessage = data.message || data.error || errorMessage;
            } catch (e) {
                const text = await response.text();
                if (text) errorMessage = text;
            }
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    }
};
