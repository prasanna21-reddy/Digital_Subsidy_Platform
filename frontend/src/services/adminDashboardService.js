import { apiClient } from './apiClient';

export const adminDashboardService = {
    getSummary: async () => {
        try {
            return await apiClient.request('/api/admin/summary');
        } catch (error) {
            console.warn('[adminDashboardService] Backend summary unavailable, returning zeros');
            return {
                totalUsers: 0,
                activeOfficers: 0,
                totalApplications: 0,
                totalAuditLogs: 0,
            };
        }
    },
};
