import api from './api';

const publicApi = {
    getCategories: async () => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getProducts: async (params = {}) => {
        try {
            const response = await api.get('/products', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getProductDetails: async (slug) => {
        try {
            const response = await api.get(`/products/${slug}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default publicApi;
