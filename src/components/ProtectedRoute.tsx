import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, type Role } from '@/stores/auth.store'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

// INVITADO siempre va al portal ciudadano (puede explorar, pero no tramitar)
const ROLE_HOME: Record<Role, string> = {
  SUPERADMIN: '/admin',
  CIUDADANO:  '/ciudadano',
  TECNICO:    '/tecnico',
  SECRETARIA: '/secretaria',
  FINANCIERO: '/financiero',
  INVITADO:   '/ciudadano',
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
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
