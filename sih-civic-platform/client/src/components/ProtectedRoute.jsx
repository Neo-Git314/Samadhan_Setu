import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRoleDefaultRoute } from '../utils/rbac';

function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const location = useLocation();

  const userRole = user?.role;
  const isRoleAllowed = allowedRoles.length === 0 || (userRole && allowedRoles.includes(userRole));

  useEffect(() => {
    if (isAuthenticated && !isRoleAllowed) {
      showToast(t('access_denied', 'Access denied. You are not authorized to access this portal.'), 'error');
    }
  }, [isAuthenticated, isRoleAllowed, showToast, t, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isRoleAllowed) {
    const fallbackRoute = getRoleDefaultRoute(userRole);
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
}

export default ProtectedRoute;
