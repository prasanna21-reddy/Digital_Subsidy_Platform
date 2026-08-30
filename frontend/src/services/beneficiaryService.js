import { apiClient } from './apiClient';

export const beneficiaryService = {
    getProfile: async () => {
        console.log(`[beneficiaryService] Fetching user profile`);
        try {
            return await apiClient.request(`/beneficiaries/me`);
        } catch (error) {
            console.error('[beneficiaryService] Fetch profile error:', error);
            return {};
        }
    },

    updateProfile: async (profileData) => {
        console.log(`[beneficiaryService] Updating profile:`, profileData);
        try {
            return await apiClient.request(`/beneficiaries/me`, {
                method: 'PUT',
                body: JSON.stringify(profileData),
            });
        } catch (error) {
            console.error('[beneficiaryService] Update profile error:', error);
            return { success: false, error: error.message };
        }
    }
};

