import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Inbox, CheckCircle2, Clock, ArrowRight, User,
  MapPin, FileText, XCircle, Building2, Trees,
} from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'
import { useAuthStore } from '@/stores/auth.store'
import { getEstadoBadgeClass, getEstadoLabel, formatDate, cn } from '@/lib/utils'

// ── Badge de zona reutilizable ──────────────────────────────
function ZonaBadge({ zona, size = 'md' }: { zona?: string | null; size?: 'sm' | 'md' }) {
  if (!zona) return null
  const isUrban = zona === 'URBANO'
  const small = size === 'sm'
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-lg font-medium', small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm')}
      style={{
        background: isUrban ? 'rgba(37,99,235,0.1)' : 'rgba(46,139,87,0.1)',
        border: `1px solid ${isUrban ? 'rgba(37,99,235,0.3)' : 'rgba(46,139,87,0.3)'}`,
        color: isUrban ? '#2563EB' : '#2E8B57',
      }}
    >
      {isUrban ? <Building2 size={small ? 10 : 13} /> : <Trees size={small ? 10 : 13} />}
      {isUrban ? 'Urbano' : 'Rural'}
    </span>
  )
}

export function BandejaTecnico() {
  const { user } = useAuthStore()
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [filtro, setFiltro]           = useState<string>('TODAS')

  useEffect(() => {
    solicitudesApi.list()
      .then(({ data }) => setSolicitudes(data.data || []))
      .catch(() => setSolicitudes([]))
      .finally(() => setLoading(false))
  }, [])

  const filtradas = filtro === 'TODAS'
    ? solicitudes
    : solicitudes.filter(s => s.estado === filtro)

  const counts = {
    EN_REVISION: solicitudes.filter(s => s.estado === 'EN_REVISION').length,
    INSPECCION:  solicitudes.filter(s => s.estado === 'INSPECCION').length,
    APROBADO:    solicitudes.filter(s => s.estado === 'APROBADO').length,
    NEGADO:      solicitudes.filter(s => s.estado === 'NEGADO').length,
  }

  const FILTROS = [
    { key: 'TODAS',       label: `Todas (${solicitudes.length})` },
    { key: 'EN_REVISION', label: `Revisión (${counts.EN_REVISION})` },
    { key: 'INSPECCION',  label: `Inspección (${counts.INSPECCION})` },
    { key: 'APROBADO',    label: `Aprobadas (${counts.APROBADO})` },
    { key: 'NEGADO',      label: `Negadas (${counts.NEGADO})` },
  ]

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header con zona del técnico ─────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-2xl font-bold text-blue-950">Bandeja de Trabajo</h1>
            {/* Badge de zona del técnico autenticado */}
            <ZonaBadge zona={user?.zona} />
          </div>
          <p className="text-blue-800 mt-1 text-sm">
            {user?.zona
              ? `Solicitudes asignadas de la zona ${user.zona === 'URBANO' ? 'Urbana' : 'Rural'}`
              : 'Solicitudes asignadas para revisión técnica'}
          </p>
        </div>

        {/* Info de zona con ícono descriptivo */}
        {user?.zona && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{
              background: user.zona === 'URBANO' ? 'rgba(37,99,235,0.05)' : 'rgba(46,139,87,0.05)',
              border: `1px solid ${user.zona === 'URBANO' ? 'rgba(37,99,235,0.15)' : 'rgba(46,139,87,0.15)'}`,
              color: user.zona === 'URBANO' ? 'rgba(200,160,30,0.8)' : 'rgba(46,139,87,0.8)',
            }}
          >
            {user.zona === 'URBANO'
              ? <><Building2 size={14} /> Solo trámites de zona <strong>Urbana</strong></>
              : <><Trees size={14} /> Solo trámites de zona <strong>Rural</strong></>
            }
          </div>
        )}
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'En Revisión',   value: counts.EN_REVISION, color: 'text-yellow-400', bg: 'bg-yellow-500/10',  icon: Clock        },
          { label: 'En Inspección', value: counts.INSPECCION,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: MapPin       },
          { label: 'Aprobadas',     value: counts.APROBADO,    color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { label: 'Negadas',       value: counts.NEGADO,      color: 'text-red-400',    bg: 'bg-red-500/10',    icon: XCircle      },
        ].map(s => (
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

      {/* ── Filtros ─────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              filtro === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-surface-muted text-blue-800 hover:text-blue-950',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Lista de solicitudes ─────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl shimmer" />)}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox size={40} className="text-slate-500 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">Sin solicitudes en esta categoría</p>
            {user?.zona && (
              <p className="text-slate-500 text-sm mt-2">
                Solo se muestran solicitudes de zona <strong style={{ color: user.zona === 'URBANO' ? '#2563EB' : '#2E8B57' }}>{user.zona}</strong>
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {filtradas.map((sol) => (
              <Link
                key={sol.id}
                to={`/tecnico/bandeja/${sol.id}`}
                className="flex items-center gap-4 p-4 hover:bg-surface-muted/30 transition-colors group"
              >
                {/* Ícono tipo trámite */}
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-primary-400" />
                </div>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-blue-950 font-medium text-sm">{sol.tipoTramite || 'Trámite'}</p>
                    <span className={getEstadoBadgeClass(sol.estado)}>{getEstadoLabel(sol.estado)}</span>
                    {/* Badge de zona de cada solicitud */}
                    <ZonaBadge zona={sol.predio?.ubicacion} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {sol.ciudadano?.nombre} {sol.ciudadano?.apellido}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {sol.predio?.direccion || sol.predio?.ubicacion || '—'}
                    </span>
                    <span>{formatDate(sol.createdAt)}</span>
                  </div>
                </div>

                {/* Docs adjuntos */}
                {sol._count?.anexos > 0 && (
                  <span className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
                    <FileText size={11} />
                    {sol._count.anexos} doc{sol._count.anexos > 1 ? 's' : ''}
                  </span>
                )}

                <ArrowRight size={16} className="text-slate-500 group-hover:text-blue-800 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
