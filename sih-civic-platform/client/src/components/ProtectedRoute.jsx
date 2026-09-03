import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// TODO: Protect role-based routes once auth and permissions are integrated.
function ProtectedRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
