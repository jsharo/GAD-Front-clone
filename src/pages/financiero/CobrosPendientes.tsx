import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Eye, Filter, RefreshCw, Clock, CheckCircle2, Receipt, RotateCcw } from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'
import { MockDb } from '@/lib/mockDb'

const BRAND = '#7C3AED'

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

type Filtro = 'TODOS' | 'PAGO_PENDIENTE' | 'PAGADO'

export function CobrosPendientes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [renderError, setRenderError] = useState<string | null>(null)

  const cargar = async () => {
    setLoading(true)
    setRenderError(null)
    try {
      const { data } = await solicitudesApi.list({ limit: 100 })
      const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
      setSolicitudes(rawList)
    } catch (e: any) {
      console.error('Error cargando cobros', e)
      setSolicitudes([])
      setRenderError(e?.message || 'Error de conexión o datos corruptos localmente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleResetDemo = () => {
    MockDb.reset()
    setRenderError(null)
    cargar()
  }

  // Cálculos ultra seguros y auto-diagnóstico en caliente
  let safeList: any[] = []
  let filtradas: any[] = []
  let pendientesCount = 0
  let pagadosCount = 0
  let totalRecaudado = 0

  try {
    safeList = (solicitudes || []).filter(s => s && typeof s === 'object')
    
    filtradas = safeList.filter(s => {
      const estado = s.estado || ''
      if (filtro === 'PAGO_PENDIENTE' && estado !== 'PAGO_PENDIENTE') return false
      if (filtro === 'PAGADO' && !['PAGADO', 'APROBADO'].includes(estado)) return false
      if (filtro === 'TODOS' && !['PAGO_PENDIENTE', 'PAGADO', 'APROBADO'].includes(estado)) return false
      
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const nombre = `${s.ciudadano?.nombre ?? ''} ${s.ciudadano?.apellido ?? ''}`.toLowerCase()
        const sId = typeof s.id === 'string' ? s.id : String(s.id || '')
        const cedulaStr = s.ciudadano?.cedula || ''
        if (!nombre.includes(q) && !sId.toLowerCase().includes(q) && !cedulaStr.includes(q)) return false
      }
      return true
    })

    const pendientes = safeList.filter(s => s.estado === 'PAGO_PENDIENTE')
    const pagados = safeList.filter(s => ['PAGADO', 'APROBADO'].includes(s.estado))
    
    pendientesCount = pendientes.length
    pagadosCount = pagados.length

    // El monto del trámite se almacena en resolucion.montoPago en nuestra base de datos simulada
    totalRecaudado = pagados.reduce((sum, s) => {
      const monto = s.resolucion?.montoPago ?? s.cobros?.[0]?.monto ?? 125.00
      return sum + Number(monto)
    }, 0)

  } catch (err: any) {
    console.error('Error procesando datos en render financiero', err)
    if (!renderError) {
      setRenderError(err.message || 'Error al procesar los datos de trámites financieros.')
    }
  }

  if (renderError) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 bg-white rounded-3xl border shadow-xl mt-12 animate-fade-in" style={{ borderColor: '#f1f5f9' }}>
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
          <RotateCcw className="animate-spin" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-blue-950">Autodiagnóstico y Recuperación Financiera</h2>
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
          style={{ background: BRAND, boxShadow: `0 4px 14px ${BRAND}40` }}
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
          <h1 className="text-2xl font-extrabold text-blue-950">Gestión de Cobros</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Registro y seguimiento de pagos de trámites aprobados
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pend. de cobro', count: pendientesCount, color: BRAND, icon: <Clock size={16} />, suffix: '' },
          { label: 'Pagados', count: pagadosCount, color: '#16A34A', icon: <CheckCircle2 size={16} />, suffix: '' },
          { label: 'Total recaudado', count: totalRecaudado, color: '#D97706', icon: <DollarSign size={16} />, suffix: '$', isAmount: true },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5 flex items-center gap-4 bg-white rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
            <div className="p-3 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}12`, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-black text-blue-950 font-mono">
                {stat.isAmount ? `$${stat.count.toFixed(2)}` : stat.count}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ciudadano, cédula o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white"
            style={{ borderColor: '#e2e8f0', color: '#1e293b' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: '#64748b' }} />
          {(['TODOS', 'PAGO_PENDIENTE', 'PAGADO'] as Filtro[]).map((f) => (
            <button key={f}
              onClick={() => setFiltro(f)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border"
              style={{
                background: filtro === f ? `${BRAND}18` : 'white',
                borderColor: filtro === f ? `${BRAND}40` : '#e2e8f0',
                color: filtro === f ? BRAND : '#64748b',
              }}>
              {f === 'TODOS' ? 'Todos' : f === 'PAGO_PENDIENTE' ? '⏳ Pendientes' : '✅ Pagados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: '#e2e8f0' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Expediente', 'Ciudadano', 'Tipo de Trámite', 'Monto', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando cobros...</p>
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Receipt size={40} className="mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400">No hay cobros que coincidan</p>
                  </td>
                </tr>
              ) : (
                filtradas.map((sol) => {
                  const safeId = typeof sol.id === 'string' ? sol.id : String(sol.id || '')
                  const displayId = safeId ? safeId.slice(0, 8).toUpperCase() : 'N/A'
                  const fechaCreacion = sol.createdAt ? new Date(sol.createdAt).toLocaleDateString('es-EC') : '—'
                  const tipoTramite = sol.tipoTramite || 'PERMISO_CONSTRUCCION'
                  const monto = sol.resolucion?.montoPago ?? sol.cobros?.[0]?.monto ?? 125.00
                  const pagado = ['PAGADO', 'APROBADO'].includes(sol.estado)
                  
                  return (
                    <tr key={safeId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-blue-950 text-sm font-mono">#{displayId}</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {fechaCreacion}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-blue-950 text-sm">
                          {sol.ciudadano?.nombre || '—'} {sol.ciudadano?.apellido || ''}
                        </p>
                        <p className="text-slate-400 text-xs">CI: {sol.ciudadano?.cedula || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: `${TIPO_COLOR[tipoTramite] ?? '#64748b'}15`,
                            color: TIPO_COLOR[tipoTramite] ?? '#64748b',
                          }}>
                          {TIPO_LABEL[tipoTramite] ?? tipoTramite}
                        </span>
                        <p className="text-slate-400 text-xs mt-1">{sol.predio?.direccion ?? '—'}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-purple-700">
                        ${Number(monto).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: pagado ? 'rgba(22,163,74,0.1)' : 'rgba(124,58,237,0.1)',
                            color: pagado ? '#16A34A' : '#7C3AED',
                            border: `1px solid ${pagado ? 'rgba(22,163,74,0.3)' : 'rgba(124,58,237,0.3)'}`,
                          }}>
                          {pagado ? '✅ Pagado' : '⏳ Pend. pago'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/financiero/cobros/${safeId}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={{ background: `${BRAND}10`, color: BRAND, border: `1px solid ${BRAND}25` }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${BRAND}18`}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${BRAND}10`}>
                          <Eye size={14} /> {pagado ? 'Ver Recibo' : 'Registrar Pago'}
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
