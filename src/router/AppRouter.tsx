import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { AuthLayout } from '@/layouts/auth.layout';
import { SignInPage } from '@/pages/auth/signin.page';
import { SignUpPage } from '@/pages/auth/signup.page';
import { EmailCodePage } from '@/pages/auth/email-code.page';

// Landing
import { LandingPage } from '@/pages/landing.page';

// Layouts
import { UsersLayout } from '@/layouts/users.layout';
import { PORTAL_CONFIGS } from '@/router/portal.config';

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="signup/email-code" element={<EmailCodePage />} />
      </Route>

      {PORTAL_CONFIGS.map((portal) => (
        <Route key={portal.role} path={portal.basePath} element={<UsersLayout />}>
          {portal.childRoutes.map((childRoute) =>
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
        </Route>
      ))}

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
