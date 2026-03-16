import api from '../utils/api';

export const fetchServices = async () => {
    const response = await api.get('/services');
    return response.data;
};

export const fetchServiceById = async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
};

// Admin only
export const createService = async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
};
