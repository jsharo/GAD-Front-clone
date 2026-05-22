
/**
 * AppRouter.tsx — Router principal de la aplicación
 * Centraliza todas las rutas organizadas por rol/portal.
 *
 * Estructura:
 *   / (públicas)     → LandingPage, LoginPage, RegisterPage
 *   /ciudadano       → CiudadanoLayout  (INVITADO + CIUDADANO)
 *   /secretaria      → SecretariaLayout
 *   /tecnico         → TecnicoLayout
 *   /financiero      → FinancieroLayout
 *   /admin           → AdminLayout
 *
 * TODO (backend): descomentar el bloque RequireRole al final del archivo
 * para activar los guards de sesión cuando el backend esté listo.
 */

import { Routes, Route, Navigate } from 'react-router-dom'

// ── Páginas públicas ──────────────────────────────────────────────────────────
import { LandingPage }    from '@/pages/LandingPage'
import { LoginPage }      from '@/pages/auth/LoginPage'
import { RegisterPage }   from '@/pages/auth/RegisterPage'

// ── Layouts por portal ────────────────────────────────────────────────────────
import { CiudadanoLayout }  from '@/layouts/CiudadanoLayout'
import { TecnicoLayout }    from '@/layouts/TecnicoLayout'
import { SecretariaLayout } from '@/layouts/SecretariaLayout'
import { FinancieroLayout } from '@/layouts/FinancieroLayout'
import { AdminLayout }      from '@/layouts/AdminLayout'

// ── Portal Ciudadano ──────────────────────────────────────────────────────────
import { CiudadanoDashboard }  from '@/pages/ciudadano/CiudadanoDashboard'
import { MisSolicitudes }      from '@/pages/ciudadano/MisSolicitudes'
import { NuevaSolicitud }      from '@/pages/ciudadano/NuevaSolicitud'
import { DetalleSolicitud }    from '@/pages/ciudadano/DetalleSolicitud'

// ── Portal Técnico ────────────────────────────────────────────────────────────
import { TecnicoDashboard } from '@/pages/tecnico/TecnicoDashboard'
import { BandejaTecnico }   from '@/pages/tecnico/BandejaTecnico'
import { InspeccionPage }   from '@/pages/tecnico/InspeccionPage'

// ── Portal Secretaría ─────────────────────────────────────────────────────────
import { SecretariaDashboard }        from '@/pages/secretaria/SecretariaDashboard'
import { BandejaSecretaria }          from '@/pages/secretaria/BandejaSecretaria'
import { DetalleSolicitudSecretaria } from '@/pages/secretaria/DetalleSolicitudSecretaria'
import { SecretariaTecnicos }         from '@/pages/secretaria/SecretariaTecnicos'

// ── Portal Financiero ─────────────────────────────────────────────────────────
import { FinancieroDashboard } from '@/pages/financiero/FinancieroDashboard'
import { CobrosPendientes }    from '@/pages/financiero/CobrosPendientes'
import { DetalleCobroPage }    from '@/pages/financiero/DetalleCobroPage'

// ── Portal Admin (SuperAdmin) ─────────────────────────────────────────────────
import { AdminDashboard }        from '@/pages/admin/AdminDashboard'
import { AdminUsuarios }         from '@/pages/admin/AdminUsuarios'
import { AdminSolicitudes }      from '@/pages/admin/AdminSolicitudes'
import { AdminAuditoria }        from '@/pages/admin/AdminAuditoria'
import { AdminDetalleSolicitud } from '@/pages/admin/AdminDetalleSolicitud'

// ─────────────────────────────────────────────────────────────────────────────
// TODO (backend): Descomentar para activar guards de sesión
//
// import { useAuthStore } from '@/stores/auth.store'
//
// const ROLE_REDIRECT: Record<string, string> = {
//   CIUDADANO:  '/ciudadano',
//   INVITADO:   '/ciudadano',
//   TECNICO:    '/tecnico',
//   SECRETARIA: '/secretaria',
//   FINANCIERO: '/financiero',
//   SUPERADMIN: '/admin',
// }
//
// function RequireRole({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
//   const { user, accessToken } = useAuthStore()
//   if (!accessToken) return <Navigate to="/login" replace />
//   if (!allowed.includes(user?.role ?? '')) return <Navigate to="/login" replace />
//   return <>{children}</>
// }
//
// function RoleRedirect() {
//   const { user } = useAuthStore()
//   return <Navigate to={ROLE_REDIRECT[user?.role ?? ''] ?? '/ciudadano'} replace />
// }
// ─────────────────────────────────────────────────────────────────────────────

export function AppRouter() {
  return (
    <Routes>

      {/* ── Rutas públicas ───────────────────────────────────────────────── */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* ── Portal Ciudadano (INVITADO + CIUDADANO) ──────────────────────── */}
      <Route path="/ciudadano" element={<CiudadanoLayout />}>
        <Route index                    element={<CiudadanoDashboard />} />
        <Route path="solicitudes"       element={<MisSolicitudes />} />
        <Route path="solicitudes/nueva" element={<NuevaSolicitud />} />
        <Route path="solicitudes/:id"   element={<DetalleSolicitud />} />
      </Route>

      {/* ── Portal Secretaría ─────────────────────────────────────────────── */}
      <Route path="/secretaria" element={<SecretariaLayout />}>
        <Route index              element={<SecretariaDashboard />} />
        <Route path="bandeja"     element={<BandejaSecretaria />} />
        <Route path="bandeja/:id" element={<DetalleSolicitudSecretaria />} />
        <Route path="tecnicos"    element={<SecretariaTecnicos />} />
        <Route path="historial"   element={<BandejaSecretaria />} />
      </Route>

      {/* ── Portal Técnico ────────────────────────────────────────────────── */}
      <Route path="/tecnico" element={<TecnicoLayout />}>
        <Route index              element={<TecnicoDashboard />} />
        <Route path="bandeja"     element={<BandejaTecnico />} />
        <Route path="bandeja/:id" element={<InspeccionPage />} />
      </Route>

      {/* ── Portal Financiero ─────────────────────────────────────────────── */}
      <Route path="/financiero" element={<FinancieroLayout />}>
        <Route index               element={<FinancieroDashboard />} />
        <Route path="cobros"       element={<CobrosPendientes />} />
        <Route path="cobros/:id"   element={<DetalleCobroPage />} />
        <Route path="historial"    element={<CobrosPendientes />} />
        <Route path="liquidados"   element={<CobrosPendientes />} />
      </Route>

      {/* ── Portal Admin (SuperAdmin) ─────────────────────────────────────── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index                   element={<AdminDashboard />} />
        <Route path="usuarios"         element={<AdminUsuarios />} />
        <Route path="solicitudes"      element={<AdminSolicitudes />} />
        <Route path="solicitudes/:id"  element={<AdminDetalleSolicitud />} />
        <Route path="auditoria"        element={<AdminAuditoria />} />
      </Route>

      {/* ── Catch-all ────────────────────────────────────────────────────── */}
      {/* TODO (backend): reemplazar por <RoleRedirect /> al activar guards */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

