import type { Role } from '@/stores/auth.store';

/** Canonical permission names used by backend seed + guards. */
export const PERMISSIONS = {
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  REQUESTS_READ: 'requests.read',
  REQUESTS_WRITE: 'requests.write',
  REQUESTS_REVIEW: 'requests.review',
  AUDIT_READ: 'audit.read',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function HasPermission(
  permissions: string[] | undefined | null,
  permission: string
): boolean {
  return Boolean(permissions?.includes(permission));
}

export function HasAnyPermission(
  permissions: string[] | undefined | null,
  ...needed: string[]
): boolean {
  if (!permissions?.length || !needed.length) return false;
  return needed.some((p) => permissions.includes(p));
}

/** Roles that already expose a feature path in their base portal nav. */
export function RoleAlreadyHasPath(role: Role, path_suffix: string): boolean {
  const covered: Partial<Record<Role, string[]>> = {
    ADMINISTRATOR: ['users', 'applications', 'audit'],
    USER: ['procedures', 'procedures/new'],
    SECRETARY: ['inbox', 'technicians', 'architects', 'history', 'review', 'applications'],
    TECHNICIAN: ['inbox', 'review', 'applications'],
    FINANCIAL: ['applications', 'review'],
  };
  return (covered[role] ?? []).some((p) => p === path_suffix || path_suffix.startsWith(`${p}/`));
}
