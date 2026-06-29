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
  basePath: string;
  panelLabel: string;
  accentClassName: string;
  accentBackground: string;
  accentBorderClassName: string;
  badgeBgClassName: string;
  badgeIcon: LucideIcon;
  badgeLabel: string;
  navItems: PortalNavItem[];
  childRoutes: PortalChildRoute[];
}

export const PORTAL_CONFIGS: PortalConfig[] = [
  {
    role: 'ADMINISTRATOR',
    basePath: '/admin',
    panelLabel: 'PANEL DE ADMINISTRACION',
    accentClassName: 'text-red-600',
    accentBackground: '#cc2229',
    accentBorderClassName: 'border-red-700',
    badgeBgClassName: 'bg-red-500/5',
    badgeIcon: Shield,
    badgeLabel: 'Administrador',
    navItems: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/admin/applications', icon: FileText, label: 'Todas las Solicitudes' },
      { to: '/admin/users', icon: Users, label: 'Usuarios y Técnicos' },
      { to: '/admin/audit', icon: Activity, label: 'Auditoría' },
    ],
    childRoutes: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'applications', element: <AdminApplications /> },
      { path: 'applications/:id', element: <AdminApplicationDetail /> },
      { path: 'audit', element: <AdminAudit /> },
    ],
  },
  {
    role: 'USER',
    basePath: '/architect',
    panelLabel: 'PORTAL PROFESIONAL',
    accentClassName: 'text-amber-600',
    accentBackground: '#d97706',
    accentBorderClassName: 'border-amber-700',
    badgeBgClassName: 'bg-amber-500/5',
    badgeIcon: HardHat,
    badgeLabel: 'Arquitecto',
    navItems: [
      { to: '/architect', icon: LayoutDashboard, label: 'Inicio', end: true },
      { to: '/architect/procedures', icon: FileText, label: 'Mis Trámites', end: true },
      { to: '/architect/procedures/new', icon: PlusCircle, label: 'Nuevo Trámite', end: true },
    ],
    childRoutes: [
      { index: true, element: <ArchitectDashboard /> },
      { path: 'procedures', element: <MyProcedures /> },
      { path: 'procedures/new', element: <NewProcedure /> },
      { path: 'procedures/:id', element: <ProcedureDetail /> },
    ],
  },
  {
    role: 'SECRETARY',
    basePath: '/secretary',
    panelLabel: 'PORTAL SECRETARIA',
    accentClassName: 'text-blue-600',
    accentBackground: '#2563eb',
    accentBorderClassName: 'border-blue-700',
    badgeBgClassName: 'bg-blue-500/5',
    badgeIcon: Stamp,
    badgeLabel: 'Secretaría',
    navItems: [
      { to: '/secretary', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/secretary/inbox', icon: Inbox, label: 'Bandeja de Trámites' },
      { to: '/secretary/technicians', icon: MapPin, label: 'Técnicos y Zonas' },
      { to: '/secretary/architects', icon: HardHat, label: 'Aprobación Arquitectos' },
      { to: '/secretary/history', icon: History, label: 'Historial' },
    ],
    childRoutes: [
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
    basePath: '/technician',
    panelLabel: 'PORTAL TECNICO',
    accentClassName: 'text-green-600',
    accentBackground: '#15803d',
    accentBorderClassName: 'border-green-700',
    badgeBgClassName: 'bg-green-500/5',
    badgeIcon: Wrench,
    badgeLabel: 'Técnico',
    navItems: [
      { to: '/technician', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/technician/inbox', icon: Inbox, label: 'Bandeja de Trabajo' },
    ],
    childRoutes: [
      { index: true, element: <TechnicianDashboard /> },
      { path: 'inbox', element: <TechnicianInbox /> },
      { path: 'inbox/:id', element: <InspectionPage /> },
    ],
  },
  {
    role: 'FINANCIAL',
    basePath: '/financial',
    panelLabel: 'PORTAL FINANCIERO',
    accentClassName: 'text-emerald-600',
    accentBackground: '#047857',
    accentBorderClassName: 'border-emerald-700',
    badgeBgClassName: 'bg-emerald-500/5',
    badgeIcon: Landmark,
    badgeLabel: 'Financiero',
    navItems: [{ to: '/financial', icon: Landmark, label: 'Inicio', end: true }],
    childRoutes: [{ index: true, element: <ModulePlaceholder title="Portal Financiero" /> }],
  },
  {
    role: 'CITIZEN',
    basePath: '/citizen',
    panelLabel: 'PORTAL CIUDADANO',
    accentClassName: 'text-cyan-700',
    accentBackground: '#0e7490',
    accentBorderClassName: 'border-cyan-800',
    badgeBgClassName: 'bg-cyan-500/5',
    badgeIcon: UserRound,
    badgeLabel: 'Ciudadano',
    navItems: [{ to: '/citizen', icon: UserRound, label: 'Inicio', end: true }],
    childRoutes: [{ index: true, element: <ModulePlaceholder title="Portal Ciudadano" /> }],
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
    acc[portal.role] = portal.basePath;
    return acc;
  },
  {} as Record<Role, string>
);

export function resolvePortalRole(pathname: string, fallbackRole?: Role | null): Role {
  if (fallbackRole && PORTAL_CONFIG_BY_ROLE[fallbackRole]) {
    return fallbackRole;
  }

  const matchedPortal = PORTAL_CONFIGS.find(
    (portal) => pathname === portal.basePath || pathname.startsWith(`${portal.basePath}/`)
  );
  return matchedPortal?.role ?? 'USER';
}
