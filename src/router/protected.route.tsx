import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type Role } from '@/stores/auth.store';
import { ROLE_HOME } from '@/router/portal.config';
import { PERMISSION_FEATURES } from '@/router/permission.features';
import { HasAnyPermission } from '@/lib/permissions';

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

/** Blocks a permission-gated portal page if the user lacks the required permission(s). */
export function PermissionRoute({
  path_suffix,
  children,
}: {
  path_suffix: string;
  children: React.ReactNode;
}) {
  const { user, permissions } = useAuthStore();
  const feature = PERMISSION_FEATURES.find(
    (f) => f.path === path_suffix || f.child_paths?.some((c) => c.path === path_suffix)
  );

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (feature && !HasAnyPermission(permissions, ...feature.any_of)) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return <>{children}</>;
}
