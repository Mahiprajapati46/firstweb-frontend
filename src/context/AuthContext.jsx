import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const loginWithPassword = async (email, password) => {
        try {
            const response = await authApi.loginPassword({ email, password });
            const { access_token } = response.data;

            // For now, we manually fetch profile after login or decode token
            // Ideally backend returns user object too. Checking your current login response...
            // Your backend response is: { data: { access_token, token_type } }

            localStorage.setItem('token', access_token);

            // Get profile to populate user state
            const profileResponse = await authApi.getProfile();
            const user = profileResponse.data;

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, role: user.role };
        } catch (error) {
            console.error('Login Error:', error);
            return {
                success: false,
                message: error.message || error.error || 'Login failed'
            };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await authApi.verifyOtp(email, otp);
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);

            const profileResponse = await authApi.getProfile();
            const user = profileResponse.data;

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, role: user.role };
        } catch (error) {
            console.error('OTP Verify Error:', error);
            return {
                success: false,
                message: error.message || error.error || 'OTP verification failed'
            };
        }
    };

    const logout = () => {
        authApi.logout().catch(console.error); // Silently try logout on server
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            loginWithPassword,
            verifyOtp,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
