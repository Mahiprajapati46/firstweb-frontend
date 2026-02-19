import api from './api';

const customerApi = {
    // Categories
    getCategoriesTree: async () => {
        try {
            const response = await api.get('/categories/tree');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Products
    getProducts: async ({ page = 1, limit = 20, category } = {}) => {
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', limit);
            if (category) params.append('category', category);

            const response = await api.get(`/products?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getProductBySlug: async (slug) => {
        try {
            const response = await api.get(`/products/${slug}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getProductReviews: async (productId) => {
        try {
            const response = await api.get(`/products/${productId}/reviews`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Cart (Authenticated)
    getCart: async () => {
        try {
            const response = await api.get('/customers/cart');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    addToCart: async ({ variant_id, quantity }) => {
        try {
            const response = await api.post('/customers/cart/items', { variant_id, quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateCartItem: async (itemId, { quantity }) => {
        try {
            const response = await api.patch(`/customers/cart/items/${itemId}`, { quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    removeFromCart: async (itemId) => {
        try {
            const response = await api.delete(`/customers/cart/items/${itemId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    clearCart: async () => {
        try {
            const response = await api.delete('/customers/cart');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Addresses (Authenticated)
    getAddresses: async () => {
        try {
            const response = await api.get('/customers/me/addresses');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    addAddress: async (addressData) => {
        try {
            const response = await api.post('/customers/me/addresses', addressData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/customers/me/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Orders & Checkout (Authenticated)
    getOrders: async () => {
        try {
            const response = await api.get('/customers/orders');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/customers/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    checkoutPreview: async (couponCode = '', variantIds = []) => {
        try {
            const params = new URLSearchParams();
            if (couponCode) params.append('coupon_code', couponCode);
            if (variantIds?.length > 0) params.append('variant_ids', variantIds.join(','));

            const url = `/customers/orders/preview${params.toString() ? '?' + params.toString() : ''}`;
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createOrder: async (orderData) => {
        try {
            const response = await api.post('/customers/orders', orderData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createCheckoutSession: async (orderId) => {
        try {
            const response = await api.post('/customers/payment/create-checkout-session', { orderId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    verifyPayment: async (orderId, sessionId) => {
        try {
            const response = await api.get(`/customers/payment/verify/${orderId}?session_id=${sessionId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Wallet (Authenticated)
    getWallet: async () => {
        try {
            const response = await api.get('/customers/wallet');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    topUpWallet: async (amount) => {
        try {
            const response = await api.post('/customers/wallet/top-up', { amount });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    confirmTopUp: async (sessionId) => {
        try {
            const response = await api.post(`/customers/wallet/confirm-top-up/${sessionId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    withdrawWallet: async (amount, bankDetails) => {
        try {
            const response = await api.post('/customers/wallet/withdraw', {
                amount,
                bank_details: bankDetails
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default customerApi;
