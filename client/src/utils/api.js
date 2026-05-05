import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/request-otp', '/auth/verify-otp'];

api.interceptors.request.use(async (config) => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));
    if (isPublicRoute) return config;

    let token = null;

    try {
        // getSession() also triggers a token refresh if the current one is expired
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            token = session.access_token;
            // Keep localStorage in sync with the (possibly refreshed) token
            localStorage.setItem('token', token);
        }
    } catch (e) {
        // silently fall through to localStorage
    }

    // Fallback: use the token stored during login
    if (!token) {
        const stored = localStorage.getItem('token');
        if (stored && stored !== 'undefined' && stored !== 'null') {
            token = stored;
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn(`[AUTH] No valid token found for request to ${config.url}`);
    }

    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) console.error('Unauthorized');
        console.error('API ERROR:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;