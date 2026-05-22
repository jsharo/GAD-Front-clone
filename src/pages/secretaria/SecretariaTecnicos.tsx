import { useEffect, useMemo, useState } from 'react'
import { MapPin, Save, Search, Users } from 'lucide-react'
import { usersApi } from '@/lib/apiCalls'

interface Tecnico {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  zona?: 'URBANO' | 'RURAL' | null
  activo: boolean
}

export function SecretariaTecnicos() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])
  const [zonas, setZonas] = useState<Record<string, '' | 'URBANO' | 'RURAL'>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await usersApi.tecnicos()
      const rawList = Array.isArray(data) ? data : (data?.data || [])
      const list = rawList.filter((t: any) => t && typeof t === 'object')
      setTecnicos(list)
      setZonas(Object.fromEntries(list.map((t: Tecnico) => [t.id || '', t.zona ?? ''])))
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudieron cargar los técnicos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    const safeList = (tecnicos || []).filter((t) => t && typeof t === 'object')
    if (!q) return safeList
    return safeList.filter((t) =>
      `${t.nombre || ''} ${t.apellido || ''}`.toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.telefono ?? '').includes(q),
    )
  }, [search, tecnicos])

  const guardarZona = async (tecnico: Tecnico) => {
    setSavingId(tecnico.id)
    setError(null)
    try {
      const zona = zonas[tecnico.id] || null
      const { data } = await usersApi.updateZonaTecnico(tecnico.id, zona)
      setTecnicos((prev) => prev.map((t) => (t.id === tecnico.id ? { ...t, ...data } : t)))
      setZonas((prev) => ({ ...prev, [tecnico.id]: data.zona ?? '' }))
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo guardar la zona')
    } finally {
      setSavingId(null)
    }
  }

  const safeTecnicos = (tecnicos || []).filter((t) => t && typeof t === 'object')

  const counts = {
    todos: safeTecnicos.length,
    urbano: safeTecnicos.filter((t) => t.zona === 'URBANO').length,
    rural: safeTecnicos.filter((t) => t.zona === 'RURAL').length,
    sinZona: safeTecnicos.filter((t) => !t.zona).length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950">Asignación de Técnicos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Secretaría define qué zona atiende cada técnico.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Técnicos', value: counts.todos, color: '#2563EB' },
          { label: 'Urbano', value: counts.urbano, color: '#1D4ED8' },
          { label: 'Rural', value: counts.rural, color: '#2E8B57' },
          { label: 'Sin zona', value: counts.sinZona, color: '#D97706' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-5 border bg-white" style={{ borderColor: '#e2e8f0' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${stat.color}12`, color: stat.color }}>
              <Users size={18} />
            </div>
            <p className="text-3xl font-black text-blue-950">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: '#e2e8f0' }}>
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Buscar técnico por nombre, correo o teléfono..."
          />
        </div>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#e2e8f0' }}>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b" style={{ borderColor: '#e2e8f0' }}>
              <tr>
                <th className="px-6 py-4 font-semibold">Técnico</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Zona asignada</th>
                <th className="px-6 py-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Cargando técnicos...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron técnicos
                  </td>
                </tr>
              ) : (
                filtrados.map((tecnico) => (
                  <tr key={tecnico.id} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: '#f1f5f9' }}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-blue-950">{tecnico.nombre} {tecnico.apellido}</p>
                      <p className="text-xs text-slate-500">{tecnico.email}</p>
                      <p className="text-xs text-slate-400">{tecnico.telefono || 'Sin teléfono'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${tecnico.activo ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {tecnico.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        <select
                          className="input-field min-w-40"
                          value={zonas[tecnico.id] ?? ''}
                          onChange={(e) => setZonas((prev) => ({
                            ...prev,
                            [tecnico.id]: e.target.value as '' | 'URBANO' | 'RURAL',
                          }))}
                        >
                          <option value="">Todas las zonas</option>
                          <option value="URBANO">Urbano</option>
                          <option value="RURAL">Rural</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => guardarZona(tecnico)}
                        disabled={savingId === tecnico.id || (zonas[tecnico.id] ?? '') === (tecnico.zona ?? '')}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={14} />
                        {savingId === tecnico.id ? 'Guardando...' : 'Guardar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
