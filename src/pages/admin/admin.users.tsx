import { useEffect, useMemo, useState, useCallback } from 'react';
import { Edit3, Plus, Shield, Users } from 'lucide-react';
import api from '@/lib/api';
import { formatDateTime, cn } from '@/lib/utils';
import { BaseModal } from '@/components/logic/base.modal';
import { useToastStore } from '@/stores/toast.store';
import { PageHeader } from '@/components/ui/page.header';
import { AlertBanner } from '@/components/ui/alert.banner';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { SearchInput } from '@/components/ui/search.input';

type UserRole = 'ADMINISTRATOR' | 'SECRETARY' | 'TECHNICIAN' | 'FINANCIAL' | 'USER' | 'CITIZEN';

type UserStatus = 'ACTIVE' | 'INACTIVE';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  lastname: string | null;
  cedula: string | null;
  direction: string | null;
  status: UserStatus;
  role: UserRole | null;
  createdAt: string;
  updatedAt: string;
}

interface UserFormState {
  name: string;
  lastname: string;
  email: string;
  cedula: string;
  direction: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

const EMPTY_FORM: UserFormState = {
  name: '',
  lastname: '',
  email: '',
  cedula: '',
  direction: '',
  password: '',
  role: 'TECHNICIAN',
  status: 'ACTIVE',
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRATOR: 'Administrador',
  TECHNICIAN: 'Técnico',
  SECRETARY: 'Secretaria',
  FINANCIAL: 'Financiero',
  USER: 'Profesional',
  CITIZEN: 'Ciudadano',
};

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'ADMINISTRATOR', label: 'Administrador (control total)' },
  { value: 'SECRETARY', label: 'Secretaria (verificación documental)' },
  { value: 'TECHNICIAN', label: 'Técnico (revisión técnica)' },
  { value: 'FINANCIAL', label: 'Financiero' },
  { value: 'USER', label: 'Profesional' },
  { value: 'CITIZEN', label: 'Ciudadano' },
];

function normalizeRole(role: unknown): UserRole {
  if (typeof role === 'string' && role in ROLE_LABELS) {
    return role as UserRole;
  }
  return 'USER';
}

function mapAdminUser(raw: AdminUser): AdminUser {
  return {
    ...raw,
    role: normalizeRole(raw.role),
    status: raw.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
  };
}

async function listUsers(params?: { role?: string; limit?: number }): Promise<AdminUser[]> {
  const response = await api.get<{ success: boolean; data: AdminUser[] }>('/users', { params });
  return (response.data.data ?? []).map(mapAdminUser);
}

async function createInstitutionalUser(payload: {
  email: string;
  password: string;
  name: string;
  lastname: string;
  roleName: UserRole;
  cedula?: string;
  direction?: string;
}) {
  await api.post('/users/institutional', payload);
}

async function updateUserProfile(
  id: string,
  payload: {
    name: string;
    lastname: string;
    cedula?: string;
    direction?: string;
    password?: string;
  }
): Promise<AdminUser> {
  const response = await api.patch<{ success: boolean; data: AdminUser }>(`/users/${id}`, payload);
  return mapAdminUser(response.data.data);
}

async function updateUserStatus(id: string, status: UserStatus): Promise<AdminUser> {
  const response = await api.patch<{ success: boolean; data: AdminUser }>(`/users/${id}/status`, {
    status,
  });
  return mapAdminUser(response.data.data);
}

async function assignUserRole(userId: string, roleName: UserRole) {
  await api.post('/roles/assign', { userId, roleName });
}

function roleBadge(role: UserRole) {
  return role === 'ADMINISTRATOR'
    ? 'bg-red-100 text-red-700 border border-red-200'
    : role === 'TECHNICIAN'
      ? 'bg-blue-100 text-blue-700 border border-blue-200'
      : role === 'SECRETARY'
        ? 'bg-orange-100 text-orange-700 border border-orange-200'
        : role === 'USER'
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-amber-100 text-amber-700 border border-amber-200';
}

export function AdminUsers() {
  const addToast = useToastStore((state) => state.addToast);
  const [users, set_users] = useState<AdminUser[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [role_filter, set_role_filter] = useState<string>('');
  const [search, set_search] = useState('');
  const [show_create_modal, set_show_create_modal] = useState(false);
  const [editing_user, set_editing_user] = useState<AdminUser | null>(null);
  const [form_data, set_form_data] = useState<UserFormState>(EMPTY_FORM);
  const [is_saving, set_is_saving] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params: { role?: string; limit: number } = { limit: 100 };
      if (role_filter) {
        params.role = role_filter;
      }
      set_users(await listUsers(params));
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      set_is_loading(false);
    }
  }, [role_filter]);

  useEffect(() => {
    set_is_loading(true);
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        `${user.name ?? ''} ${user.lastname ?? ''}`.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.cedula ?? '').includes(q) ||
        (user.direction ?? '').toLowerCase().includes(q)
    );
  }, [search, users]);

  const resetForm = () => {
    set_form_data(EMPTY_FORM);
    set_error(null);
  };

  const openCreate = () => {
    resetForm();
    set_editing_user(null);
    set_show_create_modal(true);
  };

  const openEdit = (user: AdminUser) => {
    set_error(null);
    set_editing_user(user);
    set_form_data({
      name: user.name ?? '',
      lastname: user.lastname ?? '',
      email: user.email ?? '',
      cedula: user.cedula ?? '',
      direction: user.direction ?? '',
      password: '',
      role: normalizeRole(user.role),
      status: user.status,
    });
  };

  const closeModal = () => {
    set_show_create_modal(false);
    set_editing_user(null);
    resetForm();
  };

  const buildProfilePayload = () => ({
    name: form_data.name.trim(),
    lastname: form_data.lastname.trim(),
    cedula: form_data.cedula.trim() || undefined,
    direction: form_data.direction.trim() || undefined,
    ...(form_data.password ? { password: form_data.password } : {}),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    set_is_saving(true);
    set_error(null);
    try {
      if (editing_user) {
        await updateUserProfile(editing_user.id, buildProfilePayload());

        if (form_data.status !== editing_user.status) {
          await updateUserStatus(editing_user.id, form_data.status);
        }

        if (form_data.role !== normalizeRole(editing_user.role)) {
          await assignUserRole(editing_user.id, form_data.role);
        }

        await fetchUsers();
      } else {
        if (!form_data.password) {
          set_error('La contraseña temporal es obligatoria');
          return;
        }
        await createInstitutionalUser({
          email: form_data.email.trim(),
          password: form_data.password,
          name: form_data.name.trim(),
          lastname: form_data.lastname.trim(),
          roleName: form_data.role,
          cedula: form_data.cedula.trim() || undefined,
          direction: form_data.direction.trim() || undefined,
        });
        await fetchUsers();
      }
      closeModal();
      addToast({
        type: 'success',
        message: editing_user
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente',
      });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string | string[] } } };
      const rawMessage = axiosError.response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : rawMessage || 'Error al guardar usuario';
      set_error(message);
      addToast({ type: 'error', message });
    } finally {
      set_is_saving(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await updateUserStatus(user.id, nextStatus);
      set_users((prev) => prev.map((entry) => (entry.id === user.id ? updated : entry)));
      addToast({
        type: 'success',
        message: user.status === 'ACTIVE' ? 'Usuario desactivado' : 'Usuario activado',
      });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'Error al cambiar estado';
      set_error(message);
      addToast({ type: 'error', message });
    }
  };

  const is_modal_open = show_create_modal || !!editing_user;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Gestión de Usuarios y Permisos"
        icon={Users}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> Nuevo Usuario
          </button>
        }
      />

      {error && !is_modal_open && <AlertBanner message={error} onDismiss={() => set_error(null)} />}

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <SearchInput
            containerClassName="flex-1"
            placeholder="Buscar por nombre, email, cédula o contacto..."
            value={search}
            onChange={(e) => set_search(e.target.value)}
          />
          <select
            value={role_filter}
            onChange={(e) => set_role_filter(e.target.value)}
            className="input-field md:max-w-xs"
          >
            <option value="">Todos los roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-surface-muted border-b border-surface-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Rol / Permisos</th>
                <th className="px-6 py-4 font-semibold">Cédula / Contacto</th>
                <th className="px-6 py-4 font-semibold">Registro</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <LoadingSkeleton count={3} variant="row" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Users}
                      title="No se encontraron usuarios"
                      description="Prueba con otro término de búsqueda."
                      className="py-8"
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const role = normalizeRole(user.role);
                  const isActive = user.status === 'ACTIVE';

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
                      <td className="px-6 py-4">
                        <span className={cn('badge', roleBadge(role))}>
                          {role === 'ADMINISTRATOR' && <Shield size={12} />}
                          {ROLE_LABELS[role]}
                        </span>
                        {role === 'TECHNICIAN' && (
                          <p className="text-xs text-slate-500 mt-1">
                            Zona asignada por Secretaría
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p>{user.cedula || '—'}</p>
                        <p className="text-xs">{user.direction || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            isActive ? 'bg-success' : 'bg-slate-300'
                          )}
                          title={isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          <span
                            className={cn(
                              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                              isActive ? 'translate-x-6' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEdit(user)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                        >
                          <Edit3 size={14} /> Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BaseModal
        isOpen={is_modal_open}
        onClose={closeModal}
        title={editing_user ? 'Editar usuario y permisos' : 'Registrar usuario'}
        size="lg"
      >
        <p className="text-sm text-slate-500 mb-6 -mt-2">
          El rol define a qué portal y operaciones tendrá acceso la cuenta.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Rol / Permiso principal *</label>
              <select
                required
                className="input-field"
                value={form_data.role}
                onChange={(e) => set_form_data({ ...form_data, role: e.target.value as UserRole })}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Estado de cuenta</label>
              <select
                className="input-field"
                value={form_data.status}
                onChange={(e) =>
                  set_form_data({ ...form_data, status: e.target.value as UserStatus })
                }
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>

          {form_data.role === 'TECHNICIAN' && editing_user && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm">
              La asignación de zona del técnico la gestiona Secretaría.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Nombres *</label>
              <input
                required
                type="text"
                className="input-field"
                value={form_data.name}
                onChange={(e) => set_form_data({ ...form_data, name: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Apellidos *</label>
              <input
                required
                type="text"
                className="input-field"
                value={form_data.lastname}
                onChange={(e) => set_form_data({ ...form_data, lastname: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Correo electrónico *</label>
              <input
                required
                type="email"
                className="input-field"
                value={form_data.email}
                disabled={!!editing_user}
                onChange={(e) => set_form_data({ ...form_data, email: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Cédula</label>
              <input
                type="text"
                className="input-field"
                maxLength={10}
                value={form_data.cedula}
                onChange={(e) => set_form_data({ ...form_data, cedula: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Dirección / contacto</label>
              <input
                type="text"
                className="input-field"
                value={form_data.direction}
                onChange={(e) => set_form_data({ ...form_data, direction: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">
                {editing_user ? 'Nueva contraseña (opcional)' : 'Contraseña temporal *'}
              </label>
              <input
                required={!editing_user}
                type="password"
                className="input-field"
                value={form_data.password}
                onChange={(e) => set_form_data({ ...form_data, password: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={is_saving} className="btn-primary">
              {is_saving ? 'Guardando...' : editing_user ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
}
