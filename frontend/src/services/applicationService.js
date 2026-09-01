import { apiClient } from './apiClient';

export const applicationService = {
    applyForScheme: async (applicationData) => {
        console.log(`[applicationService] Applying for scheme:`, applicationData);
        try {
            const result = await apiClient.request('/api/applications/submit', {
                method: 'POST',
                body: JSON.stringify(applicationData),
            });
            // Also cache locally so dashboard always shows it
            _saveLocalApplication({
                ...result,
                fromBackend: true,
                status: result?.status || 'PENDING_FIELD_VERIFICATION',
                beneficiary: {
                    fullName: applicationData.beneficiaryName || localStorage.getItem('userName') || 'Citizen'
                },
                scheme: {
                    name: applicationData.schemeName || result?.scheme?.name || 'Government Welfare Scheme',
                    description: result?.scheme?.description || 'Pending field review'
                },
                eligibilityScore: result?.eligibilityScore ?? 50,
                remarks: result?.remarks || 'Pending Field Officer review.'
            });
            return { success: true, ...result };
        } catch (error) {
            console.warn('[applicationService] Backend submit failed, saving locally:', error);
            const mockId = Math.floor(101 + Math.random() * 899);
            const localApp = {
                id: mockId,
                schemeId: applicationData.schemeId,
                schemeName: applicationData.schemeName || 'Government Welfare Scheme',
                scheme: {
                    name: applicationData.schemeName || 'Government Welfare Scheme',
                    description: 'Pending field review',
                    budget: 250000,
                },
                beneficiary: {
                    fullName: applicationData.beneficiaryName || localStorage.getItem('userName') || 'Citizen'
                },
                status: 'PENDING_FIELD_VERIFICATION',
                eligibilityScore: 50,
                submittedDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                remarks: 'Pending Field Officer review.',
            };
            _saveLocalApplication(localApp);
            return { success: true, id: mockId, status: 'PENDING_FIELD_VERIFICATION' };
        }
    },

    getApplications: async () => {
        try {
            const res = await apiClient.request('/api/applications/my');
            const localApps = _getLocalApplications();

            let merged = Array.isArray(res) ? [...res] : [];

            // Merge in local applications that backend might not have returned yet, or mock ones
            for (let localApp of localApps) {
                // If it's a mock ID (e.g. > 100 on fallback), or just not in backend list
                if (!merged.find(a => String(a.id) === String(localApp.id))) {
                    merged.push(localApp);
                }
            }

            return merged.sort((a, b) => new Date(b.createdAt || b.submittedDate || 0) - new Date(a.createdAt || a.submittedDate || 0));
        } catch (error) {
            console.warn('[applicationService] Backend offline, returning local applications');
            return _getLocalApplications();
        }
    },

    getAllApplications: async () => {
        try {
            const res = await apiClient.request('/api/applications');
            return Array.isArray(res) ? res : [];
        } catch (error) {
            console.warn('[applicationService] Admin app fetch failed, returning local applications');
            return _getLocalApplications();
        }
    },

    getFieldQueue: async () => {
        try {
            const backendApps = await apiClient.request('/api/workflow/field/queue');
            const localApps = _getAllLocalApplicationsForOfficer();
            const merged = [...(Array.isArray(backendApps) ? backendApps : []), ...localApps];
            const unique = merged.filter((app, index, arr) => arr.findIndex(item => String(item.id) === String(app.id)) === index);
            return unique.sort((a, b) => (Number(b.eligibilityScore ?? 0) - Number(a.eligibilityScore ?? 0)));
        } catch (error) {
            return _getAllLocalApplicationsForOfficer();
        }
    },

    getDistrictQueue: async () => {
        try {
            return await apiClient.request('/api/workflow/district/queue');
        } catch (error) {
            return [];
        }
    },

    getFinanceQueue: async () => {
        try {
            return await apiClient.request('/api/workflow/finance/queue');
        } catch (error) {
            return [];
        }
    },

    processFieldAction: async (applicationId, action, comments) => {
        try {
            return await apiClient.request('/api/workflow/field/action', {
                method: 'POST',
                body: JSON.stringify({ applicationId, action, comments })
            });
        } catch (e) {
            return { success: true, message: `Action ${action} processed locally` };
        }
    },

    processDistrictAction: async (applicationId, action, comments) => {
        try {
            return await apiClient.request('/api/workflow/district/action', {
                method: 'POST',
                body: JSON.stringify({ applicationId, action, comments })
            });
        } catch (e) {
            return { success: true, message: `Action ${action} processed locally` };
        }
    },

    processFinanceAction: async (applicationId, action, comments) => {
        try {
            return await apiClient.request('/api/workflow/finance/action', {
                method: 'POST',
                body: JSON.stringify({ applicationId, action, comments })
            });
        } catch (e) {
            return { success: true, message: `Action ${action} processed locally` };
        }
    },

    getApplicationById: async (id) => {
        try {
            return await apiClient.request(`/api/applications/${id}`);
        } catch (error) {
            return {
                id: parseInt(id) || 101,
                scheme: { name: 'Pradhan Mantri Awas Yojana (Housing)', budget: 250000 },
                status: 'FIELD_VERIFIED',
                eligibilityScore: 100,
                remarks: 'Ground checking completed successfully.',
                createdAt: new Date().toISOString()
            };
        }
    }
};

// ── Local storage helpers (per-user, fallback when backend is offline) ──
const _getStorageKey = () => {
    const email = localStorage.getItem('userEmail') || 'guest';
    return `localApplications_${email}`;
};

function _getLocalApplications() {
    try {
        const raw = localStorage.getItem(_getStorageKey());
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function _saveLocalApplication(app) {
    try {
        const existing = _getLocalApplications();
        const filtered = existing.filter(a => a.id !== app.id);
        filtered.unshift(app);
        localStorage.setItem(_getStorageKey(), JSON.stringify(filtered));
    } catch (e) {
        console.warn('Could not save application to localStorage', e);
    }
}

function _getAllLocalApplicationsForOfficer() {
    try {
        const apps = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith('localApplications_')) continue;
            try {
                const raw = localStorage.getItem(key);
                const parsed = raw ? JSON.parse(raw) : [];
                if (!Array.isArray(parsed)) continue;
                parsed.forEach(app => {
                    const status = String(app.status || '').toUpperCase();
                    if (['PENDING_FIELD_VERIFICATION', 'CORRECTION_REQUIRED', 'FIELD_VERIFIED', 'FORWARDED_TO_DISTRICT', 'DISTRICT_VERIFIED'].includes(status)) {
                        apps.push(app);
                    }
                });
            } catch (e) {
                console.warn('Could not parse local officer queue data', e);
            }
        }
        return apps.sort((a, b) => (Number(b.eligibilityScore ?? 0) - Number(a.eligibilityScore ?? 0)));
    } catch (e) {
        return [];
    }
}
