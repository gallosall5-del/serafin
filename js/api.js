/**
 * TERAFIN — API Module
 * Enhanced with debugging logs and better error handling for Render (Cold Start).
 */

const API = (() => {
    const BASE_URL = 'https://terafin-api.onrender.com';

    /**
     * Generic fetch request
     * @param {string} method - GET, POST, PUT, DELETE
     * @param {string} path - Endpoint path
     * @param {any} body - Request body
     * @param {boolean} isFormData - Whether body is FormData
     * @param {string} responseType - 'json' or 'blob'
     */
    async function request(method, path, body = null, isFormData = false, responseType = 'json', retryCount = 0) {
        const fullUrl = BASE_URL + path;
        console.log(`[API] ${method} ${fullUrl}`, body);

        const headers = {};
        const token = AUTH.getAccessToken()?.trim(); // Ensure no hidden newlines/spaces
        if (token) {
            console.log(`[API] Token attached (${token.substring(0, 10)}...)`);
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (body && !isFormData && !(body instanceof URLSearchParams)) {
            headers['Content-Type'] = 'application/json';
        }

        const options = {
            method,
            headers,
            // Browsers need this to handle CORS credentials if backend allows them
            // though for Bearer tokens it's not strictly necessary.
            mode: 'cors'
        };

        if (body) {
            options.body = (isFormData || body instanceof URLSearchParams) ? body : JSON.stringify(body);
        }

        try {
            let res = await fetch(fullUrl, options);

            // Handle 401 Unauthorized (Token expired)
            if (res.status === 401 && retryCount === 0) {
                console.warn('[API] 401 Detected, attempting token refresh...');
                const refreshed = await tryRefresh();
                if (refreshed) {
                    return request(method, path, body, isFormData, responseType, 1);
                } else {
                    console.error('[API] Refresh failed, logging out.');
                    AUTH.logout();
                    throw new Error("Session expirée. Veuillez vous reconnecter.");
                }
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                const msg = errData?.detail || `Erreur ${res.status}: ${res.statusText}`;
                console.error(`[API] Server Error:`, msg);
                throw new Error(msg);
            }

            // 204 No Content
            if (res.status === 204) return null;

            if (responseType === 'blob') return res.blob();
            return res.json();

        } catch (err) {
            console.error(`[API] Request Failed for ${fullUrl}:`, err);

            // If it's a network error and it's the first attempt, try one retry after a short delay
            if (err.message === 'Failed to fetch' && retryCount === 0) {
                console.log('[API] Retry 1 after network failure...');
                await new Promise(r => setTimeout(r, 1500));
                return request(method, path, body, isFormData, responseType, 1);
            }

            throw err;
        }
    }

    async function tryRefresh() {
        const refreshToken = AUTH.getRefreshToken()?.trim();
        if (!refreshToken) return false;
        try {
            const res = await fetch(BASE_URL + '/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!res.ok) return false;
            const data = await res.json();
            AUTH.saveTokens(data.access_token, data.refresh_token);
            return true;
        } catch {
            return false;
        }
    }

    function toForm(obj) {
        const fd = new FormData();
        for (const [k, v] of Object.entries(obj)) {
            if (v !== null && v !== undefined) fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
        }
        return fd;
    }

    return {
        BASE_URL,
        auth: {
            login: (email, password) => {
                const params = new URLSearchParams();
                params.append('username', email);
                params.append('password', password);
                return request('POST', '/auth/connexion', params, false);
            },
            verifierOtp: (email, code) => request('POST', '/auth/verifier-otp', { email, code }),
            updateProfil: (data) => request('PUT', '/auth/profil', toForm(data), true),
        },
        clients: {
            list: () => request('GET', '/clients/'),
            get: (id) => request('GET', `/clients/${id}`),
            create: (data) => request('POST', '/clients/', toForm(data), true),
            update: (id, data) => request('PUT', `/clients/${id}`, toForm(data), true),
            delete: (id) => request('DELETE', `/clients/${id}`),
            exportExcel: () => request('GET', '/clients/export/excel', null, false, 'blob'),
            credits: (id) => request('GET', `/clients/${id}/credits`),
        },
        credits: {
            list: () => request('GET', '/credits/'),
            get: (id) => request('GET', `/credits/${id}`),
            create: (data) => request('POST', '/credits/', toForm(data), true),
            validate: (id) => request('POST', `/credits/valider/${id}`),
            solder: (id) => request('POST', `/credits/solder/${id}`),
            echeancier: (id) => request('GET', `/credits/echeancier/${id}`),
            exportExcel: () => request('GET', '/credits/export/excel', null, false, 'blob'),
        },
        paiements: {
            create: (data) => request('POST', '/payments/', toForm({ type: 'partiel', ...data }), true),
        },
        remboursements: {
            list: () => request('GET', '/remboursements/'),
        },
        dashboard: {
            stats: () => request('GET', '/dashboard/stats'),
            charts: () => request('GET', '/dashboard/charts'),
        },
        notifications: {
            list: (paramsObj = {}) => {
                const params = new URLSearchParams(paramsObj);
                return request('GET', `/notifications/?${params}`);
            },
            stats: () => request('GET', '/notifications/stats'),
            markRead: (id) => request('PUT', `/notifications/${id}/lire`),
            markAllRead: () => request('PUT', '/notifications/lire-toutes'),
        },
        utilisateurs: {
            list: () => request('GET', '/auth/utilisateurs'),
            create: (data) => request('POST', '/auth/utilisateur', toForm(data), true),
            delete: (id) => request('DELETE', `/auth/utilisateur/${id}`),
            updateSelf: (data) => request('PUT', '/auth/profil', toForm(data), true),
        },
        parametres: {
            get: () => request('GET', '/parametres'),
            update: (data) => request('PUT', '/parametres', data),
        },
        audit: {
            logs: (paramsObj = {}) => {
                const params = new URLSearchParams(paramsObj);
                return request('GET', `/audit/logs?${params}`);
            },
            stats: () => request('GET', '/audit/stats'),
        }
    };
})();
