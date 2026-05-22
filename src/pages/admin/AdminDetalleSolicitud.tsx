import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, FileText, Calendar, User, MapPin,
  CheckCircle2, Clock, XCircle,
  AlertCircle, Eye,
} from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'
import { getEstadoBadgeClass, getEstadoLabel, formatDateTime, cn } from '@/lib/utils'
import api from '@/lib/api'

const TIMELINE = [
  { estado: 'BORRADOR', label: 'Creada', icon: FileText },
  { estado: 'EN_REVISION', label: 'En Revisión', icon: Clock },
  { estado: 'INSPECCION', label: 'En Inspección', icon: MapPin },
  { estado: 'APROBADO', label: 'Aprobada', icon: CheckCircle2 },
]

export function AdminDetalleSolicitud() {
  const { id } = useParams<{ id: string }>()
  const [solicitud, setSolicitud] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = async () => {
    if (!id) return
    try {
      const { data } = await solicitudesApi.getById(id)
      setSolicitud(data)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al cargar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [id])

  const estadoIndex = (estado: string) => {
    const order = ['BORRADOR', 'EN_REVISION', 'INSPECCION', 'APROBADO']
    return order.indexOf(estado)
  }

  const handleView = async (url: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] as string }))
      window.open(blobUrl, '_blank')
    } catch (e) {
      console.error(e)
      setError('No se pudo acceder al documento. Verifica tu sesión.')
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl shimmer" />)}
    </div>
  )

  if (!solicitud) return (
    <div className="glass-card p-12 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
      <p className="text-red-400">{error || 'Solicitud no encontrada'}</p>
    </div>
  )

  const esNegado = solicitud.estado === 'NEGADO'

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/admin/solicitudes" className="btn-secondary p-2 mt-1">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-blue-950">
              {solicitud.tipoTramite || 'Trámite de Ordenamiento'}
            </h1>
            <span className={getEstadoBadgeClass(solicitud.estado)}>
              {getEstadoLabel(solicitud.estado)}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            ID: #{id?.slice(0, 8)}... • Creado {formatDateTime(solicitud.createdAt)}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />{error}
        </div>
      )}

      {/* Timeline de progreso */}
      {!esNegado && (
        <div className="glass-card p-6">
          <h2 className="font-heading font-semibold text-blue-950 mb-4 text-sm">Progreso del Trámite</h2>
          <div className="flex justify-between">
            {TIMELINE.map((t, i) => {
              const active = estadoIndex(solicitud.estado) >= i
              const current = estadoIndex(solicitud.estado) === i
              return (
                <div key={t.estado} className="flex flex-1 flex-col items-center gap-2">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                    active ? (current ? 'bg-primary-600 shadow-glow-primary' : 'bg-success-600') : 'bg-surface-muted',
                  )}>
                    <t.icon size={16} className={active ? 'text-blue-950' : 'text-slate-500'} />
                  </div>
                  <span className={cn(
                    'text-xs text-center font-medium',
                    active ? 'text-blue-950' : 'text-slate-500'
                  )}>{t.label}</span>
                  {i < TIMELINE.length - 1 && (
                    <div className={cn(
                      'absolute h-px w-full top-4',
                      active ? 'bg-success-600' : 'bg-surface-border',
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Negado */}
      {esNegado && (
        <div className="glass-card p-6 border-red-500/30">
          <div className="flex items-center gap-3 mb-3">
            <XCircle size={20} className="text-red-400" />
            <h2 className="font-heading font-semibold text-red-400">Solicitud Negada</h2>
          </div>
          <p className="text-blue-800 text-sm">{solicitud.motivoRechazo || solicitud.observaciones || 'Sin motivo especificado.'}</p>
        </div>
      )}

      {/* Datos del predio */}
      <div className="glass-card p-6">
        <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-primary-400" /> Datos del Predio
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Dirección', value: solicitud.predio?.direccion },
            { label: 'Ubicación', value: solicitud.predio?.ubicacion },
            { label: 'Área', value: solicitud.predio?.area ? `${solicitud.predio.area} m²` : '—' },
            { label: 'Tipo', value: solicitud.tipoTramite },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-500">{label}</p>
              <p className="text-blue-950 font-medium mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
        {solicitud.predio?.descripcion && (
          <p className="text-blue-800 text-sm mt-3 border-t border-surface-border pt-3">{solicitud.predio.descripcion}</p>
        )}
      </div>

      {/* Técnico asignado */}
      {solicitud.tecnico && (
        <div className="glass-card p-6">
          <h2 className="font-heading font-semibold text-blue-950 mb-3 flex items-center gap-2">
            <User size={16} className="text-primary-400" /> Técnico Asignado
          </h2>
          <p className="text-blue-950 font-medium">{solicitud.tecnico.nombre} {solicitud.tecnico.apellido}</p>
          <p className="text-slate-500 text-sm">{solicitud.tecnico.email}</p>
        </div>
      )}

      {/* Agenda */}
      {solicitud.agenda && (
        <div className="glass-card p-6">
          <h2 className="font-heading font-semibold text-blue-950 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-primary-400" /> Inspección Programada
          </h2>
          <p className="text-blue-950 font-medium">{formatDateTime(solicitud.agenda.fecha)}</p>
          {solicitud.agenda.notas && <p className="text-blue-800 text-sm mt-1">{solicitud.agenda.notas}</p>}
          <span className={cn('badge mt-2', solicitud.agenda.confirmada ? 'badge-aprobado' : 'badge-revision')}>
            {solicitud.agenda.confirmada ? 'Confirmada' : 'Pendiente de confirmación'}
          </span>
        </div>
      )}

      {/* Anexos */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-blue-950 flex items-center gap-2">
            <FileText size={16} className="text-primary-400" /> Documentos ({solicitud.anexos?.length ?? 0})
          </h2>
        </div>

        {solicitud.anexos?.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay documentos adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {solicitud.anexos?.map((anexo: any) => (
              <div key={anexo.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-surface-border">
                <FileText size={16} className="text-primary-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-blue-950 text-sm font-medium truncate">{anexo.nombre}</p>
                  <p className="text-slate-500 text-xs">{(anexo.tamano / 1024).toFixed(1)} KB • SHA-256: {anexo.hash?.slice(0, 12)}...</p>
                </div>
                <button
                  onClick={() => handleView(`/api/v1/files/${encodeURIComponent(anexo.key)}`)}
                  className="text-primary-400 hover:text-primary-300"
                >
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Firmas */}
      {solicitud.firmas?.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success-400" /> Firmas Digitales
          </h2>
          <div className="space-y-3">
            {solicitud.firmas.map((firma: any) => (
              <div key={firma.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-surface-border">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                  firma.tipo === 'CIUDADANO' ? 'bg-primary-500/20 text-primary-400' : 'bg-emerald-500/20 text-emerald-400',
                )}>
                  {firma.tipo === 'CIUDADANO' ? 'C' : 'T'}
                </div>
                <div>
                  <p className="text-blue-950 text-sm font-medium">{firma.firmante} <span className="text-slate-500 font-normal">({firma.tipo === 'CIUDADANO' ? 'Ciudadano' : 'Técnico'})</span></p>
                  <p className="text-slate-500 text-xs">Hash: {firma.hashDocumento?.slice(0, 20)}... • {formatDateTime(firma.creadoEn)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
