import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Search, Shield, Users, X } from 'lucide-react'
import { usersApi } from '@/lib/apiCalls'
import { formatDateTime, cn } from '@/lib/utils'

type Role = 'SUPERADMIN' | 'TECNICO' | 'SECRETARIA' | 'FINANCIERO' | 'CIUDADANO' | 'INVITADO'

interface AdminUser {
  id: string
  email: string
  nombre: string
  apellido: string
  cedula?: string | null
  telefono?: string | null
  role: Role
  zona?: 'URBANO' | 'RURAL' | null
  activo: boolean
  createdAt: string
}

const EMPTY_FORM = {
  nombre: '',
  apellido: '',
  email: '',
  cedula: '',
  telefono: '',
  password: '',
  role: 'TECNICO' as Role,
  activo: true,
}

const ROLE_LABELS: Record<Role, string> = {
  SUPERADMIN: 'SuperAdmin',
  TECNICO: 'Técnico',
  SECRETARIA: 'Secretaria',
  FINANCIERO: 'Financiero',
  CIUDADANO: 'Ciudadano',
  INVITADO: 'Invitado',
}

const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'SUPERADMIN', label: 'SuperAdmin (control total)' },
  { value: 'SECRETARIA', label: 'Secretaria (verificación documental)' },
  { value: 'TECNICO', label: 'Técnico (revisión técnica)' },
  { value: 'FINANCIERO', label: 'Financiero (cobros)' },
  { value: 'CIUDADANO', label: 'Ciudadano' },
  { value: 'INVITADO', label: 'Invitado' },
]

function roleBadge(role: Role) {
  return role === 'SUPERADMIN' ? 'bg-red-100 text-red-700 border border-red-200'
    : role === 'TECNICO' ? 'bg-blue-100 text-blue-700 border border-blue-200'
    : role === 'SECRETARIA' ? 'bg-orange-100 text-orange-700 border border-orange-200'
    : role === 'FINANCIERO' ? 'bg-violet-100 text-violet-700 border border-violet-200'
    : role === 'INVITADO' ? 'bg-slate-100 text-slate-700 border border-slate-200'
    : 'bg-amber-100 text-amber-700 border border-amber-200'
}

export function AdminUsuarios() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const params = roleFilter ? { role: roleFilter, limit: 100 } : { limit: 100 }
      const { data } = await usersApi.list(params)
      setUsers(data.data ?? [])
    } catch (e) {
      console.error('Error fetching users:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchUsers()
  }, [roleFilter])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.cedula ?? '').includes(q) ||
      (u.telefono ?? '').includes(q),
    )
  }, [search, users])

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setError(null)
  }

  const openCreate = () => {
    resetForm()
    setEditingUser(null)
    setShowCreateModal(true)
  }

  const openEdit = (user: AdminUser) => {
    setError(null)
    setEditingUser(user)
    setFormData({
      nombre: user.nombre ?? '',
      apellido: user.apellido ?? '',
      email: user.email ?? '',
      cedula: user.cedula ?? '',
      telefono: user.telefono ?? '',
      password: '',
      role: user.role,
      activo: user.activo,
    })
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setEditingUser(null)
    resetForm()
  }

  const payload = () => ({
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    email: formData.email.trim(),
    cedula: formData.cedula.trim() || undefined,
    telefono: formData.telefono.trim() || null,
    role: formData.role,
    activo: formData.activo,
    ...(formData.password ? { password: formData.password } : {}),
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editingUser) {
        const { data } = await usersApi.update(editingUser.id, payload())
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u)))
      } else {
        if (!formData.password) {
          setError('La contraseña temporal es obligatoria')
          return
        }
        await usersApi.createInstitucional(payload())
        await fetchUsers()
      }
      closeModal()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActivo = async (user: AdminUser) => {
    try {
      const { data } = await usersApi.update(user.id, { activo: !user.activo })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...data } : u)))
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const modalOpen = showCreateModal || editingUser

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="font-heading text-2xl font-bold text-blue-950 flex items-center gap-3">
          <Users className="text-primary-600" />
          Gestión de Usuarios y Permisos
        </h1>

        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      {error && !modalOpen && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, email, cédula o teléfono..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field md:max-w-xs"
          >
            <option value="">Todos los roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                          {(u.nombre?.charAt(0) || '?')}{(u.apellido?.charAt(0) || '')}
                        </div>
                        <div>
                          <p className="font-semibold text-blue-950">{u.nombre || 'Sin nombre'} {u.apellido}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('badge', roleBadge(u.role))}>
                        {u.role === 'SUPERADMIN' && <Shield size={12} />}
                        {ROLE_LABELS[u.role]}
                      </span>
                      {u.role === 'TECNICO' && (
                        <p className="text-xs text-slate-500 mt-1">Zona: {u.zona || 'Todas'}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <p>{u.cedula || '—'}</p>
                      <p className="text-xs">{u.telefono || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActivo(u)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          u.activo ? 'bg-success-500' : 'bg-slate-300',
                        )}
                        title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          u.activo ? 'translate-x-6' : 'translate-x-1',
                        )} />
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl p-6 relative animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-blue-950"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold font-heading text-blue-950 mb-1">
              {editingUser ? 'Editar usuario y permisos' : 'Registrar usuario'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
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
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Estado de cuenta</label>
                  <select
                    className="input-field"
                    value={formData.activo ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'true' })}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              {formData.role === 'TECNICO' && editingUser?.zona && (
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  Zona actual: <strong>{editingUser.zona}</strong>. La asignación de zona la gestiona Secretaría.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Nombres *</label>
                  <input
                    required
                    type="text"
                    className="input-field"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Apellidos *</label>
                  <input
                    required
                    type="text"
                    className="input-field"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">Cédula</label>
                  <input
                    type="text"
                    className="input-field"
                    maxLength={10}
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Teléfono</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label className="input-label">
                    {editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña temporal *'}
                  </label>
                  <input
                    required={!editingUser}
                    type="password"
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Guardando...' : editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
