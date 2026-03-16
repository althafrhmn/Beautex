import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        const isTryingToAccessAdmin = window.location.pathname.startsWith('/admin');
        return <Navigate to={isTryingToAccessAdmin ? "/admin/login" : "/login"} state={{ from: window.location.pathname }} replace />;
    }

    return children;
};

export default PrivateRoute;
