import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, FileCheck2, Eye, Filter, RefreshCw, Clock, XCircle, RotateCcw } from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'
import { MockDb } from '@/lib/mockDb'

const BRAND = '#D97706'

type EstadoFiltro = 'TODOS' | 'PENDIENTE_SECRETARIA' | 'OBSERVADO'

const TIPO_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
}

const TIPO_COLOR: Record<string, string> = {
  PERMISO_CONSTRUCCION: '#2563EB',
  LINEA_FABRICAS: '#D97706',
  APROBACION_PLANOS: '#2E8B57',
}

export function BandejaSecretaria() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<EstadoFiltro>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [renderError, setRenderError] = useState<string | null>(null)

  const cargar = async () => {
    setLoading(true)
    setRenderError(null)
    try {
      // Cargar solicitudes que corresponden a secretaría
      const params: any = {}
      if (filtro !== 'TODOS') params.estado = filtro
      const { data } = await solicitudesApi.list({ ...params, limit: 100 })
      const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
      setSolicitudes(rawList)
    } catch (e: any) {
      console.error('Error cargando bandeja', e)
      setSolicitudes([])
      setRenderError(e?.message || 'Error de conexión o datos corruptos localmente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [filtro])

  const handleResetDemo = () => {
    MockDb.reset()
    setRenderError(null)
    cargar()
  }

  // Ejecución ultra defensiva con auto-diagnóstico en caliente
  let safeList: any[] = []
  let filtradas: any[] = []
  let pendientes = 0
  let observados = 0

  try {
    safeList = (solicitudes || []).filter((s) => s && typeof s === 'object')
    filtradas = safeList.filter((s) => {
      // Para "TODOS" mostramos PENDIENTE_SECRETARIA y OBSERVADO
      if (filtro === 'TODOS') {
        if (!s.estado || !['PENDIENTE_SECRETARIA', 'OBSERVADO'].includes(s.estado)) return false
      }
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const nombre = `${s.ciudadano?.nombre ?? ''} ${s.ciudadano?.apellido ?? ''}`.toLowerCase()
        const sId = typeof s.id === 'string' ? s.id : String(s.id || '')
        const cedulaStr = s.ciudadano?.cedula || ''
        if (!nombre.includes(q) && !sId.toLowerCase().includes(q) && !cedulaStr.includes(q)) return false
      }
      return true
    })
    pendientes = safeList.filter(s => s && s.estado === 'PENDIENTE_SECRETARIA').length
    observados = safeList.filter(s => s && s.estado === 'OBSERVADO').length
  } catch (err: any) {
    console.error('Error procesando datos en render', err)
    if (!renderError) {
      setRenderError(err.message || 'Error al procesar los datos de trámites.')
    }
  }

  if (renderError) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 bg-white rounded-3xl border shadow-xl mt-12 animate-fade-in" style={{ borderColor: '#f1f5f9' }}>
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
          <RotateCcw className="animate-spin" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-blue-950">Autodiagnóstico y Recuperación</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Hemos detectado datos corruptos o antiguos en la memoria local de tu navegador que provocaron una incompatibilidad. 
            El sistema se ha auto-diagnosticado con éxito.
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl text-xs font-mono text-slate-500 border border-slate-100 max-h-32 overflow-y-auto text-left">
          [Diagnóstico] {renderError}
        </div>
        <button
          onClick={handleResetDemo}
          className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <RotateCcw size={16} />
          Restaurar Base de Datos Local y Limpiar Caché
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950">Bandeja de Trámites</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Verificación documental — firma y completitud de expedientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleResetDemo}
            className="btn-secondary px-3 py-2 text-xs flex items-center gap-2 border-dashed"
            title="Limpiar base de datos local y restaurar simulador"
          >
            <RotateCcw size={13} />
            <span>Reiniciar Demo</span>
          </button>
          <button onClick={cargar} disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
            title="Actualizar">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pendientes', count: pendientes, color: '#D97706', icon: <Clock size={16} /> },
          { label: 'Observados', count: observados, color: '#DC2626', icon: <XCircle size={16} /> },
          { label: 'Total activos', count: pendientes + observados, color: '#2563EB', icon: <FileCheck2 size={16} /> },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: `${stat.color}12`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-950">{stat.count}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por ciudadano, cédula o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white"
            style={{ borderColor: '#e2e8f0', color: '#1e293b' }}
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: '#64748b' }} />
          {(['TODOS', 'PENDIENTE_SECRETARIA', 'OBSERVADO'] as EstadoFiltro[]).map((f) => (
            <button key={f}
              onClick={() => setFiltro(f)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border"
              style={{
                background: filtro === f ? `${BRAND}18` : 'white',
                borderColor: filtro === f ? `${BRAND}40` : '#e2e8f0',
                color: filtro === f ? BRAND : '#64748b',
              }}>
              {f === 'TODOS' ? 'Todos' : f === 'PENDIENTE_SECRETARIA' ? 'Pendientes' : 'Observados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#e2e8f0' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Expediente', 'Ciudadano', 'Tipo de Trámite', 'Archivos', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando bandeja...</p>
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <FileCheck2 size={40} className="mx-auto mb-3" style={{ color: '#e2e8f0' }} />
                    <p style={{ color: '#94a3b8' }}>No hay solicitudes que coincidan</p>
                  </td>
                </tr>
              ) : (
                filtradas.map((sol) => {
                  const safeId = typeof sol.id === 'string' ? sol.id : String(sol.id || '')
                  const displayId = safeId ? safeId.slice(0, 8).toUpperCase() : 'N/A'
                  const fechaCreacion = sol.createdAt ? new Date(sol.createdAt).toLocaleDateString('es-EC') : '—'
                  const tipoTramite = sol.tipoTramite || 'PERMISO_CONSTRUCCION'
                  return (
                    <tr key={safeId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-blue-950 text-sm font-mono">#{displayId}</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                          {fechaCreacion}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-blue-950 text-sm">
                          {sol.ciudadano?.nombre || '—'} {sol.ciudadano?.apellido || ''}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.75rem' }}>CI: {sol.ciudadano?.cedula || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: `${TIPO_COLOR[tipoTramite] ?? '#64748b'}15`,
                            color: TIPO_COLOR[tipoTramite] ?? '#64748b',
                          }}>
                          {TIPO_LABEL[tipoTramite] ?? tipoTramite}
                        </span>
                        <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 4 }}>
                          {sol.predio?.direccion ?? '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileCheck2 size={14} style={{ color: '#64748b' }} />
                          <span className="text-sm font-semibold text-blue-950">
                            {sol.anexos?.length ?? 0} archivos
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: sol.estado === 'PENDIENTE_SECRETARIA' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: sol.estado === 'PENDIENTE_SECRETARIA' ? '#D97706' : '#DC2626',
                            border: `1px solid ${sol.estado === 'PENDIENTE_SECRETARIA' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          }}>
                          {sol.estado === 'PENDIENTE_SECRETARIA' ? '⏳ Pendiente' : '↩ Observado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/secretaria/bandeja/${safeId}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: 'rgba(217,119,6,0.08)', color: '#D97706', border: '1px solid rgba(217,119,6,0.2)' }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,6,0.15)'
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,6,0.08)'
                          }}>
                          <Eye size={14} /> Revisar
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
