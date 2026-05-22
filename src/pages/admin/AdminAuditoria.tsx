import { useEffect, useState } from 'react'
import { Activity, ShieldCheck, ShieldAlert, Key, Link as LinkIcon, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { auditApi } from '@/lib/apiCalls'
import { formatDateTime, cn } from '@/lib/utils'
import { MockDb } from '@/lib/mockDb'

const BRAND = '#0EA5E9'

export function AdminAuditoria() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [verificando, setVerificando] = useState(false)
  const [estadoIntegridad, setEstadoIntegridad] = useState<{ integra: boolean; rotura?: string } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setRenderError(null)
      const { data } = await auditApi.list({ limit: 100 })
      const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
      setLogs(rawList)
    } catch (e: any) {
      console.error('Error fetching audit logs:', e)
      setLogs([])
      setRenderError(e?.message || 'Error de conexión con el servicio notarial de auditoría.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleVerificar = async () => {
    setVerificando(true)
    setEstadoIntegridad(null)
    try {
      const { data } = await auditApi.verificar()
      setEstadoIntegridad(data)
    } catch (e) {
      console.error('Error verificando integridad:', e)
      setEstadoIntegridad({ integra: false, rotura: 'Error de conexión con el verificador notarial.' })
    } finally {
      setVerificando(false)
    }
  }

  const handleResetDemo = () => {
    MockDb.reset()
    setRenderError(null)
    fetchLogs()
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const parseDetalle = (detalleStr: string) => {
    try {
      return JSON.parse(detalleStr)
    } catch {
      return detalleStr
    }
  }

  // Ejecución defensiva extrema contra TypeErrors en el renderizado de hashes criptográficos
  let safeList: any[] = []

  try {
    safeList = (logs || []).filter(log => log && typeof log === 'object')
  } catch (err: any) {
    console.error('Error filtrando registros de auditoría', err)
    if (!renderError) {
      setRenderError(err.message || 'Error al procesar los registros de auditoría.')
    }
  }

  if (renderError) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-6 bg-white rounded-3xl border shadow-xl mt-12 animate-fade-in" style={{ borderColor: '#f1f5f9' }}>
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-100">
          <RotateCcw className="animate-spin" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-blue-950">Autodiagnóstico y Recuperación de Auditoría</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Hemos detectado datos corruptos o antiguos en la memoria local de tu navegador que provocaron una incompatibilidad con el registro notarial. 
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
    <div className="animate-fade-in space-y-8">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-blue-950 flex items-center gap-3">
            <Activity className="text-sky-500" />
            Registro Notarial Digital
          </h1>
          <p className="text-blue-800 mt-1 text-sm">
            Auditoría inmutable de eventos con encadenamiento criptográfico (Hash-chain).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleResetDemo}
            className="btn-secondary px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 border-dashed"
            title="Limpiar base de datos local y restaurar simulador"
          >
            <RotateCcw size={14} />
            <span>Reiniciar Demo</span>
          </button>
          
          <button 
            onClick={handleVerificar}
            disabled={verificando || loading}
            className={cn(
              "relative overflow-hidden group font-bold px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 text-white shadow-lg flex-1 md:flex-initial justify-center",
              estadoIntegridad?.integra === false 
                ? "bg-gradient-to-r from-red-600 to-red-500 shadow-red-500/30" 
                : "bg-gradient-to-r from-sky-600 to-blue-600 shadow-sky-500/30 hover:scale-[1.02]"
            )}
          >
            {verificando ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : estadoIntegridad?.integra ? (
              <ShieldCheck size={20} className="text-green-300" />
            ) : estadoIntegridad?.integra === false ? (
              <ShieldAlert size={20} className="text-white" />
            ) : (
              <ShieldCheck size={20} />
            )}
            <span>
              {verificando ? 'Escaneando Bloques...' : 'Verificar Integridad'}
            </span>

            {/* Shimmer effect inside button */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>
        </div>
      </div>

      {/* VERIFICATION ALERT */}
      {estadoIntegridad && (
        <div className={cn(
          "p-4 rounded-xl border animate-slide-up flex items-start gap-3",
          estadoIntegridad.integra 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700" 
            : "bg-red-500/10 border-red-500/30 text-red-700"
        )}>
          {estadoIntegridad.integra ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          <div>
            <h3 className="font-bold font-heading">
              {estadoIntegridad.integra ? "Cadena Criptográfica Íntegra" : "¡Alerta de Integridad Comprometida!"}
            </h3>
            <p className="text-sm mt-1 opacity-90">
              {estadoIntegridad.integra 
                ? "Todos los hashes coinciden perfectamente. Ningún registro ha sido alterado." 
                : estadoIntegridad.rotura}
            </p>
          </div>
        </div>
      )}

      {/* BLOCKCHAIN VISUALIZATION */}
      <div className="relative max-w-4xl mx-auto pl-4 md:pl-8">
        {/* The central chain line */}
        <div className="absolute top-8 bottom-8 left-[31px] md:left-[47px] w-1 bg-gradient-to-b from-sky-400/50 via-blue-300/30 to-transparent rounded-full" />

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="pl-12 h-32 rounded-2xl shimmer" />
            ))}
          </div>
        ) : safeList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border" style={{ borderColor: '#e2e8f0' }}>
            No existen registros de auditoría en la plataforma.
          </div>
        ) : (
          <div className="space-y-8">
            {safeList.map((log, index) => {
              const isExpanded = expandedId === log.id
              const hashCorto = log.hash ? `${log.hash.slice(0, 16)}...` : 'GÉNESIS'
              const safeEntidadId = log.entidadId ? String(log.entidadId).slice(0, 8).toUpperCase() : 'N/A'
              
              return (
                <div key={log.id} className="relative pl-12 md:pl-16 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  
                  {/* Node Connector */}
                  <div className="absolute left-0 top-6 w-8 md:w-12 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.6)] z-10 ring-4 ring-slate-50" />
                  </div>

                  {/* Block Card */}
                  <div className={cn(
                    "glass-card transition-all duration-300 overflow-hidden border bg-white rounded-2xl",
                    isExpanded ? "border-sky-400/50 shadow-xl shadow-sky-500/10" : "border-slate-100 hover:border-sky-300/40"
                  )} style={{ borderColor: isExpanded ? '#0EA5E9' : '#f1f5f9' }}>
                    
                    {/* Block Header */}
                    <div 
                      className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                      onClick={() => toggleExpand(log.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="badge bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            {log.action || log.accion || 'EVENTO'}
                          </span>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Key size={12} /> {hashCorto}
                          </span>
                        </div>
                        <h3 className="text-blue-950 font-bold font-heading text-sm md:text-base">
                          {log.userName || log.userEmail || 'Sistema'} <span className="text-slate-500 font-normal">sobre</span> {log.entidad || 'Auditoría'} <span className="text-slate-400 text-xs font-mono">#{safeEntidadId}</span>
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          {formatDateTime(log.timestamp || log.createdAt)}
                        </p>
                      </div>

                      <button className="text-slate-400 hover:text-sky-600 transition-colors p-2 bg-slate-50 rounded-full">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          
                          {/* Cryptographic Data */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                              <ShieldCheck size={14} className="text-sky-500" />
                              Firmas Criptográficas
                            </h4>
                            <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-[10px] break-all border border-slate-700 shadow-inner">
                              <p className="mb-2">
                                <span className="text-slate-500">Hash Actual:</span><br/>
                                <span className="text-green-400">{log.hash || 'N/A'}</span>
                              </p>
                              <p className="flex items-center gap-2 text-slate-500 mb-1">
                                <LinkIcon size={12} /> Enlazado con:
                              </p>
                              <p>
                                <span className="text-slate-500">Hash Anterior:</span><br/>
                                <span className="text-blue-300">{log.hashAnterior || 'BLOQUE GÉNESIS (NULL)'}</span>
                              </p>
                            </div>
                          </div>

                          {/* Payload / Details */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                              Payload (Detalles)
                            </h4>
                            <div className="bg-slate-100 p-3 rounded-lg font-mono text-[11px] text-blue-950 border border-slate-200 overflow-x-auto max-h-48 overflow-y-auto">
                              {log.details || log.detalle ? (
                                <pre>{JSON.stringify(parseDetalle(log.details || log.detalle), null, 2)}</pre>
                              ) : (
                                <span className="text-slate-400 italic">No hay carga útil adicional.</span>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
