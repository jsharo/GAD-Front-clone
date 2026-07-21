import { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { AuthLayout } from '@/layouts/auth.layout';
import { SignInPage } from '@/pages/auth/signin.page';
import { SignUpPage } from '@/pages/auth/signup.page';
import { EmailCodePage } from '@/pages/auth/email.code.page';
import { ForgotPasswordPage } from '@/pages/auth/forgot.password.page';
import { ResetPasswordPage } from '@/pages/auth/reset.password.page';

// Landing
import { LandingPage } from '@/pages/landing.page';

// Layouts
import { UsersLayout } from '@/layouts/users.layout';
import { PORTAL_CONFIGS } from '@/router/portal.config';
import { GetPermissionExtras } from '@/router/permission.features';
import { ProtectedRoute, PublicOnlyRoute, PermissionRoute } from '@/router/protected.route';
import { SettingsPage } from '@/pages/settings/settings.page';
import { useAuthStore } from '@/stores/auth.store';

export function AppRouter() {
  const permissions = useAuthStore((s) => s.permissions);

  const portals = useMemo(
    () =>
      PORTAL_CONFIGS.map((portal) => {
        const extras = GetPermissionExtras(portal.role, permissions, portal.base_path);
        const existing = new Set(
          portal.child_routes.map((r) => (r.index ? '__index__' : (r.path ?? '')))
        );
        const extra_routes = extras.child_routes.filter((r) => r.path && !existing.has(r.path));
        return { portal, extra_routes };
      }),
    [permissions]
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="signin" element={<SignInPage />} />
          <Route path="login" element={<Navigate to="/auth/signin" replace />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="register" element={<Navigate to="/auth/signup" replace />} />
          <Route path="signup/email-code" element={<EmailCodePage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Settings — any authenticated role */}
      <Route element={<ProtectedRoute />}>
        <Route path="/settings" element={<UsersLayout />}>
          <Route index element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Portal routes must be direct children of <Routes> */}
      {portals.map(({ portal, extra_routes }) => (
        <Route key={portal.role} element={<ProtectedRoute allowed_roles={[portal.role]} />}>
          <Route path={portal.base_path} element={<UsersLayout />}>
            {portal.child_routes.map((childRoute) =>
              childRoute.index ? (
                <Route key={`${portal.role}-index`} index element={childRoute.element} />
              ) : (
                <Route
                  key={`${portal.role}-${childRoute.path}`}
                  path={childRoute.path}
                  element={childRoute.element}
                />
              )
            )}
            {extra_routes.map((childRoute) => (
              <Route
                key={`${portal.role}-extra-${childRoute.path}`}
                path={childRoute.path}
                element={
                  <PermissionRoute path_suffix={childRoute.path!}>
                    {childRoute.element}
                  </PermissionRoute>
                }
              />
            ))}
          </Route>
        </Route>
      ))}

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
