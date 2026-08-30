const BASE_URL = 'http://localhost:8080';

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

        // Auto-clear stale tokens if server says Unauthorized / Forbidden
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
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
