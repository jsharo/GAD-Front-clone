import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, User, MapPin,
  CheckCircle2, XCircle, AlertCircle, Eye,
  Download, Camera, Upload, Trash2, Image, MessageSquare,
  ZoomIn, X as XIcon, Send,
} from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'
import { getEstadoBadgeClass, getEstadoLabel, formatDateTime, cn } from '@/lib/utils'
import api from '@/lib/api'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VISOR LIGHTBOX de fotos
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 p-2 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: 'white' }}>
        <XIcon size={22} />
      </button>
      <img
        src={src}
        alt="Foto inspección"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROW de documento del ciudadano (ver + descargar)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AnexoRow({ anexo }: { anexo: any }) {
  const apiBase = '/api/v1'
  const url = `${apiBase}/files/${encodeURIComponent(anexo.key)}`

  const handleView = async () => {
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] as string }))
      window.open(blobUrl, '_blank')
    } catch (e) { console.error(e); alert('Error al cargar documento') }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] as string }))
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = anexo.nombre
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) { console.error(e); alert('Error al descargar documento') }
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ background: 'rgba(37,99,235,0.03)', borderColor: 'rgba(37,99,235,0.1)' }}>
      <FileText size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-blue-950 text-sm font-medium truncate">{anexo.nombre}</p>
        <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 2 }}>
          {(anexo.tamano / 1024).toFixed(1)} KB • SHA-256: {anexo.hash?.slice(0, 16)}…
        </p>
      </div>
      <div className="flex items-center gap-1">
        {/* VER */}
        <button
          onClick={handleView}
          title="Ver documento"
          className="p-2 rounded-lg transition-all"
          style={{ color: '#2563EB' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,235,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Eye size={16} />
        </button>
        {/* DESCARGAR */}
        <button
          onClick={handleDownload}
          title="Descargar documento"
          className="p-2 rounded-lg transition-all"
          style={{ color: '#1B7FBF' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(27,127,191,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PÁGINA PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function InspeccionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [solicitud, setSolicitud] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  // Estado del reporte de inspección
  const [fotosSeleccionadas, setFotosSeleccionadas] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [comentariosReporte, setComentariosReporte] = useState('')
  const [subiendoReporte, setSubiendoReporte] = useState(false)
  const [reporteEnviado, setReporteEnviado] = useState(false)

  // Estado de resolución final
  const [resolucion, setResolucion]     = useState<'APROBADO' | 'NEGADO' | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [resolving, setResolving]       = useState(false)

  // Lightbox
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const apiBase = (window as any).__API_URL__ ?? 'http://localhost:3001/api/v1'

  const cargar = async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data } = await solicitudesApi.getById(id)
      setSolicitud(data)
      // Si ya tenía reporte, pre-cargar comentarios
      if (data.reporteComentarios) {
        setComentariosReporte(data.reporteComentarios)
        setReporteEnviado(true)
      }
    } catch {
      setError('No se pudo cargar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [id])

  // Gestión de fotos seleccionadas
  const onFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setFotosSeleccionadas((prev) => {
      const nuevas = [...prev, ...files].slice(0, 20)
      // Generar previews
      nuevas.forEach((f, i) => {
        if (!previews[i]) {
          const reader = new FileReader()
          reader.onload = () =>
            setPreviews((p) => { const cp = [...p]; cp[i] = reader.result as string; return cp })
          reader.readAsDataURL(f)
        }
      })
      return nuevas
    })
    e.target.value = ''
  }

  const eliminarFoto = (idx: number) => {
    setFotosSeleccionadas((p) => p.filter((_, i) => i !== idx))
    setPreviews((p) => p.filter((_, i) => i !== idx))
  }

  const handleSubirReporte = async () => {
    if (!id || !comentariosReporte.trim()) {
      setError('Escribe los comentarios del reporte de inspección')
      return
    }
    setSubiendoReporte(true)
    setError(null)
    try {
      await solicitudesApi.subirReporte(id, comentariosReporte, fotosSeleccionadas)
      setReporteEnviado(true)
      await cargar()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al subir el reporte')
    } finally {
      setSubiendoReporte(false)
    }
  }

  const handleResolver = async () => {
    if (!id || !resolucion) return
    if (!observaciones.trim()) {
      setError('Escribe las observaciones técnicas')
      return
    }
    setResolving(true)
    setError(null)
    try {
      await solicitudesApi.resolver(id, { resolucion, observaciones, motivoRechazo: resolucion === 'NEGADO' ? motivoRechazo : undefined })
      navigate('/tecnico/bandeja')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al resolver')
    } finally {
      setResolving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
      </div>
    )
  }

  if (!solicitud) {
    return (
      <div className="glass-card p-12 text-center max-w-xl mx-auto">
        <AlertCircle size={40} style={{ color: '#CC2229' }} className="mx-auto mb-4" />
        <p style={{ color: '#CC2229' }}>{error || 'Solicitud no encontrada'}</p>
      </div>
    )
  }

  const docsCiudadano: any[]  = solicitud.documentosCiudadano ?? solicitud.anexos?.filter((a: any) => a.tipo !== 'INSPECCION_FOTO') ?? []
  const fotosExistentes: any[] = solicitud.fotosInspeccion ?? solicitud.anexos?.filter((a: any) => a.tipo === 'INSPECCION_FOTO') ?? []
  const resuelta = ['APROBADO', 'NEGADO'].includes(solicitud.estado)
  const puedeSubirReporte = ['EN_REVISION', 'INSPECCION'].includes(solicitud.estado)
  const puedeResolver = puedeSubirReporte

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link to="/tecnico/bandeja" className="btn-secondary p-2 mt-1 flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-blue-950">
              {solicitud.tipoTramite || 'Trámite Territorial'}
            </h1>
            <span className={getEstadoBadgeClass(solicitud.estado)}>
              {getEstadoLabel(solicitud.estado)}
            </span>
            {/* Badge de zona */}
            <span className="badge" style={{
              background: solicitud.predio?.ubicacion === 'URBANO' ? 'rgba(37,99,235,0.12)' : 'rgba(46,139,87,0.12)',
              border: `1px solid ${solicitud.predio?.ubicacion === 'URBANO' ? 'rgba(37,99,235,0.3)' : 'rgba(46,139,87,0.3)'}`,
              color: solicitud.predio?.ubicacion === 'URBANO' ? '#2563EB' : '#2E8B57',
            }}>
              {solicitud.predio?.ubicacion === 'URBANO' ? '🏙️ Urbano' : '🌿 Rural'}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 4 }}>
            #{id?.slice(0, 8).toUpperCase()} • {formatDateTime(solicitud.createdAt)}
          </p>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(204,34,41,0.1)', border: '1px solid rgba(204,34,41,0.3)', color: '#F87171' }}>
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Ciudadano ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2 text-sm">
          <User size={15} style={{ color: '#2563EB' }} /> Ciudadano Solicitante
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { l: 'Nombre', v: `${solicitud.ciudadano?.nombre} ${solicitud.ciudadano?.apellido}` },
            { l: 'Cédula', v: solicitud.ciudadano?.cedula || '—' },
            { l: 'Email', v: solicitud.ciudadano?.email },
            { l: 'Teléfono', v: solicitud.ciudadano?.telefono || '—' },
          ].map(({ l, v }) => (
            <div key={l}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</p>
              <p className="text-blue-950 font-medium mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Predio ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2 text-sm">
          <MapPin size={15} style={{ color: '#2563EB' }} /> Datos del Predio
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { l: 'Tipo de Trámite', v: solicitud.tipoTramite },
            { l: 'Zona', v: solicitud.predio?.ubicacion },
            { l: 'Dirección', v: solicitud.predio?.direccion },
            { l: 'Área', v: solicitud.predio?.area ? `${solicitud.predio.area} m²` : '—' },
          ].map(({ l, v }) => (
            <div key={l}>
              <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</p>
              <p className="text-blue-950 font-medium mt-0.5">{v || '—'}</p>
            </div>
          ))}
        </div>
        {solicitud.predio?.descripcion && (
          <p className="text-sm mt-3 pt-3" style={{ borderTop: '1px solid rgba(37,99,235,0.1)', color: 'rgba(180,160,90,0.7)' }}>
            {solicitud.predio.descripcion}
          </p>
        )}
      </div>

      {/* ── Documentos del Ciudadano ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2 text-sm">
          <FileText size={15} style={{ color: '#2563EB' }} />
          Documentos del Ciudadano ({docsCiudadano.length})
        </h2>
        {docsCiudadano.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sin documentos adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {docsCiudadano.map((a: any) => <AnexoRow key={a.id} anexo={a} />)}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          REPORTE DE INSPECCIÓN TÉCNICA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card p-5" style={{ borderColor: 'rgba(27,127,191,0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-blue-950 flex items-center gap-2 text-sm">
            <Camera size={15} style={{ color: '#1B7FBF' }} />
            Reporte de Inspección Técnica
          </h2>
          {reporteEnviado && (
            <span className="badge" style={{ background: 'rgba(46,139,87,0.12)', border: '1px solid rgba(46,139,87,0.3)', color: '#2E8B57' }}>
              <CheckCircle2 size={11} /> Registrado
            </span>
          )}
        </div>

        {/* Fotos ya subidas */}
        {fotosExistentes.length > 0 && (
          <div className="mb-5">
            <p style={{ color: 'rgba(100,140,180,0.7)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Fotos del sitio ({fotosExistentes.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {fotosExistentes.map((foto: any) => {
                const url = `${apiBase}/files/${encodeURIComponent(foto.key)}`
                const handleDownloadFoto = async () => {
                  try {
                    const response = await api.get(url, { responseType: 'blob' })
                    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] as string }))
                    const link = document.createElement('a')
                    link.href = blobUrl
                    link.download = foto.nombre
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  } catch (e) { console.error(e) }
                }
                const handleViewFoto = async () => {
                  try {
                    const response = await api.get(url, { responseType: 'blob' })
                    const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] as string }))
                    setLightboxSrc(blobUrl)
                  } catch (e) { console.error(e) }
                }
                
                return (
                  <div key={foto.id} className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer"
                    style={{ background: 'rgba(27,127,191,0.08)', border: '1px solid rgba(27,127,191,0.2)' }}
                    onClick={handleViewFoto}>
                    <img src={`http://localhost:3001${url}`} alt={foto.nombre} className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <ZoomIn size={20} style={{ color: 'white' }} />
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleDownloadFoto(); }}
                      className="absolute top-1 right-1 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.6)' }}>
                      <Download size={12} style={{ color: 'white' }} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Comentarios del reporte ya guardado */}
        {solicitud.reporteComentarios && (
          <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(27,127,191,0.07)', border: '1px solid rgba(27,127,191,0.15)' }}>
            <p style={{ color: 'rgba(100,140,180,0.7)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
              📋 Observaciones registradas
            </p>
            <p className="text-blue-950 text-sm" style={{ lineHeight: 1.6 }}>{solicitud.reporteComentarios}</p>
            {solicitud.reporteFecha && (
              <p style={{ color: 'rgba(100,140,180,0.5)', fontSize: '0.7rem', marginTop: 8 }}>
                Registrado: {formatDateTime(solicitud.reporteFecha)}
              </p>
            )}
          </div>
        )}

        {/* Formulario para subir/actualizar reporte */}
        {puedeSubirReporte && (
          <div className="space-y-4">
            <div>
              <label className="input-label flex items-center gap-2">
                <MessageSquare size={12} />
                Observaciones de la inspección *
              </label>
              <textarea
                value={comentariosReporte}
                onChange={(e) => setComentariosReporte(e.target.value)}
                className="input-field resize-none"
                rows={4}
                placeholder="Describe los hallazgos en el sitio, condiciones del predio, cumplimiento de normativa, etc."
              />
            </div>

            {/* Selector de fotos */}
            <div>
              <label className="input-label flex items-center gap-2">
                <Camera size={12} />
                Fotos del sitio ({fotosSeleccionadas.length}/20)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={onFotosChange}
                className="hidden"
              />

              {/* Previews de fotos nuevas */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                  {previews.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group"
                      style={{ border: '1px solid rgba(27,127,191,0.25)' }}>
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => eliminarFoto(i)}
                        className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(204,34,41,0.8)' }}>
                        <Trash2 size={11} style={{ color: 'white' }} />
                      </button>
                    </div>
                  ))}
                  {/* Botón añadir más */}
                  {fotosSeleccionadas.length < 20 && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                      style={{ border: '2px dashed rgba(27,127,191,0.3)', color: 'rgba(27,127,191,0.6)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(27,127,191,0.6)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(27,127,191,0.3)')}>
                      <Upload size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* Zona de drop inicial */}
              {previews.length === 0 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-8 rounded-xl flex flex-col items-center gap-3 transition-all"
                  style={{ border: '2px dashed rgba(27,127,191,0.25)', color: 'rgba(100,140,180,0.6)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(27,127,191,0.5)'; e.currentTarget.style.background = 'rgba(27,127,191,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(27,127,191,0.25)'; e.currentTarget.style.background = 'transparent' }}>
                  <Image size={28} />
                  <div className="text-center">
                    <p className="font-medium text-sm" style={{ color: 'rgba(100,140,180,0.8)' }}>Subir fotos del sitio</p>
                    <p style={{ fontSize: '0.75rem', marginTop: 2 }}>JPEG, PNG, WebP • Máx. 10MB por foto</p>
                  </div>
                </button>
              )}
            </div>

            {/* Botón guardar reporte */}
            <button
              onClick={handleSubirReporte}
              disabled={subiendoReporte || !comentariosReporte.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: subiendoReporte || !comentariosReporte.trim()
                  ? 'rgba(27,127,191,0.2)'
                  : 'linear-gradient(135deg, #1B7FBF 0%, #0F4D82 100%)',
                color: 'white',
                boxShadow: comentariosReporte.trim() ? '0 0 20px rgba(27,127,191,0.3)' : 'none',
              }}>
              {subiendoReporte
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Upload size={18} /> {reporteEnviado ? 'Actualizar reporte' : 'Guardar reporte de inspección'}</>}
            </button>

            {!reporteEnviado && (
              <p style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>
                💡 Al guardar, la solicitud avanza automáticamente a estado <strong style={{ color: '#1B7FBF' }}>En Inspección</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          RESOLUCIÓN FINAL — Solo después de guardar reporte
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {puedeResolver && !resuelta && (
        <div className="glass-card p-5 space-y-4" style={{ borderColor: 'rgba(37,99,235,0.15)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-blue-950 text-sm">Resolución Final</h2>
            {!reporteEnviado && (
              <span className="badge" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: 'rgba(200,160,0,0.8)', fontSize: '0.65rem' }}>
                ⚠ Guarda el reporte primero
              </span>
            )}
          </div>

          <div>
            <label className="input-label">Conclusiones técnicas *</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Conclusión técnica final basada en la inspección realizada..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setResolucion('APROBADO')}
              className={cn('flex items-center gap-2 p-3 rounded-xl border transition-all font-medium text-sm')}
              style={resolucion === 'APROBADO'
                ? { borderColor: '#2E8B57', background: 'rgba(46,139,87,0.15)', color: '#2E8B57' }
                : { borderColor: 'rgba(0,0,0,0.05)', color: '#475569' }}>
              <CheckCircle2 size={18} /> Aprobar solicitud
            </button>
            <button
              onClick={() => setResolucion('NEGADO')}
              className={cn('flex items-center gap-2 p-3 rounded-xl border transition-all font-medium text-sm')}
              style={resolucion === 'NEGADO'
                ? { borderColor: '#CC2229', background: 'rgba(204,34,41,0.15)', color: '#CC2229' }
                : { borderColor: 'rgba(0,0,0,0.05)', color: '#475569' }}>
              <XCircle size={18} /> Negar solicitud
            </button>
          </div>

          {resolucion === 'NEGADO' && (
            <div>
              <label className="input-label">Motivo de rechazo *</label>
              <textarea
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                className="input-field resize-none"
                rows={2}
                placeholder="Especifica el incumplimiento o motivo de negativa..."
              />
            </div>
          )}

          {resolucion && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)' }}>
              <p style={{ color: 'rgba(160,130,60,0.7)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                🔐 Al confirmar se generará tu <strong style={{ color: '#2563EB' }}>firma digital técnica</strong> (XAdES-BES)
                y el ciudadano recibirá notificación inmediata.
                {' '}<span style={{ color: 'rgba(200,160,30,0.5)' }}>[Prototipo: firma simulada]</span>
              </p>
            </div>
          )}

          <button
            onClick={handleResolver}
            disabled={resolving || !resolucion || !observaciones.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
            style={{
              background: !resolucion || !observaciones.trim()
                ? 'rgba(255,255,255,0.06)'
                : resolucion === 'APROBADO'
                ? 'linear-gradient(135deg, #2E8B57 0%, #1A5233 100%)'
                : 'linear-gradient(135deg, #CC2229 0%, #A81B22 100%)',
              color: 'white',
              boxShadow: resolucion && observaciones.trim()
                ? `0 0 20px ${resolucion === 'APROBADO' ? 'rgba(46,139,87,0.35)' : 'rgba(204,34,41,0.35)'}`
                : 'none',
              opacity: resolving ? 0.7 : 1,
            }}>
            {resolving
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>
                  <Send size={18} />
                  Firmar y {resolucion === 'APROBADO' ? 'Aprobar' : resolucion === 'NEGADO' ? 'Negar' : 'Resolver'} solicitud
                </>}
          </button>
        </div>
      )}

      {/* ── Resolución final (solo lectura) ── */}
      {resuelta && (
        <div className="glass-card p-5" style={{
          borderColor: solicitud.estado === 'APROBADO' ? 'rgba(46,139,87,0.35)' : 'rgba(204,34,41,0.35)',
        }}>
          <div className="flex items-center gap-3 mb-3">
            {solicitud.estado === 'APROBADO'
              ? <CheckCircle2 size={24} style={{ color: '#2E8B57' }} />
              : <XCircle size={24} style={{ color: '#CC2229' }} />}
            <h2 className="font-heading font-bold text-blue-950">
              Solicitud {solicitud.estado === 'APROBADO' ? 'Aprobada ✅' : 'Negada ❌'}
            </h2>
          </div>
          {solicitud.observaciones && <p className="text-sm" style={{ color: 'rgba(180,160,120,0.8)' }}>{solicitud.observaciones}</p>}
          {solicitud.motivoRechazo && <p className="text-sm mt-2" style={{ color: '#CC2229' }}>Motivo: {solicitud.motivoRechazo}</p>}
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  )
}
