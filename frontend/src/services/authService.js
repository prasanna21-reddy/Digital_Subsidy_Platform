import { apiClient } from './apiClient';

export const authService = {
    login: async (email, password) => {
        try {
            const data = await apiClient.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // Only accept login if backend returns a real JWT token
            if (data && data.token && data.status === 'success') {
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userEmail', data.email || email);
                localStorage.setItem('userName', data.fullName || email);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userId', data.id || '');
                localStorage.setItem('isAuthenticated', 'true');

                return { success: true, role: data.role, token: data.token, fullName: data.fullName };
            }

            // Backend responded but no token — treat as failure
            return { success: false, error: data?.message || 'Authentication failed. Please check your credentials.' };
        } catch (error) {
            console.error('[authService] Login error:', error);
            // Throw the real server message (e.g. "Invalid credentials") to the UI
            return {
                success: false,
                error: error.message || 'Unable to connect to server. Please try again.'
            };
        }
    },

    register: async (userData) => {
        try {
            const data = await apiClient.request('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(userData),
            });

            if (userData.beneficiaryType) {
                localStorage.setItem('beneficiaryType', userData.beneficiaryType);
            }
            if (userData.specificDetails) {
                localStorage.setItem('beneficiaryDetails', JSON.stringify(userData.specificDetails));
            }
            return { success: true, ...data };
        } catch (error) {
            console.error('[authService] Error calling backend:', error);
            return {
                success: false,
                error: error.message || 'Registration failed.'
            };
        }
    },

    logout: () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('beneficiaryType');
        localStorage.removeItem('beneficiaryDetails');
        localStorage.removeItem('isAuthenticated');
    },

    resetPassword: async (email, newPassword) => {
        try {
            const data = await apiClient.request('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ email, newPassword }),
            });
            if (data && data.status === 'success') {
                return { success: true, message: data.message };
            }
            return { success: false, error: data?.message || 'Password reset failed.' };
        } catch (error) {
            return { success: false, error: error.message || 'Unable to connect to server.' };
        }
    },
};