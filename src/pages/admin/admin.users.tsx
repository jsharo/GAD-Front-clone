import { useEffect, useMemo, useState, useCallback } from 'react';
import { Edit3, Plus, Shield, Users } from 'lucide-react';
import { users_api } from '@/lib/api.calls';
import { formatDateTime, cn } from '@/lib/utils';
import { mapUser, type User as AuthUser, type Role, ROLE_MAP_TO_BE } from '@/stores/auth.store';
import { BaseModal } from '@/components/logic/base.modal';
import { useToastStore } from '@/stores/toast.store';
import { PageHeader } from '@/components/ui/page.header';
import { AlertBanner } from '@/components/ui/alert.banner';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { SearchInput } from '@/components/ui/search.input';

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  national_id: '',
  phone: '',
  password: '',
  role: 'TECHNICIAN' as Role,
  is_active: true,
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
  SECRETARY: 'Secretaria',
  ARCHITECT: 'Arquitecto',
};

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'ADMIN', label: 'Administrador (control total)' },
  { value: 'SECRETARY', label: 'Secretaria (verificación documental)' },
  { value: 'TECHNICIAN', label: 'Técnico (revisión técnica)' },
  { value: 'ARCHITECT', label: 'Arquitecto' },
];

function roleBadge(role: Role) {
  return role === 'ADMIN'
    ? 'bg-red-100 text-red-700 border border-red-200'
    : role === 'TECHNICIAN'
      ? 'bg-blue-100 text-blue-700 border border-blue-200'
      : role === 'SECRETARY'
        ? 'bg-orange-100 text-orange-700 border border-orange-200'
        : role === 'ARCHITECT'
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-amber-100 text-amber-700 border border-amber-200';
}

export function AdminUsers() {
  const addToast = useToastStore((state) => state.addToast);
  const [users, set_users] = useState<AuthUser[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [role_filter, set_role_filter] = useState<string>('');
  const [search, set_search] = useState('');
  const [show_create_modal, set_show_create_modal] = useState(false);
  const [editing_user, set_editing_user] = useState<AuthUser | null>(null);
  const [form_data, set_form_data] = useState(EMPTY_FORM);
  const [is_saving, set_is_saving] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const backend_role = role_filter
        ? ROLE_MAP_TO_BE[role_filter as Role] || role_filter
        : undefined;
      const params = backend_role ? { role: backend_role, limit: 100 } : { limit: 100 };
      const { data } = await users_api.list(params);
      const mapped = (data.data ?? []).map((u: any) => mapUser(u)).filter(Boolean) as AuthUser[];
      set_users(mapped);
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
      (u) =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.national_id ?? '').includes(q) ||
        (u.phone ?? '').includes(q)
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

  const openEdit = (user: AuthUser) => {
    set_error(null);
    set_editing_user(user);
    set_form_data({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      national_id: user.national_id ?? '',
      phone: user.phone ?? '',
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
  };

  const closeModal = () => {
    set_show_create_modal(false);
    set_editing_user(null);
    resetForm();
  };

  const getPayload = () => ({
    nombre: form_data.first_name.trim(),
    apellido: form_data.last_name.trim(),
    email: form_data.email.trim(),
    cedula: form_data.national_id.trim() || undefined,
    telefono: form_data.phone.trim() || null,
    role: ROLE_MAP_TO_BE[form_data.role] || form_data.role,
    activo: form_data.is_active,
    ...(form_data.password ? { password: form_data.password } : {}),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    set_is_saving(true);
    set_error(null);
    try {
      if (editing_user) {
        const { data } = await users_api.update(editing_user.id, getPayload());
        const updated = mapUser(data);
        if (updated) {
          set_users((prev) => prev.map((u) => (u.id === editing_user.id ? updated : u)));
        }
      } else {
        if (!form_data.password) {
          set_error('La contraseña temporal es obligatoria');
          return;
        }
        await users_api.createStaff(getPayload());
        await fetchUsers();
      }
      closeModal();
      addToast({
        type: 'success',
        message: editing_user
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente',
      });
    } catch (e: any) {
      const message = e.response?.data?.message || 'Error al guardar usuario';
      set_error(message);
      addToast({ type: 'error', message });
    } finally {
      set_is_saving(false);
    }
  };

  const handleToggleActive = async (user: AuthUser) => {
    try {
      const { data } = await users_api.update(user.id, { activo: !user.is_active });
      const updated = mapUser(data);
      if (updated) {
        set_users((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      }
      addToast({
        type: 'success',
        message: user.is_active ? 'Usuario desactivado' : 'Usuario activado',
      });
    } catch (e: any) {
      const message = e.response?.data?.message || 'Error al cambiar estado';
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
            placeholder="Buscar por nombre, email, cédula o teléfono..."
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
                <th className="px-6 py-4 font-semibold">Cédula / Tel</th>
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
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
                          {u.first_name?.charAt(0) || '?'}
                          {u.last_name?.charAt(0) || ''}
                        </div>
                        <div>
                          <p className="font-semibold text-blue-950">
                            {u.first_name || 'Sin nombre'} {u.last_name}
                          </p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('badge', roleBadge(u.role))}>
                        {u.role === 'ADMIN' && <Shield size={12} />}
                        {ROLE_LABELS[u.role]}
                      </span>
                      {u.role === 'TECHNICIAN' && (
                        <p className="text-xs text-slate-500 mt-1">
                          Zona:{' '}
                          {u.zone === 'RURAL' ? 'Rural' : u.zone === 'URBAN' ? 'Urbano' : 'Todas'}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <p>{u.national_id || '—'}</p>
                      <p className="text-xs">{u.phone || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {formatDateTime(u.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          u.is_active ? 'bg-success' : 'bg-slate-300'
                        )}
                        title={u.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            u.is_active ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                      >
                        <Edit3 size={14} /> Editar
                      </button>
                    </td>
                  </tr>
                ))
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
                onChange={(e) => set_form_data({ ...form_data, role: e.target.value as Role })}
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
                value={form_data.is_active ? 'true' : 'false'}
                onChange={(e) =>
                  set_form_data({ ...form_data, is_active: e.target.value === 'true' })
                }
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {form_data.role === 'TECHNICIAN' && editing_user?.zone && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm">
              Zona actual: <strong>{editing_user.zone === 'RURAL' ? 'Rural' : 'Urbano'}</strong>. La
              asignación de zona la gestiona Secretaría.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Nombres *</label>
              <input
                required
                type="text"
                className="input-field"
                value={form_data.first_name}
                onChange={(e) => set_form_data({ ...form_data, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Apellidos *</label>
              <input
                required
                type="text"
                className="input-field"
                value={form_data.last_name}
                onChange={(e) => set_form_data({ ...form_data, last_name: e.target.value })}
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
                onChange={(e) => set_form_data({ ...form_data, email: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Cédula</label>
              <input
                type="text"
                className="input-field"
                maxLength={10}
                value={form_data.national_id}
                onChange={(e) => set_form_data({ ...form_data, national_id: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Teléfono</label>
              <input
                type="text"
                className="input-field"
                value={form_data.phone}
                onChange={(e) => set_form_data({ ...form_data, phone: e.target.value })}
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
