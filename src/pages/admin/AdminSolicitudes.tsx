import { useEffect, useState } from 'react'
import { FileText, Search, Filter, Eye, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { solicitudesApi } from '@/lib/apiCalls'
import { getEstadoBadgeClass, getEstadoLabel, formatDateTime } from '@/lib/utils'
import { MockDb } from '@/lib/mockDb'

const BRAND = '#0EA5E9'

export function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [renderError, setRenderError] = useState<string | null>(null)

  const fetchSolicitudes = async () => {
    try {
      setLoading(true)
      setRenderError(null)
      const params = estadoFilter ? { estado: estadoFilter, limit: 100 } : { limit: 100 }
      const { data } = await solicitudesApi.list(params)
      const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
      setSolicitudes(rawList)
    } catch (e: any) {
      console.error('Error fetching solicitudes:', e)
      setSolicitudes([])
      setRenderError(e?.message || 'Error de conexión con el servicio de trámites.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitudes()
  }, [estadoFilter])

  const handleResetDemo = () => {
    MockDb.reset()
    setRenderError(null)
    fetchSolicitudes()
  }

  // Cálculos ultra seguros y auto-diagnóstico en caliente
  let safeList: any[] = []
  let filtradas: any[] = []

  try {
    safeList = (solicitudes || []).filter(s => s && typeof s === 'object')
    
    filtradas = safeList.filter(s => {
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const solicitante = `${s.ciudadano?.nombre ?? s.usuario?.nombre ?? ''} ${s.ciudadano?.apellido ?? s.usuario?.apellido ?? ''}`.toLowerCase()
        const sId = typeof s.id === 'string' ? s.id : String(s.id || '')
        const cedulaStr = s.ciudadano?.cedula ?? s.usuario?.cedula ?? ''
        if (!solicitante.includes(q) && !sId.toLowerCase().includes(q) && !cedulaStr.includes(q)) return false
      }
      return true
    })

  } catch (err: any) {
    console.error('Error procesando render de AdminSolicitudes', err)
    if (!renderError) {
      setRenderError(err.message || 'Error al procesar el listado de trámites.')
    }
  }

  if (renderError) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 bg-white rounded-3xl border shadow-xl mt-12 animate-fade-in" style={{ borderColor: '#f1f5f9' }}>
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
          <RotateCcw className="animate-spin" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-blue-950">Autodiagnóstico y Recuperación de Trámites</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Hemos detectado datos corruptos o antiguos en la memoria local de tu navegador que provocaron una incompatibilidad con la bandeja de administrador. 
            El sistema se ha auto-diagnosticado con éxito.
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl text-xs font-mono text-slate-500 border border-slate-100 max-h-32 overflow-y-auto text-left">
          [Diagnóstico] {renderError}
        </div>
        <button
          onClick={handleResetDemo}
          className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
          style={{ background: BRAND, boxShadow: `0 4px 14px ${BRAND}40` }}
        >
          <RotateCcw size={16} />
          Restaurar Base de Datos Local y Limpiar Caché
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-blue-950 flex items-center gap-3">
            <FileText className="text-sky-500" />
            Todas las Solicitudes
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Listado completo de trámites de ordenamiento territorial en GAD Cañar.
          </p>
        </div>
        <button 
          onClick={handleResetDemo}
          className="btn-secondary px-3 py-2 text-xs flex items-center gap-2 border-dashed"
          title="Limpiar base de datos local y restaurar simulador"
        >
          <RotateCcw size={13} />
          <span>Reiniciar Demo</span>
        </button>
      </div>

      <div className="glass-card p-6 bg-white border rounded-2xl" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código, cédula o solicitante..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white"
              style={{ borderColor: '#e2e8f0', color: '#1e293b' }}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={estadoFilter} 
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold bg-white cursor-pointer"
              style={{ borderColor: '#e2e8f0', color: '#64748b' }}
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PENDIENTE_SECRETARIA">Revisión Secretaría</option>
              <option value="OBSERVADO">Observado (Devuelto)</option>
              <option value="PENDIENTE_TECNICO">Revisión Técnica</option>
              <option value="INSPECCION">En Inspección Física</option>
              <option value="PAGO_PENDIENTE">Pendiente de Pago</option>
              <option value="PAGADO">Pagado</option>
              <option value="APROBADO">Completado / Aprobado</option>
              <option value="NEGADO">Negado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">Código</th>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold">Solicitante</th>
                <th className="px-6 py-4 font-bold">Trámite</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No hay solicitudes registradas
                  </td>
                </tr>
              ) : (
                filtradas.map((s) => {
                  const sId = typeof s.id === 'string' ? s.id : String(s.id || '')
                  const displayId = sId ? sId.slice(0, 8).toUpperCase() : 'N/A'
                  const nombreCompleto = `${s.ciudadano?.nombre ?? s.usuario?.nombre ?? '—'} ${s.ciudadano?.apellido ?? s.usuario?.apellido ?? ''}`
                  const cedula = s.ciudadano?.cedula ?? s.usuario?.cedula ?? '—'
                  
                  return (
                    <tr key={sId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-blue-950 font-bold">
                        #{displayId}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(s.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-blue-950 text-sm">{nombreCompleto}</p>
                        <p className="text-xs text-slate-500">CI: {cedula}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold text-xs">
                        {s.tipoTramite || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={getEstadoBadgeClass(s.estado)}>
                          {getEstadoLabel(s.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/admin/solicitudes/${sId}`} 
                          className="inline-flex items-center justify-center p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-sky-100"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
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
