import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Token from LocalStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        // Handle unauthorized access (optional: redirect to login)
        console.error('Unauthorized access');
    }
    console.error('API ERROR Details:', error.response?.data || error.message);
    return Promise.reject(error);
});

export default api;
