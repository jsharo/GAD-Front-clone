import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, FileText, Calendar, User, MapPin,
  CheckCircle2, XCircle, Upload, Send,
  AlertCircle, Eye, DollarSign
} from 'lucide-react'
import { solicitudesApi, anexosApi } from '@/lib/apiCalls'
import { getEstadoBadgeClass, getEstadoLabel, formatDateTime, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'

import { SolicitudTimeline } from '@/components/SolicitudTimeline'

export function DetalleSolicitud() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [solicitud, setSolicitud] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

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

  const handleUploadAnexo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setUploadingFile(true)
    try {
      await anexosApi.upload(id, file)
      await cargar()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al subir archivo')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleEnviar = async () => {
    if (!id) return
    setEnviando(true)
    setError(null)
    try {
      await solicitudesApi.enviar(id)
      await cargar()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al enviar')
    } finally {
      setEnviando(false)
    }
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
  const esBorrador = solicitud.estado === 'BORRADOR'

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/ciudadano/solicitudes" className="btn-secondary p-2 mt-1">
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
      <div className="glass-card p-6 pb-12 mb-6">
        <h2 className="font-heading font-semibold text-blue-950 mb-6 text-sm">Progreso del Trámite</h2>
        <SolicitudTimeline estadoActual={solicitud.estado} />
      </div>

      {/* Observaciones de Secretaría o Técnico (cuando devuelven o niegan) */}
      {(solicitud.estado === 'OBSERVADO' && solicitud.dictamenSecretaria?.observaciones) && (
        <div className="glass-card p-6 border-amber-500/30">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle size={20} className="text-amber-500" />
            <h2 className="font-heading font-semibold text-amber-600">Trámite Observado por Secretaría</h2>
          </div>
          <p className="text-blue-950 text-sm bg-amber-50 p-4 rounded-xl border border-amber-100">
            {solicitud.dictamenSecretaria.observaciones}
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Por favor, revisa las observaciones, corrige la información o sube los documentos faltantes.
          </p>
        </div>
      )}

      {/* Información de Cobro */}
      {(solicitud.estado === 'PENDIENTE_PAGO' || solicitud.estado === 'PAGADO' || solicitud.estado === 'APROBADO') && solicitud.cobros?.length > 0 && (
        <div className="glass-card p-6" style={{ borderColor: solicitud.cobros[0].estado === 'PAGADO' ? 'rgba(22,163,74,0.3)' : 'rgba(124,58,237,0.3)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-blue-950 flex items-center gap-2">
              <DollarSign size={18} style={{ color: solicitud.cobros[0].estado === 'PAGADO' ? '#16A34A' : '#7C3AED' }} />
              Información de Pago
            </h2>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-bold',
              solicitud.cobros[0].estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
            )}>
              {solicitud.cobros[0].estado === 'PAGADO' ? '✅ Pago Recibido' : '⏳ Pendiente de Pago'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Monto a pagar</p>
              <p className="text-2xl font-bold text-blue-950">${Number(solicitud.cobros[0].monto).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Concepto</p>
              <p className="text-sm font-medium text-blue-950">{solicitud.cobros[0].concepto}</p>
            </div>
          </div>
          {solicitud.cobros[0].estado === 'PENDIENTE' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-800">
                Acércate a las ventanillas de recaudación del GAD Municipal con el número de trámite <strong>#{id?.slice(0, 8).toUpperCase()}</strong> para cancelar el valor correspondiente.
              </p>
            </div>
          )}
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
          {esBorrador && (
            <label className="btn-secondary text-xs px-3 py-2 cursor-pointer">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUploadAnexo} className="sr-only" />
              {uploadingFile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload size={14} /> Agregar</>}
            </label>
          )}
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

      {/* Acción: Enviar a revisión */}
      {esBorrador && user?.role === 'CIUDADANO' && (
        <div className="glass-card p-6 border-primary-500/30">
          <h2 className="font-heading font-semibold text-blue-950 mb-2">Enviar a Revisión</h2>
          <p className="text-blue-800 text-sm mb-4">
            Al enviar, se generará tu firma digital y la solicitud será asignada automáticamente a un técnico.
            {' '}<span className="text-yellow-500">[Prototipo: firma simulada]</span>
          </p>
          {(solicitud.anexos?.length ?? 0) === 0 && (
            <p className="text-yellow-400 text-sm mb-3 flex items-center gap-2">
              <AlertCircle size={14} /> Debes adjuntar al menos un documento.
            </p>
          )}
          <button
            id="detalle-enviar"
            onClick={handleEnviar}
            disabled={enviando || solicitud.anexos?.length === 0}
            className="btn-primary w-full"
          >
            {enviando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={18} /> Firmar y Enviar a Revisión</>}
          </button>
        </div>
      )}
    </div>
  )
}
