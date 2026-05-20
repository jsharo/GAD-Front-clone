import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

// Landing
import { LandingPage } from '@/pages/LandingPage'

// Layouts
import { CiudadanoLayout } from '@/layouts/CiudadanoLayout'
import { TecnicoLayout } from '@/layouts/TecnicoLayout'
import { SecretariaLayout } from '@/layouts/SecretariaLayout'
import { FinancieroLayout } from '@/layouts/FinancieroLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

// Ciudadano
import { CiudadanoDashboard } from '@/pages/ciudadano/CiudadanoDashboard'
import { MisSolicitudes } from '@/pages/ciudadano/MisSolicitudes'
import { NuevaSolicitud } from '@/pages/ciudadano/NuevaSolicitud'
import { DetalleSolicitud } from '@/pages/ciudadano/DetalleSolicitud'

// Técnico
import { TecnicoDashboard } from '@/pages/tecnico/TecnicoDashboard'
import { BandejaTecnico } from '@/pages/tecnico/BandejaTecnico'
import { InspeccionPage } from '@/pages/tecnico/InspeccionPage'

// Secretaria
import { SecretariaDashboard } from '@/pages/secretaria/SecretariaDashboard'
import { BandejaSecretaria } from '@/pages/secretaria/BandejaSecretaria'
import { DetalleSolicitudSecretaria } from '@/pages/secretaria/DetalleSolicitudSecretaria'
import { SecretariaTecnicos } from '@/pages/secretaria/SecretariaTecnicos'

// Financiero
import { FinancieroDashboard } from '@/pages/financiero/FinancieroDashboard'
import { CobrosPendientes } from '@/pages/financiero/CobrosPendientes'
import { DetalleCobroPage } from '@/pages/financiero/DetalleCobroPage'

// Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminUsuarios } from '@/pages/admin/AdminUsuarios'
import { AdminSolicitudes } from '@/pages/admin/AdminSolicitudes'
import { AdminAuditoria } from '@/pages/admin/AdminAuditoria'
import { AdminDetalleSolicitud } from '@/pages/admin/AdminDetalleSolicitud'

// ─────────────────────────────────────────────────────────────────────────────
// TODO (backend): Descomentar y conectar los guards cuando el backend esté listo
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
//   const dest = ROLE_REDIRECT[user?.role ?? ''] ?? '/ciudadano'
//   return <Navigate to={dest} replace />
// }
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Rutas públicas ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* ── Portal Ciudadano ── */}
        <Route path="/ciudadano" element={<CiudadanoLayout />}>
          <Route index element={<CiudadanoDashboard />} />
          <Route path="solicitudes" element={<MisSolicitudes />} />
          <Route path="solicitudes/nueva" element={<NuevaSolicitud />} />
          <Route path="solicitudes/:id" element={<DetalleSolicitud />} />
        </Route>

        {/* ── Portal Secretaría ── */}
        <Route path="/secretaria" element={<SecretariaLayout />}>
          <Route index element={<SecretariaDashboard />} />
          <Route path="bandeja" element={<BandejaSecretaria />} />
          <Route path="bandeja/:id" element={<DetalleSolicitudSecretaria />} />
          <Route path="tecnicos" element={<SecretariaTecnicos />} />
          <Route path="historial" element={<BandejaSecretaria />} />
        </Route>

        {/* ── Portal Técnico ── */}
        <Route path="/tecnico" element={<TecnicoLayout />}>
          <Route index element={<TecnicoDashboard />} />
          <Route path="bandeja" element={<BandejaTecnico />} />
          <Route path="bandeja/:id" element={<InspeccionPage />} />
        </Route>

        {/* ── Portal Financiero ── */}
        <Route path="/financiero" element={<FinancieroLayout />}>
          <Route index element={<FinancieroDashboard />} />
          <Route path="cobros" element={<CobrosPendientes />} />
          <Route path="cobros/:id" element={<DetalleCobroPage />} />
          <Route path="historial" element={<CobrosPendientes />} />
          <Route path="liquidados" element={<CobrosPendientes />} />
        </Route>

        {/* ── Portal Admin (SuperAdmin) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="solicitudes" element={<AdminSolicitudes />} />
          <Route path="solicitudes/:id" element={<AdminDetalleSolicitud />} />
          <Route path="auditoria" element={<AdminAuditoria />} />
        </Route>

        {/* ── Catch-all: redirige al inicio ── */}
        {/* TODO (backend): reemplazar por <RoleRedirect /> cuando haya sesión */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}
