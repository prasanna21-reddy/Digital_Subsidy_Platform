import { apiClient } from './apiClient';

export const paymentService = {
    getPayments: async () => {
        try {
            return await apiClient.request('/payments');
        } catch (error) {
            console.error('[paymentService] Get payments error:', error);
            return [];
        }
    },

    disbursePayment: async (applicationId, amount, remarks) => {
        try {
            return await apiClient.request('/payments/disburse', {
                method: 'POST',
                body: JSON.stringify({ applicationId, amount, remarks }),
            });
        } catch (error) {
            console.error('[paymentService] Disburse error:', error);
            return { success: false, error: error.message };
        }
    }
};
