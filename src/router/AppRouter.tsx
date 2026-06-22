import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

// Auth
import { LoginPage } from '@/pages/auth/login.page'
import { RegisterPage } from '@/pages/auth/register.page'
import { RegisterArchitectPage } from '@/pages/auth/register.architect.page'

// Landing
import { LandingPage } from '@/pages/landing.page'

// Layouts
import { ArchitectLayout } from '@/layouts/architect.layout'
import { TechnicianLayout } from '@/layouts/technician.layout'
import { SecretaryLayout } from '@/layouts/secretary.layout'
import { AdminLayout } from '@/layouts/admin.layout'

// Architect
import { ArchitectDashboard } from '@/pages/architect/architect.dashboard'
import { MyProcedures } from '@/pages/architect/my.procedures'
import { NewProcedure } from '@/pages/architect/new.procedure'
import { ProcedureDetail } from '@/pages/architect/procedure.detail'

// Technician
import { TechnicianDashboard } from '@/pages/technician/technician.dashboard'
import { TechnicianInbox } from '@/pages/technician/technician.inbox'
import { InspectionPage } from '@/pages/technician/inspection.page'

// Secretary
import { SecretaryDashboard } from '@/pages/secretary/secretary.dashboard'
import { SecretaryInbox } from '@/pages/secretary/secretary.inbox'
import { ApplicationDetailSecretary } from '@/pages/secretary/application.detail.secretary'
import { SecretaryTechnicians } from '@/pages/secretary/secretary.technicians'
import { ArchitectApproval } from '@/pages/secretary/architect.approval'

// Admin
import { AdminDashboard } from '@/pages/admin/admin.dashboard'
import { AdminUsers } from '@/pages/admin/admin.users'
import { AdminApplications } from '@/pages/admin/admin.applications'
import { AdminAudit } from '@/pages/admin/admin.audit'
import { AdminApplicationDetail } from '@/pages/admin/admin.application.detail'

import { ProtectedRoute, PublicOnlyRoute, ROLE_HOME } from '@/components/protected.route'

// Intelligent redirect on login or unknown routes
function RoleRedirect() {
  const { user } = useAuthStore()
  const dest = user ? (ROLE_HOME[user.role] ?? '/login') : '/login'
  return <Navigate to={dest} replace />
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Public-Only Routes (Authenticated users get redirected) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-architect" element={<RegisterArchitectPage />} />
      </Route>

      {/* ---- Portal Architect ---- */}
      <Route element={<ProtectedRoute allowed_roles={['ARCHITECT']} />}>
        <Route path="/architect" element={<ArchitectLayout />}>
          <Route index element={<ArchitectDashboard />} />
          <Route path="procedures" element={<MyProcedures />} />
          <Route path="procedures/new" element={<NewProcedure />} />
          <Route path="procedures/:id" element={<ProcedureDetail />} />
        </Route>
      </Route>

      {/* ---- Portal Secretary ---- */}
      <Route element={<ProtectedRoute allowed_roles={['SECRETARY']} />}>
        <Route path="/secretary" element={<SecretaryLayout />}>
          <Route index element={<SecretaryDashboard />} />
          <Route path="inbox" element={<SecretaryInbox />} />
          <Route path="inbox/:id" element={<ApplicationDetailSecretary />} />
          <Route path="technicians" element={<SecretaryTechnicians />} />
          <Route path="architects" element={<ArchitectApproval />} />
          <Route path="history" element={<SecretaryInbox />} />
        </Route>
      </Route>

      {/* ---- Portal Technician ---- */}
      <Route element={<ProtectedRoute allowed_roles={['TECHNICIAN']} />}>
        <Route path="/technician" element={<TechnicianLayout />}>
          <Route index element={<TechnicianDashboard />} />
          <Route path="inbox" element={<TechnicianInbox />} />
          <Route path="inbox/:id" element={<InspectionPage />} />
        </Route>
      </Route>

      {/* ---- Admin Portal ---- */}
      <Route element={<ProtectedRoute allowed_roles={['SUPERADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="applications/:id" element={<AdminApplicationDetail />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  )
}

