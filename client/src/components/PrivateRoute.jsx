import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, requiredRole, requiredRoles }) => {
    const { isAuthenticated, role } = useSelector((state) => state.auth);

    // BYPASS FOR TESTING
    if (window.location.pathname.startsWith('/bookings')) {
        return children;
    }

    if (!isAuthenticated) {
        const isTryingToAccessAdmin = window.location.pathname.startsWith('/admin');
        return <Navigate to={isTryingToAccessAdmin ? "/admin/login" : "/login"} state={{ from: window.location.pathname }} replace />;
    }

    if (isAuthenticated && role === null) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#00E6A0] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Role-based Access Control (RBAC)
    const isAuthorized = role === 'admin' || 
                         (requiredRole && role === requiredRole) ||
                         (requiredRoles && requiredRoles.includes(role));

    if ((requiredRole || requiredRoles) && !isAuthorized) {
        console.warn(`[SECURITY] Unauthorized access attempt by ${role} to ${window.location.pathname}`);
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
