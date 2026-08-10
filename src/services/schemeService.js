import { apiClient } from './apiClient';

export const schemeService = {
    getSchemes: async () => {
        try {
            const apiSchemes = await apiClient.request('/schemes');
            const localRaw = localStorage.getItem('custom_schemes');
            const localSchemes = localRaw ? JSON.parse(localRaw) : [];

            const list = Array.isArray(apiSchemes) ? apiSchemes : [];
            const merged = [...list];

            localSchemes.forEach(ls => {
                if (!merged.some(s => s.id === ls.id || s.name === ls.name)) {
                    merged.unshift(ls);
                }
            });

            return merged;
        } catch (error) {
            console.warn('[schemeService] Backend offline, returning local schemes store');
            const localRaw = localStorage.getItem('custom_schemes');
            const localSchemes = localRaw ? JSON.parse(localRaw) : [];

            const defaults = [
                { id: 1, name: "Pradhan Mantri Awas Yojana (Housing)", category: "Housing", description: "Subsidized affordable housing grant for low and middle income families.", eligibilityCriteria: "Income < ₹3,00,000 / Valid Aadhaar", budget: 10000000, active: true },
                { id: 2, name: "PM-KISAN Samman Nidhi (Agriculture)", category: "Agriculture", description: "Direct annual income support of ₹6,000 for small and marginal landholding farmers.", eligibilityCriteria: "Landholding up to 2 Hectares", budget: 5000000, active: true },
                { id: 3, name: "National Higher Education Grant", category: "Education", description: "Post-secondary scholarship for higher technical and college education.", eligibilityCriteria: "Enrolled in accredited degree / Income < ₹2,50,000", budget: 3000000, active: true },
                { id: 4, name: "MSME Udyam Credit Assistance", category: "Business", description: "Capital subsidy and working credit for small business entrepreneurs.", eligibilityCriteria: "Registered Udyam MSME / GST active", budget: 7500000, active: true }
            ];

            return [...localSchemes, ...defaults];
        }
    },

    getSchemeById: async (id) => {
        try {
            return await apiClient.request(`/schemes/${id}`);
        } catch (error) {
            const all = await schemeService.getSchemes();
            return all.find(s => s.id == id) || null;
        }
    },

    createScheme: async (schemeData) => {
        const newObj = {
            id: Date.now(),
            name: schemeData.name,
            category: schemeData.category || "General",
            description: schemeData.description,
            eligibilityCriteria: schemeData.eligibilityCriteria || schemeData.criteria || "Standard Eligibility Guidelines",
            budget: parseFloat(schemeData.budget) || 500000,
            budgetUsed: 0,
            active: true
        };

        // Always save locally to ensure instant UI rendering & persistence
        try {
            const localRaw = localStorage.getItem('custom_schemes');
            const localSchemes = localRaw ? JSON.parse(localRaw) : [];
            localSchemes.unshift(newObj);
            localStorage.setItem('custom_schemes', JSON.stringify(localSchemes));
        } catch (e) {
            console.error('LocalStorage save error:', e);
        }

        try {
            const result = await apiClient.request('/schemes', {
                method: 'POST',
                body: JSON.stringify(schemeData),
            });
            return result || newObj;
        } catch (error) {
            console.warn('[schemeService] Saved scheme locally in offline mode:', newObj);
            return newObj;
        }
    },

    deleteScheme: async (id) => {
        try {
            const localRaw = localStorage.getItem('custom_schemes');
            if (localRaw) {
                let localSchemes = JSON.parse(localRaw);
                localSchemes = localSchemes.filter(s => s.id !== id);
                localStorage.setItem('custom_schemes', JSON.stringify(localSchemes));
            }
        } catch (e) { }

        try {
            return await apiClient.request(`/schemes/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.warn('[schemeService] Deleted scheme locally in offline mode');
            return { success: true };
        }
    }
};
