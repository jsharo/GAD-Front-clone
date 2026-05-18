import type { JSX } from "react";
import { useAuth } from "../../hooks/useAuth";
import Login from "../../pages/Login";

export function ProtectedRoute({children}: {children: JSX.Element}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
}