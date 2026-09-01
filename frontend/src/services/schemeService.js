import { apiClient } from './apiClient';

const DEFAULT_SCHEMES = [
    { id: 1, name: "Pradhan Mantri Awas Yojana (Housing)", category: "Housing", description: "Subsidized affordable housing grant for low and middle income families.", eligibilityCriteria: "Income < ₹3,00,000 / Valid Aadhaar", budget: 10000000, active: true },
    { id: 2, name: "PM-KISAN Samman Nidhi (Agriculture)", category: "Agriculture", description: "Direct annual income support of ₹6,000 for small and marginal landholding farmers.", eligibilityCriteria: "Landholding up to 2 Hectares", budget: 5000000, active: true },
    { id: 3, name: "National Higher Education Grant", category: "Education", description: "Post-secondary scholarship for higher technical and college education.", eligibilityCriteria: "Enrolled in accredited degree / Income < ₹2,50,000", budget: 3000000, active: true },
    { id: 4, name: "MSME Udyam Credit Assistance", category: "Business", description: "Capital subsidy and working credit for small business entrepreneurs.", eligibilityCriteria: "Registered Udyam MSME / GST active", budget: 7500000, active: true }
];

export const schemeService = {
    getSchemes: async () => {
        try {
            const apiSchemes = await apiClient.request('/schemes');
            return Array.isArray(apiSchemes) ? apiSchemes : DEFAULT_SCHEMES;
        } catch (error) {
            console.warn('[schemeService] Backend offline, returning defaults');
            return DEFAULT_SCHEMES;
        }
    },

    getSchemeById: async (id) => {
        try {
            return await apiClient.request(`/schemes/${id}`);
        } catch (error) {
            return DEFAULT_SCHEMES.find(s => s.id == id) || null;
        }
    },

    createScheme: async (schemeData) => {
        return await apiClient.request('/schemes', {
            method: 'POST',
            body: JSON.stringify(schemeData),
        });
    },

    updateScheme: async (id, schemeData) => {
        return await apiClient.request(`/schemes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(schemeData),
        });
    },

    deleteScheme: async (id) => {
        return await apiClient.request(`/schemes/${id}`, { method: 'DELETE' });
    }
};
