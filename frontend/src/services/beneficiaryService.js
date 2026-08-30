import { apiClient } from './apiClient';

export const beneficiaryService = {
    getProfile: async (userId = '') => {
        console.log(`[beneficiaryService] Fetching user profile`);
        try {
            if (userId) {
                return await apiClient.request(`/beneficiaries/${userId}`);
            }
            return await apiClient.request('/beneficiaries');
        } catch (error) {
            console.error('[beneficiaryService] Fetch profile error:', error);
            return {};
        }
    },

    updateProfile: async (profileData) => {
        console.log(`[beneficiaryService] Updating profile:`, profileData);
        try {
            const userId = localStorage.getItem('userId') || '1';
            return await apiClient.request(`/beneficiaries/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(profileData),
            });
        } catch (error) {
            console.error('[beneficiaryService] Update profile error:', error);
            return { success: false, error: error.message };
        }
    }
};

