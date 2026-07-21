/* eslint-disable react-refresh/only-export-components -- feature catalog, not a React component module */
import type { LucideIcon } from 'lucide-react';
import { Activity, FileText, Inbox, PlusCircle, Users } from 'lucide-react';
import type { Role } from '@/stores/auth.store';
import { HasAnyPermission, RoleAlreadyHasPath, PERMISSIONS } from '@/lib/permissions';
import type { PortalChildRoute, PortalNavItem } from '@/router/portal.config';
import { AdminUsers } from '@/pages/admin/admin.users';
import { AdminApplications } from '@/pages/admin/admin.applications';
import { AdminApplicationDetail } from '@/pages/admin/admin.application.detail';
import { AdminAudit } from '@/pages/admin/admin.audit';
import { NewProcedure } from '@/pages/architect/new.procedure';
import { SecretaryInbox } from '@/pages/secretary/secretary.inbox';
import { ApplicationDetailSecretary } from '@/pages/secretary/application.detail.secretary';

export interface PermissionFeature {
  id: string;
  /** User needs at least one of these permissions to unlock the feature. */
  any_of: string[];
  path: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  element: JSX.Element;
  /** Extra child routes under the same feature (e.g. detail pages). */
  child_paths?: Array<{ path: string; element: JSX.Element }>;
}

export const PERMISSION_FEATURES: PermissionFeature[] = [
  {
    id: 'users',
    any_of: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE],
    path: 'users',
    label: 'Users',
    icon: Users,
    element: <AdminUsers />,
  },
  {
    id: 'requests-list',
    any_of: [PERMISSIONS.REQUESTS_READ, PERMISSIONS.REQUESTS_REVIEW],
    path: 'applications',
    label: 'Applications',
    icon: FileText,
    element: <AdminApplications />,
    child_paths: [{ path: 'applications/:id', element: <AdminApplicationDetail /> }],
  },
  {
    id: 'requests-review',
    any_of: [PERMISSIONS.REQUESTS_REVIEW],
    path: 'review',
    label: 'Review Applications',
    icon: Inbox,
    element: <SecretaryInbox />,
    child_paths: [{ path: 'review/:id', element: <ApplicationDetailSecretary /> }],
  },
  {
    id: 'requests-write',
    any_of: [PERMISSIONS.REQUESTS_WRITE],
    path: 'procedures/new',
    label: 'New Application',
    icon: PlusCircle,
    end: true,
    element: <NewProcedure />,
  },
  {
    id: 'audit',
    any_of: [PERMISSIONS.AUDIT_READ],
    path: 'audit',
    label: 'Audit',
    icon: Activity,
    element: <AdminAudit />,
  },
];

export function GetPermissionExtras(
  role: Role,
  permissions: string[],
  base_path: string
): { nav_items: PortalNavItem[]; child_routes: PortalChildRoute[] } {
  const nav_items: PortalNavItem[] = [];
  const child_routes: PortalChildRoute[] = [];
  const seen_paths = new Set<string>();

  for (const feature of PERMISSION_FEATURES) {
    if (!HasAnyPermission(permissions, ...feature.any_of)) continue;
    if (RoleAlreadyHasPath(role, feature.path)) continue;
    if (seen_paths.has(feature.path)) continue;
    seen_paths.add(feature.path);

    nav_items.push({
      to: `${base_path}/${feature.path}`,
      icon: feature.icon,
      label: feature.label,
      end: feature.end,
    });

    child_routes.push({
      path: feature.path,
      element: feature.element,
    });

    for (const child of feature.child_paths ?? []) {
      if (seen_paths.has(child.path)) continue;
      seen_paths.add(child.path);
      child_routes.push({
        path: child.path,
        element: child.element,
      });
    }
  }

  return { nav_items, child_routes };
}
