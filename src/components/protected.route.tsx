import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, type Role } from '@/stores/auth.store'

interface ProtectedRouteProps {
  allowed_roles?: Role[]
}

// Redirect pathways based on English roles and pages
export const ROLE_HOME: Record<Role, string> = {
  SUPERADMIN: '/admin',
  TECHNICIAN: '/technician',
  SECRETARY:  '/secretary',
  ARCHITECT:  '/architect',
}

export function ProtectedRoute({ allowed_roles }: ProtectedRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowed_roles && !allowed_roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user } = useAuthStore()

  if (user) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <Outlet />
}
