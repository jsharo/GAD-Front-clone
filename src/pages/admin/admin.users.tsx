import { useEffect, useMemo, useState, useCallback } from 'react';
import { Edit3, Plus, Shield, Trash2, Users } from 'lucide-react';
import { roles_api, users_api } from '@/lib/api.calls';
import { FormatDateTime, Cn } from '@/lib/utils';
import { BaseModal } from '@/components/logic/base.modal';
import { useToastStore } from '@/stores/toast.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  PERMISSIONS,
  PERMISSION_PRESETS,
  IsPresetFullySelected,
  ResolvePresetPermissionIds,
} from '@/lib/permissions';
import { PageHeader } from '@/components/ui/page.header';
import { AlertBanner } from '@/components/ui/alert.banner';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { SearchInput } from '@/components/ui/search.input';

type AdminTab = 'users' | 'roles';

type UserStatus = 'ACTIVE' | 'INACTIVE';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  lastname: string | null;
  national_id: string | null;
  direction: string | null;
  status: UserStatus;
  role: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminUserWire {
  id: string;
  email: string;
  name: string | null;
  lastname: string | null;
  cedula: string | null;
  direction: string | null;
  status: UserStatus;
  role: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PermissionRecord {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface RolePermissionLink {
  permission_id: string;
  permission: PermissionRecord;
}

interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  permissions?: RolePermissionLink[];
  _count?: { users: number };
}

interface PermissionRecordWire {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RolePermissionLinkWire {
  permissionId: string;
  permission: PermissionRecordWire;
}

interface RoleRecordWire {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: RolePermissionLinkWire[];
  _count?: { users: number };
}

interface UserFormState {
  name: string;
  lastname: string;
  email: string;
  national_id: string;
  direction: string;
  password: string;
  role: string;
  status: UserStatus;
  permission_ids: string[];
}

interface RoleFormState {
  name: string;
  description: string;
  permission_ids: string[];
}

const EMPTY_USER_FORM: UserFormState = {
  name: '',
  lastname: '',
  email: '',
  national_id: '',
  direction: '',
  password: '',
  role: 'TECHNICIAN',
  status: 'ACTIVE',
  permission_ids: [],
};

const EMPTY_ROLE_FORM: RoleFormState = {
  name: '',
  description: '',
  permission_ids: [],
};

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATOR: 'Administrador',
  TECHNICIAN: 'Técnico',
  SECRETARY: 'Secretaria',
  FINANCIAL: 'Financiero',
  USER: 'Profesional',
  CITIZEN: 'Ciudadano',
};

const PERMISSION_MODULE_LABELS: Record<string, string> = {
  users: 'Usuarios',
  requests: 'Solicitudes',
  audit: 'Auditoría',
};

const PERMISSION_ACTION_LABELS: Record<string, string> = {
  read: 'Lectura',
  write: 'Escritura',
  review: 'Revisión',
};

function FormatPermissionLabel(name: string): string {
  const [module, action] = name.split('.');
  if (!module || !action) return name;

  const module_label = PERMISSION_MODULE_LABELS[module] ?? module;
  const action_label = PERMISSION_ACTION_LABELS[action] ?? action;

  return `${action_label} de ${module_label}`;
}

function GetErrorMessage(err: unknown, fallback: string) {
  const axios_error = err as { response?: { data?: { message?: string | string[] } } };
  const raw_message = axios_error.response?.data?.message;
  if (Array.isArray(raw_message)) return raw_message.join(', ');
  return raw_message || fallback;
}

function FormatRoleDisplayName(name: string): string {
  const labeled = ROLE_LABELS[name];
  if (labeled) return labeled;
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

interface UserPermissionBreakdown {
  role_name: string | null;
  role_permission_ids: string[];
  direct_permission_ids: string[];
  effective_permission_ids: string[];
}

function GetRolePermissionIdsForName(role_name: string, roles: RoleRecord[]): string[] {
  const role = roles.find((entry) => entry.name === role_name);
  return (role?.permissions ?? []).map((entry) => entry.permission_id);
}

function StripRolePermissionsFromSelection(
  permission_ids: string[],
  role_name: string,
  roles: RoleRecord[]
): string[] {
  const role_set = new Set(GetRolePermissionIdsForName(role_name, roles));
  return permission_ids.filter((id) => !role_set.has(id));
}

function MapPermissionRecord(raw: PermissionRecordWire): PermissionRecord {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,
  };
}

function MapRoleRecord(raw: RoleRecordWire): RoleRecord {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    created_at: raw.createdAt,
    updated_at: raw.updatedAt,
    permissions: (raw.permissions ?? []).map((entry) => ({
      permission_id: entry.permissionId,
      permission: MapPermissionRecord(entry.permission),
    })),
    _count: raw._count,
  };
}

function MapAdminUser(raw: AdminUserWire): AdminUser {
  const status: UserStatus = raw.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const { cedula, createdAt, updatedAt, ...rest } = raw;
  return {
    ...rest,
    national_id: cedula ?? null,
    status,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

async function ListUsers(params?: { role?: string; limit?: number }): Promise<AdminUser[]> {
  const response = await users_api.List(params);
  const data = (response.data as { success: boolean; data: AdminUserWire[] }).data ?? [];
  return data.map(MapAdminUser);
}

async function ListRoles(): Promise<RoleRecord[]> {
  const response = await roles_api.List();
  return ((response.data as RoleRecordWire[]) ?? []).map(MapRoleRecord);
}

async function ListPermissions(): Promise<PermissionRecord[]> {
  const response = await roles_api.ListPermissions();
  return ((response.data as PermissionRecordWire[]) ?? []).map(MapPermissionRecord);
}

async function CreateInstitutionalUser(payload: {
  email: string;
  password: string;
  name: string;
  lastname: string;
  roleName: string;
  cedula?: string;
  direction?: string;
}) {
  const response = await users_api.CreateStaff(payload);
  return (response.data as { success: boolean; user: { id: string } }).user;
}

async function UpdateUserProfile(
  id: string,
  payload: {
    name: string;
    lastname: string;
    cedula?: string;
    direction?: string;
    password?: string;
  }
): Promise<AdminUser> {
  const response = await users_api.Update(id, payload);
  return MapAdminUser((response.data as { success: boolean; data: AdminUserWire }).data);
}

async function UpdateUserStatus(id: string, status: UserStatus): Promise<AdminUser> {
  const response = await users_api.UpdateStatus(id, status);
  return MapAdminUser((response.data as { success: boolean; data: AdminUserWire }).data);
}

async function AssignUserRole(user_id: string, role_name: string) {
  await roles_api.Assign(user_id, role_name);
}

async function GetUserPermissionBreakdown(user_id: string): Promise<UserPermissionBreakdown> {
  const response = await roles_api.GetUserPermissionsBreakdown(user_id);
  const data = response.data as {
    roleName: string | null;
    rolePermissionIds: string[];
    directPermissionIds: string[];
    effectivePermissionIds: string[];
  };
  return {
    role_name: data.roleName,
    role_permission_ids: data.rolePermissionIds,
    direct_permission_ids: data.directPermissionIds,
    effective_permission_ids: data.effectivePermissionIds,
  };
}

async function SyncUserPermissions(user_id: string, permission_ids: string[]) {
  const response = await roles_api.SyncUserPermissions(user_id, permission_ids);
  const data = response.data as {
    directPermissionIds: string[];
    ignoredBecauseInRole: string[];
  };
  return {
    direct_permission_ids: data.directPermissionIds,
    ignored_because_in_role: data.ignoredBecauseInRole,
  };
}

async function CreateRole(payload: { name: string; description?: string }) {
  const response = await roles_api.Create(payload);
  return MapRoleRecord(response.data as RoleRecordWire);
}

async function UpdateRole(id: string, payload: { name?: string; description?: string }) {
  const response = await roles_api.Update(id, payload);
  return MapRoleRecord(response.data as RoleRecordWire);
}

async function SyncRolePermissions(role_id: string, permission_ids: string[]) {
  const response = await roles_api.SyncPermissions(role_id, permission_ids);
  return MapRoleRecord(response.data as RoleRecordWire);
}

async function DeleteRole(id: string) {
  await roles_api.Delete(id);
}

export function AdminUsers() {
  const AddToast = useToastStore((state) => state.AddToast);
  const auth_user = useAuthStore((s) => s.user);
  const HasPermission = useAuthStore((s) => s.HasPermission);
  const RefreshPermissions = useAuthStore((s) => s.RefreshPermissions);
  const can_write_users =
    auth_user?.role === 'ADMINISTRATOR' || HasPermission(PERMISSIONS.USERS_WRITE);
  const can_manage_roles = auth_user?.role === 'ADMINISTRATOR';

  const [active_tab, set_active_tab] = useState<AdminTab>('users');

  useEffect(() => {
    if (!can_manage_roles && active_tab === 'roles') {
      set_active_tab('users');
    }
  }, [can_manage_roles, active_tab]);

  const [users, set_users] = useState<AdminUser[]>([]);
  const [roles, set_roles] = useState<RoleRecord[]>([]);
  const [permissions, set_permissions] = useState<PermissionRecord[]>([]);

  const [is_loading_users, set_is_loading_users] = useState(true);
  const [is_loading_roles, set_is_loading_roles] = useState(false);

  const [role_filter, set_role_filter] = useState('');
  const [user_search, set_user_search] = useState('');
  const [role_search, set_role_search] = useState('');

  const [show_user_modal, set_show_user_modal] = useState(false);
  const [editing_user, set_editing_user] = useState<AdminUser | null>(null);
  const [user_form, set_user_form] = useState<UserFormState>(EMPTY_USER_FORM);

  const [show_role_modal, set_show_role_modal] = useState(false);
  const [editing_role, set_editing_role] = useState<RoleRecord | null>(null);
  const [role_form, set_role_form] = useState<RoleFormState>(EMPTY_ROLE_FORM);

  const [show_delete_role_modal, set_show_delete_role_modal] = useState(false);
  const [role_to_delete, set_role_to_delete] = useState<RoleRecord | null>(null);

  const [is_saving, set_is_saving] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const FetchRoles = useCallback(async () => {
    set_is_loading_roles(true);
    try {
      set_roles(await ListRoles());
    } catch (e) {
      const message = GetErrorMessage(e, 'No se pudieron cargar los roles');
      AddToast({ type: 'error', message });
    } finally {
      set_is_loading_roles(false);
    }
  }, [AddToast]);

  const FetchPermissions = useCallback(async () => {
    try {
      set_permissions(await ListPermissions());
    } catch (e) {
      const message = GetErrorMessage(e, 'No se pudieron cargar los permisos');
      AddToast({ type: 'error', message });
    }
  }, [AddToast]);

  const FetchUsers = useCallback(async () => {
    set_is_loading_users(true);
    try {
      const params: { role?: string; limit: number } = { limit: 100 };
      if (role_filter) params.role = role_filter;
      set_users(await ListUsers(params));
    } catch (e) {
      const message = GetErrorMessage(e, 'No se pudieron cargar los usuarios');
      set_error(message);
      AddToast({ type: 'error', message });
    } finally {
      set_is_loading_users(false);
    }
  }, [role_filter, AddToast]);

  useEffect(() => {
    FetchRoles();
    FetchPermissions();
  }, [FetchRoles, FetchPermissions]);

  useEffect(() => {
    FetchUsers();
  }, [FetchUsers]);

  const role_options = useMemo(
    () =>
      roles.map((role) => ({
        value: role.name,
        label: role.description
          ? `${FormatRoleDisplayName(role.name)} — ${role.description}`
          : FormatRoleDisplayName(role.name),
      })),
    [roles]
  );

  const filtered_users = useMemo(() => {
    const q = user_search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        `${user.name ?? ''} ${user.lastname ?? ''}`.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.national_id ?? '').includes(q) ||
        (user.direction ?? '').toLowerCase().includes(q)
    );
  }, [user_search, users]);

  const filtered_roles = useMemo(() => {
    const q = role_search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(q) || (role.description ?? '').toLowerCase().includes(q)
    );
  }, [role_search, roles]);

  const selected_role_permission_ids = useMemo(
    () => GetRolePermissionIdsForName(user_form.role, roles),
    [user_form.role, roles]
  );

  const role_permissions_for_form = useMemo(
    () => permissions.filter((permission) => selected_role_permission_ids.includes(permission.id)),
    [permissions, selected_role_permission_ids]
  );

  const additional_permissions_for_form = useMemo(
    () => permissions.filter((permission) => !selected_role_permission_ids.includes(permission.id)),
    [permissions, selected_role_permission_ids]
  );

  const OpenCreateUser = () => {
    set_error(null);
    set_editing_user(null);
    set_user_form({
      ...EMPTY_USER_FORM,
      role: roles[0]?.name ?? 'TECHNICIAN',
      permission_ids: [],
    });
    set_show_user_modal(true);
  };

  const OpenEditUser = async (user: AdminUser) => {
    set_error(null);
    set_editing_user(user);
    set_user_form({
      name: user.name ?? '',
      lastname: user.lastname ?? '',
      email: user.email ?? '',
      national_id: user.national_id ?? '',
      direction: user.direction ?? '',
      password: '',
      role: user.role ?? roles[0]?.name ?? 'TECHNICIAN',
      status: user.status,
      permission_ids: [],
    });
    set_show_user_modal(true);
    try {
      const breakdown = await GetUserPermissionBreakdown(user.id);
      set_user_form((prev) => ({
        ...prev,
        role: breakdown.role_name ?? prev.role,
        permission_ids: breakdown.direct_permission_ids,
      }));
    } catch (e) {
      const message = GetErrorMessage(e, 'No se pudieron cargar los permisos del usuario');
      AddToast({ type: 'error', message });
    }
  };

  const OpenCreateRole = () => {
    set_error(null);
    set_editing_role(null);
    set_role_form(EMPTY_ROLE_FORM);
    set_show_role_modal(true);
  };

  const OpenEditRole = (role: RoleRecord) => {
    set_error(null);
    set_editing_role(role);
    set_role_form({
      name: role.name,
      description: role.description ?? '',
      permission_ids: (role.permissions ?? []).map((entry) => entry.permission_id),
    });
    set_show_role_modal(true);
  };

  const HandleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    set_is_saving(true);
    set_error(null);
    try {
      const contact = user_form.direction.trim();
      if (contact && contact.length !== 10) {
        set_error('El contacto debe ser un número de celular de 10 dígitos');
        return;
      }

      if (editing_user) {
        await UpdateUserProfile(editing_user.id, {
          name: user_form.name.trim(),
          lastname: user_form.lastname.trim(),
          cedula: user_form.national_id.trim() || undefined,
          direction: contact || undefined,
          ...(user_form.password ? { password: user_form.password } : {}),
        });
        if (user_form.status !== editing_user.status) {
          await UpdateUserStatus(editing_user.id, user_form.status);
        }
        if (user_form.role !== (editing_user.role ?? '')) {
          await AssignUserRole(editing_user.id, user_form.role);
        }
        const sync_result = await SyncUserPermissions(editing_user.id, user_form.permission_ids);
        if (sync_result.ignored_because_in_role.length > 0) {
          AddToast({
            type: 'warning',
            message: `${sync_result.ignored_because_in_role.length} permiso(s) ya vienen del rol y no se guardaron como adicionales.`,
          });
        }
        await FetchUsers();
      } else {
        if (!user_form.password) {
          set_error('La contraseña temporal es obligatoria');
          return;
        }
        const created_user = await CreateInstitutionalUser({
          email: user_form.email.trim(),
          password: user_form.password,
          name: user_form.name.trim(),
          lastname: user_form.lastname.trim(),
          roleName: user_form.role,
          cedula: user_form.national_id.trim() || undefined,
          direction: contact || undefined,
        });
        if (user_form.permission_ids.length > 0) {
          const sync_result = await SyncUserPermissions(created_user.id, user_form.permission_ids);
          if (sync_result.ignored_because_in_role.length > 0) {
            AddToast({
              type: 'warning',
              message: `${sync_result.ignored_because_in_role.length} permiso(s) ya vienen del rol y no se guardaron como adicionales.`,
            });
          }
        }
        await FetchUsers();
      }
      if (editing_user?.id && auth_user?.id && editing_user.id === auth_user.id) {
        await RefreshPermissions();
      }
      set_show_user_modal(false);
      set_editing_user(null);
      set_user_form(EMPTY_USER_FORM);
      AddToast({
        type: 'success',
        message: editing_user
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente',
      });
    } catch (err: unknown) {
      const message = GetErrorMessage(err, 'Error al guardar usuario');
      set_error(message);
      AddToast({ type: 'error', message });
    } finally {
      set_is_saving(false);
    }
  };

  const HandleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    set_is_saving(true);
    set_error(null);
    try {
      let saved_role: RoleRecord;
      if (editing_role) {
        await UpdateRole(editing_role.id, {
          description: role_form.description.trim() || undefined,
        });
        saved_role = await SyncRolePermissions(editing_role.id, role_form.permission_ids);
      } else {
        saved_role = await CreateRole({
          name: role_form.name.trim(),
          description: role_form.description.trim() || undefined,
        });
        if (role_form.permission_ids.length > 0) {
          saved_role = await SyncRolePermissions(saved_role.id, role_form.permission_ids);
        }
      }
      void saved_role;
      await FetchRoles();
      set_show_role_modal(false);
      set_editing_role(null);
      set_role_form(EMPTY_ROLE_FORM);
      AddToast({
        type: 'success',
        message: editing_role ? 'Rol actualizado correctamente' : 'Rol creado correctamente',
      });
    } catch (err: unknown) {
      const message = GetErrorMessage(err, 'Error al guardar rol');
      set_error(message);
      AddToast({ type: 'error', message });
    } finally {
      set_is_saving(false);
    }
  };

  const HandleToggleActive = async (user: AdminUser) => {
    const next_status: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await UpdateUserStatus(user.id, next_status);
      set_users((prev) => prev.map((entry) => (entry.id === user.id ? updated : entry)));
      AddToast({
        type: 'success',
        message: user.status === 'ACTIVE' ? 'Usuario desactivado' : 'Usuario activado',
      });
    } catch (err: unknown) {
      const message = GetErrorMessage(err, 'Error al cambiar estado');
      set_error(message);
      AddToast({ type: 'error', message });
    }
  };

  const OpenDeleteRole = (role: RoleRecord) => {
    set_error(null);
    set_role_to_delete(role);
    set_show_delete_role_modal(true);
  };

  const HandleConfirmDeleteRole = async () => {
    if (!role_to_delete) return;
    set_is_saving(true);
    set_error(null);
    try {
      await DeleteRole(role_to_delete.id);
      await FetchRoles();
      set_show_delete_role_modal(false);
      set_role_to_delete(null);
      AddToast({ type: 'success', message: 'Rol eliminado correctamente' });
    } catch (err: unknown) {
      const message = GetErrorMessage(err, 'Error al eliminar rol');
      set_error(message);
      AddToast({ type: 'error', message });
    } finally {
      set_is_saving(false);
    }
  };

  const ToggleRolePermission = (permission_id: string) => {
    set_role_form((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permission_id)
        ? prev.permission_ids.filter((id) => id !== permission_id)
        : [...prev.permission_ids, permission_id],
    }));
  };

  const ToggleUserPermission = (permission_id: string) => {
    set_user_form((prev) => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permission_id)
        ? prev.permission_ids.filter((id) => id !== permission_id)
        : [...prev.permission_ids, permission_id],
    }));
  };

  const ApplyUserPreset = (permission_names: string[]) => {
    const allow_ids = additional_permissions_for_form.map((p) => p.id);
    const preset_ids = ResolvePresetPermissionIds(permissions, permission_names, allow_ids);
    if (preset_ids.length === 0) {
      AddToast({
        type: 'warning',
        message: 'Ese paquete ya está cubierto por el rol o no hay permisos disponibles.',
      });
      return;
    }
    set_user_form((prev) => {
      const fully = IsPresetFullySelected(prev.permission_ids, preset_ids);
      if (fully) {
        return {
          ...prev,
          permission_ids: prev.permission_ids.filter((id) => !preset_ids.includes(id)),
        };
      }
      return {
        ...prev,
        permission_ids: [...new Set([...prev.permission_ids, ...preset_ids])],
      };
    });
  };

  const ApplyRolePreset = (permission_names: string[]) => {
    const preset_ids = ResolvePresetPermissionIds(permissions, permission_names);
    if (preset_ids.length === 0) return;
    set_role_form((prev) => {
      const fully = IsPresetFullySelected(prev.permission_ids, preset_ids);
      if (fully) {
        return {
          ...prev,
          permission_ids: prev.permission_ids.filter((id) => !preset_ids.includes(id)),
        };
      }
      return {
        ...prev,
        permission_ids: [...new Set([...prev.permission_ids, ...preset_ids])],
      };
    });
  };

  const is_any_modal_open = show_user_modal || show_role_modal || show_delete_role_modal;

  const TabButtonClass = (tab: AdminTab) =>
    Cn(
      'px-4 py-2 text-sm font-semibold rounded-lg transition-colors',
      active_tab === tab
        ? 'bg-primary-default text-white shadow-sm'
        : 'text-slate-600 hover:bg-surface-muted'
    );

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Gestión de usuarios y roles" icon={Users} />

      {error && !is_any_modal_open && (
        <AlertBanner message={error} OnDismiss={() => set_error(null)} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-1">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={TabButtonClass('users')}
            onClick={() => set_active_tab('users')}
          >
            Usuarios
          </button>
          {can_manage_roles && (
            <button
              type="button"
              className={TabButtonClass('roles')}
              onClick={() => set_active_tab('roles')}
            >
              Roles
            </button>
          )}
        </div>

        {active_tab === 'users' ? (
          can_write_users ? (
            <button onClick={OpenCreateUser} className="btn-primary shrink-0">
              <Plus size={18} /> Nuevo Usuario
            </button>
          ) : null
        ) : (
          can_manage_roles && (
            <button onClick={OpenCreateRole} className="btn-primary shrink-0">
              <Plus size={18} /> Nuevo Rol
            </button>
          )
        )}
      </div>

      {active_tab === 'users' && (
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <SearchInput
              container_class_name="flex-1"
              placeholder="Buscar por nombre, email, cédula o contacto..."
              value={user_search}
              onChange={(e) => set_user_search(e.target.value)}
            />
            <select
              value={role_filter}
              onChange={(e) => set_role_filter(e.target.value)}
              className="input-field md:max-w-xs"
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {FormatRoleDisplayName(role.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-surface-border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-surface-muted border-b border-surface-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Usuario</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">Cédula / Contacto</th>
                  <th className="px-6 py-4 font-semibold">Registro</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {is_loading_users ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4">
                      <LoadingSkeleton count={3} variant="row" />
                    </td>
                  </tr>
                ) : filtered_users.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={Users}
                        title="No se encontraron usuarios"
                        className="py-8"
                      />
                    </td>
                  </tr>
                ) : (
                  filtered_users.map((user) => {
                    const role = user.role ?? 'USER';
                    const is_active = user.status === 'ACTIVE';
                    return (
                      <tr
                        key={user.id}
                        className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
                              {user.name?.charAt(0) || '?'}
                              {user.lastname?.charAt(0) || ''}
                            </div>
                            <div>
                              <p className="font-semibold text-blue-950">
                                {user.name || 'Sin nombre'} {user.lastname}
                              </p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {FormatRoleDisplayName(role)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <p>{user.national_id || '—'}</p>
                          <p className="text-xs">{user.direction || '—'}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {FormatDateTime(user.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {can_write_users ? (
                              <button
                                type="button"
                                role="switch"
                                aria-checked={is_active}
                                aria-label={is_active ? 'Usuario activo' : 'Usuario inactivo'}
                                onClick={() => HandleToggleActive(user)}
                                className={Cn(
                                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-default focus:ring-offset-2',
                                  is_active ? 'bg-success-default' : 'bg-slate-300'
                                )}
                              >
                                <span
                                  className={Cn(
                                    'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                                    is_active ? 'translate-x-6' : 'translate-x-1'
                                  )}
                                />
                              </button>
                            ) : null}
                            <span
                              className={Cn(
                                'text-xs font-semibold',
                                is_active ? 'text-success-dark' : 'text-slate-500'
                              )}
                            >
                              {is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {can_write_users ? (
                            <button
                              onClick={() => OpenEditUser(user)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                            >
                              <Edit3 size={14} /> Editar
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">Solo lectura</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {active_tab === 'roles' && (
        <div className="glass-card p-6">
          <SearchInput
            container_class_name="mb-6"
            placeholder="Buscar rol por nombre o descripción..."
            value={role_search}
            onChange={(e) => set_role_search(e.target.value)}
          />

          <div className="overflow-x-auto rounded-xl border border-surface-border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-surface-muted border-b border-surface-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">Descripción</th>
                  <th className="px-6 py-4 font-semibold">Permisos</th>
                  <th className="px-6 py-4 font-semibold">Usuarios</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {is_loading_roles ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4">
                      <LoadingSkeleton count={3} variant="row" />
                    </td>
                  </tr>
                ) : filtered_roles.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon={Shield} title="No hay roles registrados" className="py-8" />
                    </td>
                  </tr>
                ) : (
                  filtered_roles.map((role) => (
                    <tr
                      key={role.id}
                      className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {FormatRoleDisplayName(role.name)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{role.description || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {(role.permissions ?? []).length === 0 ? (
                            <span className="text-xs text-slate-400">Sin permisos</span>
                          ) : (
                            role.permissions?.map((entry) => (
                              <span
                                key={entry.permission_id}
                                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {FormatPermissionLabel(entry.permission.name)}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{role._count?.users ?? 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => OpenEditRole(role)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          >
                            <Edit3 size={14} /> Editar
                          </button>
                          <button
                            onClick={() => OpenDeleteRole(role)}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BaseModal
        is_open={show_user_modal}
        OnClose={() => {
          set_show_user_modal(false);
          set_editing_user(null);
          set_user_form(EMPTY_USER_FORM);
          set_error(null);
        }}
        title={editing_user ? 'Editar usuario' : 'Registrar usuario'}
        size="md"
        hide_brand_bar
        respect_header
      >
        {error && show_user_modal && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={HandleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label normal-case">Rol *</label>
              <select
                required
                className="input-field"
                value={user_form.role}
                onChange={(e) => {
                  const new_role = e.target.value;
                  set_user_form((prev) => ({
                    ...prev,
                    role: new_role,
                    permission_ids: StripRolePermissionsFromSelection(
                      prev.permission_ids,
                      new_role,
                      roles
                    ),
                  }));
                }}
              >
                {role_options.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label normal-case">Estado</label>
              <select
                className="input-field"
                value={user_form.status}
                onChange={(e) =>
                  set_user_form({ ...user_form, status: e.target.value as UserStatus })
                }
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label normal-case">Nombres *</label>
              <input
                required
                className="input-field"
                value={user_form.name}
                onChange={(e) => set_user_form({ ...user_form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label normal-case">Apellidos *</label>
              <input
                required
                className="input-field"
                value={user_form.lastname}
                onChange={(e) => set_user_form({ ...user_form, lastname: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label normal-case">Correo *</label>
              <input
                required
                type="email"
                className="input-field"
                disabled={!!editing_user}
                value={user_form.email}
                onChange={(e) => set_user_form({ ...user_form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label normal-case">Cédula</label>
              <input
                className="input-field"
                maxLength={10}
                value={user_form.national_id}
                onChange={(e) => set_user_form({ ...user_form, national_id: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label normal-case">Contacto</label>
              <input
                className="input-field"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="0991234567"
                value={user_form.direction}
                onChange={(e) =>
                  set_user_form({
                    ...user_form,
                    direction: e.target.value.replace(/\D/g, '').slice(0, 10),
                  })
                }
              />
            </div>
            <div>
              <label className="input-label normal-case">
                {editing_user ? 'Nueva contraseña (opcional)' : 'Contraseña temporal *'}
              </label>
              <input
                required={!editing_user}
                type="password"
                className="input-field"
                value={user_form.password}
                onChange={(e) => set_user_form({ ...user_form, password: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="input-label normal-case">
                Permisos del rol ({FormatRoleDisplayName(user_form.role)})
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Heredados del rol seleccionado. Para cambiarlos, edita el rol en la pestaña Roles.
              </p>
              <div className="max-h-32 overflow-y-auto rounded-xl border border-surface-border bg-surface-muted/30 p-2 space-y-1">
                {role_permissions_for_form.length === 0 ? (
                  <p className="text-sm text-slate-500">Este rol no tiene permisos asignados.</p>
                ) : (
                  role_permissions_for_form.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start gap-2 p-1.5 rounded-lg opacity-80 cursor-not-allowed"
                    >
                      <input type="checkbox" className="mt-1" checked disabled readOnly />
                      <span>
                        <span className="block text-sm font-medium text-blue-950">
                          {FormatPermissionLabel(permission.name)}
                        </span>
                        {permission.description && (
                          <span className="block text-xs text-slate-500">
                            {permission.description}
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="input-label normal-case">Permisos adicionales</label>
              <p className="text-xs text-slate-500 mb-2">
                Solo para este usuario. No se repiten los que ya trae el rol. Usa un paquete para
                marcar el conjunto recomendado de una vez.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {PERMISSION_PRESETS.map((preset) => {
                  const allow_ids = additional_permissions_for_form.map((p) => p.id);
                  const preset_ids = ResolvePresetPermissionIds(
                    permissions,
                    preset.permissions,
                    allow_ids
                  );
                  const active = IsPresetFullySelected(user_form.permission_ids, preset_ids);
                  const disabled = preset_ids.length === 0;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={disabled}
                      title={
                        disabled
                          ? 'Ya cubierto por el rol o sin permisos disponibles'
                          : `${preset.description} (${preset.permissions.join(', ')})`
                      }
                      onClick={() => ApplyUserPreset(preset.permissions)}
                      className={Cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                        disabled && 'opacity-40 cursor-not-allowed',
                        active
                          ? 'bg-primary-default text-white border-primary-default'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-primary-default hover:text-primary-default'
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <div className="max-h-32 overflow-y-auto rounded-xl border border-surface-border p-2 space-y-1">
                {additional_permissions_for_form.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay permisos extra disponibles fuera del rol.
                  </p>
                ) : (
                  additional_permissions_for_form.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-surface-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={user_form.permission_ids.includes(permission.id)}
                        onChange={() => ToggleUserPermission(permission.id)}
                      />
                      <span>
                        <span className="block text-sm font-medium text-blue-950">
                          {FormatPermissionLabel(permission.name)}
                        </span>
                        {permission.description && (
                          <span className="block text-xs text-slate-500">
                            {permission.description}
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => set_show_user_modal(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" disabled={is_saving} className="btn-primary">
              {is_saving ? 'Guardando...' : editing_user ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        is_open={show_role_modal}
        OnClose={() => {
          set_show_role_modal(false);
          set_editing_role(null);
          set_role_form(EMPTY_ROLE_FORM);
          set_error(null);
        }}
        title={editing_role ? 'Editar rol' : 'Nuevo rol'}
        size="md"
        hide_brand_bar
        respect_header
      >
        {error && show_role_modal && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={HandleSaveRole} className="space-y-3">
          <div>
            <label className="input-label normal-case">Nombre del rol *</label>
            <input
              required
              className="input-field font-mono text-sm"
              placeholder="TECHNICIAN"
              disabled={!!editing_role}
              value={role_form.name}
              onChange={(e) => set_role_form({ ...role_form, name: e.target.value.toUpperCase() })}
            />
            {editing_role && (
              <p className="text-xs text-slate-500 mt-1">
                El identificador del rol no se puede cambiar.
              </p>
            )}
          </div>
          <div>
            <label className="input-label normal-case">Descripción</label>
            <input
              className="input-field"
              value={role_form.description}
              onChange={(e) => set_role_form({ ...role_form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="input-label normal-case">Permisos asignados</label>
            <p className="text-xs text-slate-500 mb-2">
              Usa un paquete para marcar el conjunto recomendado; luego ajusta permisos sueltos si
              hace falta.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PERMISSION_PRESETS.map((preset) => {
                const preset_ids = ResolvePresetPermissionIds(permissions, preset.permissions);
                const active = IsPresetFullySelected(role_form.permission_ids, preset_ids);
                const disabled = preset_ids.length === 0;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={disabled}
                    title={`${preset.description} (${preset.permissions.join(', ')})`}
                    onClick={() => ApplyRolePreset(preset.permissions)}
                    className={Cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                      disabled && 'opacity-40 cursor-not-allowed',
                      active
                        ? 'bg-primary-default text-white border-primary-default'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-primary-default hover:text-primary-default'
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-surface-border p-2 space-y-1">
              {permissions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No hay permisos disponibles. Créalos en la pestaña Permisos.
                </p>
              ) : (
                permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-surface-muted/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={role_form.permission_ids.includes(permission.id)}
                      onChange={() => ToggleRolePermission(permission.id)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-blue-950">
                        {FormatPermissionLabel(permission.name)}
                      </span>
                      {permission.description && (
                        <span className="block text-xs text-slate-500">
                          {permission.description}
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => set_show_role_modal(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" disabled={is_saving} className="btn-primary">
              {is_saving ? 'Guardando...' : editing_role ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        is_open={show_delete_role_modal}
        OnClose={() => {
          set_show_delete_role_modal(false);
          set_role_to_delete(null);
          set_error(null);
        }}
        title="Eliminar rol"
        size="md"
        hide_brand_bar
      >
        {error && show_delete_role_modal && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Estás seguro de que deseas eliminar el rol{' '}
            <span className="font-semibold text-blue-950">
              {role_to_delete ? FormatRoleDisplayName(role_to_delete.name) : ''}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
          {role_to_delete && (role_to_delete._count?.users ?? 0) > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200">
              Este rol tiene {role_to_delete._count?.users} usuario(s) asignado(s). Debes
              reasignarlos antes de eliminarlo.
            </div>
          )}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                set_show_delete_role_modal(false);
                set_role_to_delete(null);
                set_error(null);
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={HandleConfirmDeleteRole}
              disabled={is_saving || (role_to_delete?._count?.users ?? 0) > 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {is_saving ? 'Eliminando...' : 'Eliminar rol'}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
