import api from './api';

const adminApi = {
    getSalesTrend: async (days = 30) => {
        try {
            const response = await api.get(`/admin/analytics/sales-trend?days=${days}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getCategoryPerformance: async () => {
        try {
            const response = await api.get('/admin/analytics/category-performance');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getTopProducts: async (limit = 5) => {
        try {
            const response = await api.get(`/admin/analytics/top-products?limit=${limit}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getUsers: async () => {
        try {
            const response = await api.get('/admin/users');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getUserById: async (id) => {
        try {
            const response = await api.get(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    blockUser: async (id, reason) => {
        try {
            const response = await api.patch(`/admin/users/${id}/block`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    unblockUser: async (id, reason) => {
        try {
            const response = await api.patch(`/admin/users/${id}/unblock`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    forceLogoutUser: async (id) => {
        try {
            const response = await api.post(`/admin/users/${id}/force-logout`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getMerchants: async ({ status, page = 1, limit = 20 } = {}) => {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            params.append('page', page);
            params.append('limit', limit);
            const response = await api.get(`/admin/merchants?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getMerchantById: async (id) => {
        try {
            const response = await api.get(`/admin/merchants/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getOrderById: async (id) => {
        try {
            const response = await api.get(`/admin/orders/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getOrders: async ({ status, customer_id, date_from, date_to, page = 1, limit = 10 } = {}) => {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (customer_id) params.append('customer_id', customer_id);
            if (date_from) params.append('date_from', date_from);
            if (date_to) params.append('date_to', date_to);
            params.append('page', page);
            params.append('limit', limit);

            const response = await api.get(`/admin/orders?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getCoupons: async () => {
        try {
            const response = await api.get('/admin/coupons');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    createCoupon: async (data) => {
        try {
            const response = await api.post('/admin/coupons', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    updateCoupon: async (id, data) => {
        try {
            const response = await api.patch(`/admin/coupons/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    deleteCoupon: async (id) => {
        try {
            const response = await api.delete(`/admin/coupons/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getWithdrawals: async () => {
        try {
            const response = await api.get('/admin/withdrawals/pending');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getAuditLogs: async ({ page = 1, limit = 20, action, target_type } = {}) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);
            if (action) params.append('action', action);
            if (target_type) params.append('target_type', target_type);

            const response = await api.get(`/admin/audit-logs?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    updateMerchantStatus: async (id, status, reason = '') => {
        try {
            const response = await api.patch(`/admin/merchants/${id}/status`, { status, reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getAdminProducts: async ({ status, page = 1, limit = 20 } = {}) => {
        try {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            params.append('page', page);
            params.append('limit', limit);
            const response = await api.get(`/admin/products?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    reviewProduct: async (productId, { action, rejection_reason }) => {
        try {
            const response = await api.put(`/admin/products/${productId}/review`, { action, rejection_reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    toggleProductActive: async (productId) => {
        try {
            const response = await api.patch(`/admin/products/${productId}/toggle-status`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    deleteProductPermanently: async (productId) => {
        try {
            const response = await api.delete(`/admin/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getWithdrawals: async (status = '') => {
        try {
            const response = await api.get(`/admin/withdrawals${status ? `?status=${status}` : ''}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    approveWithdrawal: async (id, admin_notes = '') => {
        try {
            const response = await api.post(`/admin/withdrawals/${id}/approve`, { admin_notes });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    rejectWithdrawal: async (id, admin_notes) => {
        try {
            const response = await api.post(`/admin/withdrawals/${id}/reject`, { admin_notes });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getCategories: async () => {
        try {
            const response = await api.get('/admin/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    createCategory: async (data) => {
        try {
            const response = await api.post('/admin/categories', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    updateCategory: async (id, data) => {
        try {
            const response = await api.patch(`/admin/categories/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/admin/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    toggleCategoryStatus: async (id) => {
        try {
            const response = await api.patch(`/admin/categories/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    uploadCategoryImage: async (id, file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await api.post(`/admin/categories/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getCategoryRequests: async (status = 'PENDING') => {
        try {
            const response = await api.get(`/admin/category-requests?status=${status}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    approveCategoryRequest: async (id) => {
        try {
            const response = await api.patch(`/admin/category-requests/${id}/approve`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    rejectCategoryRequest: async (id, rejection_reason) => {
        try {
            const response = await api.patch(`/admin/category-requests/${id}/reject`, { rejection_reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getDashboardStats: async () => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getSettings: async () => {
        try {
            const response = await api.get('/admin/settings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    updateSettings: async (data) => {
        try {
            const response = await api.patch('/admin/settings', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default adminApi;
