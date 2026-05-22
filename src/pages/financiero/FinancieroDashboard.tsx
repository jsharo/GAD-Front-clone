import { useEffect, useState } from 'react'
import { DollarSign, Clock, CheckCircle2, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'
import { Link } from 'react-router-dom'
import { formatDateTime } from '@/lib/utils'

const BRAND = '#7C3AED'

const TIPO_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
}

export function FinancieroDashboard() {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    solicitudesApi.list({ limit: 100 })
      .then(({ data }) => {
        // Filtrar solo las que tienen que ver con financiero
        const finan = (data.data || []).filter((s: any) => 
          ['PENDIENTE_PAGO', 'PAGADO', 'APROBADO'].includes(s.estado) && s.cobros && s.cobros.length > 0
        )
        setSolicitudes(finan)
      })
      .catch(() => setSolicitudes([]))
      .finally(() => setLoading(false))
  }, [])

  // Calcular stats
  const pendientes = solicitudes.filter(s => s.cobros[0].estado === 'PENDIENTE')
  const pagados = solicitudes.filter(s => s.cobros[0].estado === 'PAGADO')
  
  const pagadosHoy = pagados.filter(s => {
    const today = new Date().toDateString()
    return new Date(s.cobros[0].fechaPago || s.cobros[0].updatedAt).toDateString() === today
  })

  const recaudadoHoy = pagadosHoy.reduce((acc, s) => acc + Number(s.cobros[0].monto), 0)
  const totalMes = pagados.reduce((acc, s) => acc + Number(s.cobros[0].monto), 0)

  const stats = [
    { label: 'Cobros Pendientes', value: pendientes.length, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Pagados Hoy', value: pagadosHoy.length, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Recaudado Hoy ($)', value: `$ ${recaudadoHoy.toFixed(2)}`, icon: DollarSign, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    { label: 'Total Histórico ($)', value: `$ ${totalMes.toFixed(2)}`, icon: TrendingUp, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
  ]
  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950">Panel Financiero</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Gestión de cobros, liquidación y registro de pagos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border"
            style={{ background: 'white', borderColor: '#e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <ArrowUpRight size={14} style={{ color: '#94a3b8' }} />
            </div>
            <p className="text-3xl font-black" style={{ color: '#1e293b' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Flujo de etapas */}
      <div className="rounded-2xl p-6 border" style={{ background: 'white', borderColor: '#e2e8f0' }}>
        <h2 className="font-bold text-blue-950 mb-4">Etapas del Proceso</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            { label: 'Ciudadano\nSube docs', color: '#2563EB', active: false },
            { label: 'Secretaría\nRevisa', color: '#D97706', active: false },
            { label: 'Técnico\nEvalúa', color: '#2E8B57', active: false },
            { label: 'Financiero\nCobra', color: BRAND, active: true },
            { label: 'Aprobado', color: '#10B981', active: false },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold`}
                  style={{
                    background: step.active ? step.color : '#e2e8f0',
                    color: step.active ? 'white' : '#94a3b8',
                    boxShadow: step.active ? `0 0 20px ${step.color}50` : 'none',
                  }}>
                  {i + 1}
                </div>
                <p className="text-center mt-2 text-xs font-semibold whitespace-pre-line leading-tight"
                  style={{ color: step.active ? step.color : '#94a3b8', maxWidth: 72 }}>
                  {step.label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className="w-8 sm:w-16 h-0.5 mx-1 flex-shrink-0" style={{ background: '#e2e8f0' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cobros recientes */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'white', borderColor: '#e2e8f0' }}>
        <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: '#f1f5f9' }}>
          <CreditCard size={18} style={{ color: BRAND }} />
          <h2 className="font-bold text-blue-950">Cobros Pendientes y Recientes</h2>
        </div>
        <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="h-12 rounded-xl shimmer" />
              <div className="h-12 rounded-xl shimmer" />
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay cobros registrados
            </div>
          ) : (
            solicitudes.slice(0, 5).map((sol) => {
              const cobro = sol.cobros[0]
              return (
                <Link to={`/financiero/bandeja/${sol.id}`} key={sol.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer block">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${BRAND}12`, border: `1px solid ${BRAND}20` }}>
                      <DollarSign size={16} style={{ color: BRAND }} />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-950 text-sm">{sol.ciudadano?.nombre} {sol.ciudadano?.apellido}</p>
                      <p style={{ color: '#64748b', fontSize: '0.75rem' }}>#{sol.id.slice(0,8)} · {TIPO_LABEL[sol.tipoTramite] || 'Trámite'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-blue-950">${Number(cobro.monto).toFixed(2)}</p>
                    <span className="text-xs px-3 py-1 rounded-full font-semibold"
                      style={{
                        background: cobro.estado === 'PENDIENTE' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: cobro.estado === 'PENDIENTE' ? '#D97706' : '#059669',
                      }}>
                      {cobro.estado}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{formatDateTime(cobro.createdAt)}</span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
        <div className="px-6 py-3 text-center border-t" style={{ borderColor: '#f1f5f9' }}>
          <Link to="/financiero/bandeja" className="text-sm font-semibold" style={{ color: BRAND }}>
            Ver todos los cobros →
          </Link>
        </div>
      </div>

    </div>
  )
}
