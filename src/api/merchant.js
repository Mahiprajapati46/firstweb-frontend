import api from './api';

const merchantApi = {
    // Onboarding
    apply: async (data) => {
        try {
            const response = await api.post('/merchants/apply', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    reapply: async (data) => {
        try {
            const response = await api.post('/merchants/reapply', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/merchants/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Dashboard Stats
    getStats: async () => {
        try {
            const response = await api.get('/merchants/stats/overview');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Products
    getProducts: async (params) => {
        try {
            const response = await api.get('/merchants/products', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getProduct: async (id) => {
        try {
            const response = await api.get(`/merchants/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createProduct: async (formData) => {
        try {
            const response = await api.post('/merchants/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateProduct: async (id, formData) => {
        try {
            const response = await api.patch(`/merchants/products/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/merchants/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    submitProduct: async (id) => {
        try {
            const response = await api.put(`/merchants/products/${id}/submit`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    resubmitProduct: async (id) => {
        try {
            const response = await api.put(`/merchants/products/${id}/resubmit`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    permanentDeleteProduct: async (id) => {
        try {
            const response = await api.delete(`/merchants/products/${id}/permanent`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Variants
    getVariants: async (productId) => {
        try {
            const response = await api.get(`/merchants/products/${productId}/variants`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createVariant: async (productId, data) => {
        try {
            const response = await api.post(`/merchants/products/${productId}/variants`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateVariant: async (variantId, data) => {
        try {
            const response = await api.patch(`/merchants/variants/${variantId}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteVariant: async (variantId) => {
        try {
            const response = await api.delete(`/merchants/variants/${variantId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Stock
    getStock: async (params) => {
        try {
            const response = await api.get('/merchants/stock', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateVariantStock: async (variantId, data) => {
        try {
            const response = await api.patch(`/merchants/variants/${variantId}/stock`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Wallet
    getWallet: async () => {
        try {
            const response = await api.get('/merchants/wallet/summary');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getTransactions: async (params) => {
        try {
            const response = await api.get('/merchants/wallet/transactions', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    requestWithdrawal: async (amount) => {
        try {
            const response = await api.post('/merchants/wallet/payout', { amount });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Wallet APIs
    getWallet: async () => {
        try {
            const response = await api.get('/merchants/wallet/summary');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getTransactions: async (params) => {
        try {
            const response = await api.get('/merchants/wallet/transactions', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    requestPayout: async () => {
        try {
            const response = await api.post('/merchants/wallet/payout');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    initStripeOnboarding: async () => {
        try {
            const response = await api.post('/merchants/wallet/onboard-stripe');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getEarningsReport: async (period = 'daily') => {
        try {
            const response = await api.get('/merchants/wallet/reports/earnings', { params: { period } });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    simulateStripeOnboarding: async () => {
        try {
            const response = await api.post('/merchants/wallet/simulate-onboarding-success');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Global Data
    getCategories: async () => {
        try {
            const response = await api.get('/merchants/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Requests
    submitCategoryRequest: async (data) => {
        try {
            const response = await api.post('/merchants/category-requests', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getCategoryRequests: async (params) => {
        try {
            const response = await api.get('/merchants/category-requests', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    submitChangeRequest: async (data) => {
        try {
            const response = await api.post('/merchants/change-requests', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getChangeRequests: async (params) => {
        try {
            const response = await api.get('/merchants/change-requests', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Orders
    getOrders: async (params) => {
        try {
            const response = await api.get('/merchants/orders', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getOrderDetail: async (subOrderId) => {
        try {
            const response = await api.get(`/merchants/orders/${subOrderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    packOrder: async (id) => {
        try {
            const response = await api.post(`/merchants/orders/${id}/pack`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    shipOrder: async (id, data) => {
        try {
            const response = await api.post(`/merchants/orders/${id}/ship`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deliverOrder: async (id) => {
        try {
            const response = await api.post(`/merchants/orders/${id}/deliver`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    approveReturn: async (id) => {
        try {
            const response = await api.post(`/merchants/orders/${id}/approve-return`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    rejectReturn: async (id, reason) => {
        try {
            const response = await api.post(`/merchants/orders/${id}/reject-return`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Reviews
    getReviews: async (params) => {
        try {
            const response = await api.get('/merchants/reviews', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    replyToReview: async (reviewId, reply) => {
        try {
            const response = await api.patch(`/merchants/reviews/${reviewId}/reply`, { reply });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default merchantApi;
