import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import MerchantLayout from './layouts/MerchantLayout';
import GuestLayout from './layouts/GuestLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Real Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Home from './pages/Home';
import MerchantApply from './pages/merchant/Apply';
import MerchantStatus from './pages/merchant/Status';
import MerchantDashboard from './pages/merchant/Dashboard';
import MerchantProducts from './pages/merchant/Products';
import MerchantProductForm from './pages/merchant/ProductForm';
import MerchantProductDetail from './pages/merchant/ProductDetail';
import MerchantVariants from './pages/merchant/Variants';
import MerchantOrders from './pages/merchant/Orders';
import MerchantOrderDetail from './pages/merchant/OrderDetail';
import MerchantInventory from './pages/merchant/Inventory';
import MerchantWallet from './pages/merchant/Wallet';
import MerchantRequests from './pages/merchant/Requests';
import MerchantReviews from './pages/merchant/Reviews';
import AdminDashboard from './pages/admin/Dashboard';
import AdminAnalytics from './pages/admin/Analytics';
import AdminMerchants from './pages/admin/Merchants';
import AdminMerchantDetail from './pages/admin/MerchantDetail';
import AdminCategories from './pages/admin/Categories';
import AdminProducts from './pages/admin/Products';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminCategoryRequests from './pages/admin/CategoryRequests';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminUsers from './pages/admin/Users';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminCoupons from './pages/admin/Coupons';
import AdminSettings from './pages/admin/Settings';
import AdminAuditLogs from './pages/admin/AuditLogs';

// Customer Pages
import CustomerLayout from './layouts/CustomerLayout';
import CustomerHome from './pages/customer/Home';
import CustomerProductListing from './pages/customer/ProductListing';
import CustomerProductDetail from './pages/customer/ProductDetail';
import CustomerCart from './pages/customer/Cart';
import CustomerProfile from './pages/customer/Profile';
import CustomerCheckout from './pages/customer/Checkout';
import CustomerOrderSuccess from './pages/customer/OrderSuccess';
import CustomerOrders from './pages/customer/Orders';
import CustomerOrderDetail from './pages/customer/OrderDetail';
import CustomerWallet from './pages/customer/Wallet';
import CustomerTopUpSuccess from './pages/customer/TopUpSuccess';

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Routes>
                    {/* Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Customer Routes (Public) */}
                    <Route path="/" element={<CustomerLayout><CustomerHome /></CustomerLayout>} />
                    <Route path="/products" element={<CustomerLayout><CustomerProductListing /></CustomerLayout>} />
                    <Route path="/products/:slug" element={<CustomerLayout><CustomerProductDetail /></CustomerLayout>} />

                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                <CustomerLayout><CustomerCart /></CustomerLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                <CustomerLayout><CustomerProfile /></CustomerLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                <CustomerLayout><CustomerCheckout /></CustomerLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/order-success"
                        element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                <CustomerLayout><CustomerOrderSuccess /></CustomerLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                <CustomerLayout><CustomerOrders /></CustomerLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders/:orderId"
                        element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                <CustomerLayout><CustomerOrderDetail /></CustomerLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/wallet"
                        element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                <CustomerLayout><CustomerWallet /></CustomerLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/wallet/top-up/success"
                        element={
                            <ProtectedRoute allowedRoles={['CUSTOMER']}>
                                <CustomerLayout><CustomerTopUpSuccess /></CustomerLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirect old home to customer home if needed, but here it's already root */}

                    {/* Admin Routes */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                                <AdminLayout>
                                    <Routes>
                                        <Route path="dashboard" element={<AdminDashboard />} />
                                        <Route path="analytics" element={<AdminAnalytics />} />
                                        <Route path="merchants" element={<AdminMerchants />} />
                                        <Route path="merchants/:id" element={<AdminMerchantDetail />} />
                                        <Route path="categories" element={<AdminCategories />} />
                                        <Route path="products" element={<AdminProducts />} />
                                        <Route path="withdrawals" element={<AdminWithdrawals />} />
                                        <Route path="category-requests" element={<AdminCategoryRequests />} />
                                        <Route path="orders" element={<AdminOrders />} />
                                        <Route path="orders/:id" element={<AdminOrderDetail />} />
                                        <Route path="users" element={<AdminUsers />} />
                                        <Route path="users/:id" element={<AdminUserDetail />} />
                                        <Route path="coupons" element={<AdminCoupons />} />
                                        <Route path="settings" element={<AdminSettings />} />
                                        <Route path="audit-logs" element={<AdminAuditLogs />} />
                                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                                    </Routes>
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Merchant Routes */}
                    <Route
                        path="/merchant/*"
                        element={
                            <ProtectedRoute allowedRoles={['MERCHANT']}>
                                <MerchantLayout>
                                    <Routes>
                                        <Route path="dashboard" element={<MerchantDashboard />} />
                                        <Route path="products" element={<MerchantProducts />} />
                                        <Route path="products/new" element={<MerchantProductForm />} />
                                        <Route path="products/:id/edit" element={<MerchantProductForm />} />
                                        <Route path="products/:id" element={<MerchantProductDetail />} />
                                        <Route path="products/:id/variants" element={<MerchantVariants />} />
                                        <Route path="inventory" element={<MerchantInventory />} />
                                        <Route path="orders" element={<MerchantOrders />} />
                                        <Route path="orders/:id" element={<MerchantOrderDetail />} />
                                        <Route path="wallet" element={<MerchantWallet />} />
                                        <Route path="requests" element={<MerchantRequests />} />
                                        <Route path="reviews" element={<MerchantReviews />} />
                                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                                    </Routes>
                                </MerchantLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Merchant Onboarding Routes */}
                    <Route
                        path="/merchant/apply"
                        element={
                            <GuestLayout>
                                <MerchantApply />
                            </GuestLayout>
                        }
                    />
                    <Route
                        path="/merchant/status"
                        element={
                            <GuestLayout>
                                <MerchantStatus />
                            </GuestLayout>
                        }
                    />
                    {/* Compatibility redirect for old link */}
                    <Route path="/become-seller" element={<Navigate to="/merchant/apply" replace />} />

                    {/* Catch All */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
            <Toaster position="bottom-right" />
        </ErrorBoundary>
    );
}

export default App;
