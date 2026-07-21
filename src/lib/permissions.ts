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

/** Capability presets for Admin assignment UI (maps to one or more permission names). */
export const PERMISSION_PRESETS: Array<{
  id: string;
  label: string;
  description: string;
  permissions: PermissionName[];
}> = [
  {
    id: 'users-management',
    label: 'User management',
    description: 'View and create/edit users (includes listing roles for the form)',
    permissions: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE],
  },
  {
    id: 'requests-review',
    label: 'Application review',
    description: 'View inbox and approve/flag applications',
    permissions: [PERMISSIONS.REQUESTS_READ, PERMISSIONS.REQUESTS_REVIEW],
  },
  {
    id: 'requests-create',
    label: 'Create applications',
    description: 'View and create application requests',
    permissions: [PERMISSIONS.REQUESTS_READ, PERMISSIONS.REQUESTS_WRITE],
  },
  {
    id: 'audit',
    label: 'Audit',
    description: 'View the system audit log',
    permissions: [PERMISSIONS.AUDIT_READ],
  },
];

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

/** Map preset permission names → catalog IDs (optionally restricted to an allow-list of IDs). */
export function ResolvePresetPermissionIds(
  catalog: Array<{ id: string; name: string }>,
  permission_names: string[],
  allow_ids?: string[]
): string[] {
  const wanted = new Set(permission_names);
  const allow = allow_ids ? new Set(allow_ids) : null;
  return catalog.filter((p) => wanted.has(p.name) && (!allow || allow.has(p.id))).map((p) => p.id);
}

export function IsPresetFullySelected(selected_ids: string[], preset_ids: string[]): boolean {
  return preset_ids.length > 0 && preset_ids.every((id) => selected_ids.includes(id));
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
