import type { Role } from '@/stores/auth.store';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  FileText,
  HardHat,
  History,
  Inbox,
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Shield,
  Stamp,
  Users,
  Wrench,
  Landmark,
  UserRound,
} from 'lucide-react';

import { ArchitectDashboard } from '@/pages/architect/architect.dashboard';
import { MyProcedures } from '@/pages/architect/my.procedures';
import { NewProcedure } from '@/pages/architect/new.procedure';
import { ProcedureDetail } from '@/pages/architect/procedure.detail';
import { TechnicianDashboard } from '@/pages/technician/technician.dashboard';
import { TechnicianInbox } from '@/pages/technician/technician.inbox';
import { InspectionPage } from '@/pages/technician/inspection.page';
import { SecretaryDashboard } from '@/pages/secretary/secretary.dashboard';
import { SecretaryInbox } from '@/pages/secretary/secretary.inbox';
import { ApplicationDetailSecretary } from '@/pages/secretary/application.detail.secretary';
import { SecretaryTechnicians } from '@/pages/secretary/secretary.technicians';
import { ArchitectApproval } from '@/pages/secretary/architect.approval';
import { AdminDashboard } from '@/pages/admin/admin.dashboard';
import { AdminUsers } from '@/pages/admin/admin.users';
import { AdminApplications } from '@/pages/admin/admin.applications';
import { AdminAudit } from '@/pages/admin/admin.audit';
import { AdminApplicationDetail } from '@/pages/admin/admin.application.detail';
import { ModulePlaceholder } from '@/pages/shared/module.placeholder';

export interface PortalNavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

export interface PortalChildRoute {
  index?: boolean;
  path?: string;
  element: JSX.Element;
}

export interface PortalConfig {
  role: Role;
  base_path: string;
  panel_label: string;
  accent_class_name: string;
  accent_background: string;
  accent_border_class_name: string;
  badge_bg_class_name: string;
  badge_icon: LucideIcon;
  badge_label: string;
  nav_items: PortalNavItem[];
  child_routes: PortalChildRoute[];
}

export const PORTAL_CONFIGS: PortalConfig[] = [
  {
    role: 'ADMINISTRATOR',
    base_path: '/admin',
    panel_label: 'PANEL DE ADMINISTRACION',
    accent_class_name: 'text-red-600',
    accent_background: '#cc2229',
    accent_border_class_name: 'border-red-700',
    badge_bg_class_name: 'bg-red-500/5',
    badge_icon: Shield,
    badge_label: 'Administrador',
    nav_items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/admin/applications', icon: FileText, label: 'Todas las Solicitudes' },
      { to: '/admin/users', icon: Users, label: 'Usuarios y Técnicos' },
      { to: '/admin/audit', icon: Activity, label: 'Auditoría' },
    ],
    child_routes: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'applications', element: <AdminApplications /> },
      { path: 'applications/:id', element: <AdminApplicationDetail /> },
      { path: 'audit', element: <AdminAudit /> },
    ],
  },
  {
    role: 'USER',
    base_path: '/architect',
    panel_label: 'PORTAL PROFESIONAL',
    accent_class_name: 'text-amber-600',
    accent_background: '#d97706',
    accent_border_class_name: 'border-amber-700',
    badge_bg_class_name: 'bg-amber-500/5',
    badge_icon: HardHat,
    badge_label: 'Arquitecto',
    nav_items: [
      { to: '/architect', icon: LayoutDashboard, label: 'Inicio', end: true },
      { to: '/architect/procedures', icon: FileText, label: 'Mis Trámites', end: true },
      { to: '/architect/procedures/new', icon: PlusCircle, label: 'Nuevo Trámite', end: true },
    ],
    child_routes: [
      { index: true, element: <ArchitectDashboard /> },
      { path: 'procedures', element: <MyProcedures /> },
      { path: 'procedures/new', element: <NewProcedure /> },
      { path: 'procedures/:id', element: <ProcedureDetail /> },
    ],
  },
  {
    role: 'SECRETARY',
    base_path: '/secretary',
    panel_label: 'PORTAL SECRETARIA',
    accent_class_name: 'text-blue-600',
    accent_background: '#2563eb',
    accent_border_class_name: 'border-blue-700',
    badge_bg_class_name: 'bg-blue-500/5',
    badge_icon: Stamp,
    badge_label: 'Secretaría',
    nav_items: [
      { to: '/secretary', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/secretary/inbox', icon: Inbox, label: 'Bandeja de Trámites' },
      { to: '/secretary/technicians', icon: MapPin, label: 'Técnicos y Zonas' },
      { to: '/secretary/architects', icon: HardHat, label: 'Aprobación Arquitectos' },
      { to: '/secretary/history', icon: History, label: 'Historial' },
    ],
    child_routes: [
      { index: true, element: <SecretaryDashboard /> },
      { path: 'inbox', element: <SecretaryInbox /> },
      { path: 'inbox/:id', element: <ApplicationDetailSecretary /> },
      { path: 'technicians', element: <SecretaryTechnicians /> },
      { path: 'architects', element: <ArchitectApproval /> },
      { path: 'history', element: <SecretaryInbox /> },
    ],
  },
  {
    role: 'TECHNICIAN',
    base_path: '/technician',
    panel_label: 'PORTAL TECNICO',
    accent_class_name: 'text-green-600',
    accent_background: '#15803d',
    accent_border_class_name: 'border-green-700',
    badge_bg_class_name: 'bg-green-500/5',
    badge_icon: Wrench,
    badge_label: 'Técnico',
    nav_items: [
      { to: '/technician', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/technician/inbox', icon: Inbox, label: 'Bandeja de Trabajo' },
    ],
    child_routes: [
      { index: true, element: <TechnicianDashboard /> },
      { path: 'inbox', element: <TechnicianInbox /> },
      { path: 'inbox/:id', element: <InspectionPage /> },
    ],
  },
  {
    role: 'FINANCIAL',
    base_path: '/financial',
    panel_label: 'PORTAL FINANCIERO',
    accent_class_name: 'text-emerald-600',
    accent_background: '#047857',
    accent_border_class_name: 'border-emerald-700',
    badge_bg_class_name: 'bg-emerald-500/5',
    badge_icon: Landmark,
    badge_label: 'Financiero',
    nav_items: [{ to: '/financial', icon: Landmark, label: 'Inicio', end: true }],
    child_routes: [{ index: true, element: <ModulePlaceholder title="Portal Financiero" /> }],
  },
  {
    role: 'CITIZEN',
    base_path: '/citizen',
    panel_label: 'PORTAL CIUDADANO',
    accent_class_name: 'text-cyan-700',
    accent_background: '#0e7490',
    accent_border_class_name: 'border-cyan-800',
    badge_bg_class_name: 'bg-cyan-500/5',
    badge_icon: UserRound,
    badge_label: 'Ciudadano',
    nav_items: [{ to: '/citizen', icon: UserRound, label: 'Inicio', end: true }],
    child_routes: [{ index: true, element: <ModulePlaceholder title="Portal Ciudadano" /> }],
  },
];

export const PORTAL_CONFIG_BY_ROLE: Record<Role, PortalConfig> = PORTAL_CONFIGS.reduce(
  (acc, portal) => {
    acc[portal.role] = portal;
    return acc;
  },
  {} as Record<Role, PortalConfig>
);

export const ROLE_HOME: Record<Role, string> = PORTAL_CONFIGS.reduce(
  (acc, portal) => {
    acc[portal.role] = portal.base_path;
    return acc;
  },
  {} as Record<Role, string>
);

export function resolvePortalRole(pathname: string, fallback_role?: Role | null): Role {
  if (fallback_role && PORTAL_CONFIG_BY_ROLE[fallback_role]) {
    return fallback_role;
  }

  const matched_portal = PORTAL_CONFIGS.find(
    (portal) => pathname === portal.base_path || pathname.startsWith(`${portal.base_path}/`)
  );
  return matched_portal?.role ?? 'USER';
}
