import api from './api';

const authApi = {
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    verifyEmail: async (token) => {
        try {
            const response = await api.post('/auth/email/verify/confirm', { token });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    loginPassword: async (credentials) => {
        try {
            const response = await api.post('/auth/login/password', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    requestOtp: async (email) => {
        try {
            const response = await api.post('/auth/login/otp/request', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    verifyOtp: async (email, otp) => {
        try {
            const response = await api.post('/auth/login/otp/verify', { email, otp });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    logout: async () => {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/password/forgot', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    resetPassword: async (token, password) => {
        try {
            const response = await api.post('/auth/password/reset', { token, password });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getProfile: async () => {
        try {
            const response = await api.get('/users/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default authApi;
