export const auditService = {
    logAction: (action, module, status = 'Success') => {
        try {
            const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
            const userName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'System';
            const role = localStorage.getItem('userRole') || 'User';
            const newLog = {
                id: Date.now(),
                date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                user: userName,
                role: role,
                action: action,
                module: module,
                status: status
            };
            logs.unshift(newLog); // prepend
            localStorage.setItem('auditLogs', JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to save audit log', e);
        }
    },
    getLogs: () => {
        try {
            return JSON.parse(localStorage.getItem('auditLogs') || '[]');
        } catch (e) {
            return [];
        }
    }
};
