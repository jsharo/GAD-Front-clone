import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type Role } from '@/stores/auth.store';
import { ROLE_HOME } from '@/router/portal.config';

interface ProtectedRouteProps {
  allowed_roles?: Role[];
}

export function ProtectedRoute({ allowed_roles }: ProtectedRouteProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (allowed_roles && !allowed_roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/auth/signin'} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user } = useAuthStore();

  if (user) {
    return <Navigate to={ROLE_HOME[user.role] || '/auth/signin'} replace />;
  }

  return <Outlet />;
}
