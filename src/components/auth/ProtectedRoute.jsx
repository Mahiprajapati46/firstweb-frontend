import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute Check:', { path: location.pathname, user, loading, allowedRoles });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full"></div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Verifying Session</p>
            </div>
        </div>
    );

    if (!user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
