import { apiClient } from './apiClient';

export const auditLogService = {
    getLogs: async () => {
        try {
            return await apiClient.request('/api/audit/logs');
        } catch (error) {
            console.warn('[auditLogService] No backend logs available, returning []');
            return [];
        }
    },
};
