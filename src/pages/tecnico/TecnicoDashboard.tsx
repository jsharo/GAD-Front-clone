import { useEffect, useState } from 'react'
import { Inbox, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { solicitudesApi } from '@/lib/apiCalls'
import { Link } from 'react-router-dom'

export function TecnicoDashboard() {
  const { user } = useAuthStore()
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    solicitudesApi.list({ limit: 100 })
      .then(({ data }) => setSolicitudes(data.data || []))
      .catch(() => setSolicitudes([]))
      .finally(() => setLoading(false))
  }, [])

  const asignados = solicitudes.filter(s => s.estado === 'EN_REVISION_TECNICA')
  const enInspeccion = solicitudes.filter(s => s.estado === 'INSPECCION')
  const resueltos = solicitudes.filter(s => ['APROBADO', 'NEGADO', 'PENDIENTE_PAGO', 'PAGADO'].includes(s.estado))
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-blue-950">Bienvenido, Tec. {user?.nombre}</h1>
        <p className="text-blue-800 mt-1">Gestiona los trámites asignados a tu zona.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          { label: 'En Revisión (Nuevos)', value: asignados.length, icon: Inbox, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'En Inspección', value: enInspeccion.length, icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Resueltos', value: resueltos.length, icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/10' },
        ] as const).map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-blue-950">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-4">
          <h2 className="font-heading font-semibold text-blue-950 flex items-center gap-2">
            <Clock size={18} className="text-primary-400" />
            Trámites Pendientes de Revisión
          </h2>
          <Link to="/tecnico/bandeja" className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors">
            Ver todos →
          </Link>
        </div>
        
        <div className="divide-y divide-surface-border">
          {loading ? (
            <div className="py-4 space-y-4">
              <div className="h-12 rounded-xl shimmer" />
            </div>
          ) : asignados.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No tienes trámites pendientes de revisión en este momento.
            </div>
          ) : (
            asignados.slice(0, 5).map(sol => (
              <Link to={`/tecnico/bandeja/${sol.id}`} key={sol.id} className="flex items-center justify-between py-4 group">
                <div>
                  <p className="font-semibold text-blue-950">{sol.tipoTramite || 'Trámite'}</p>
                  <p className="text-xs text-slate-500">#{sol.id.slice(0,8)} · {sol.predio?.direccion}</p>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-800 transition-colors" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
