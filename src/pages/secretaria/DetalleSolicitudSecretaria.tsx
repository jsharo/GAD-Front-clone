import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, User, MapPin, CheckCircle2, XCircle,
  AlertCircle, Eye, Download, Clock, FileCheck2, PenLine,
} from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'
import api from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

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

// ── Fila de documento con ver + descargar ──
function AnexoRow({ anexo }: { anexo: any }) {
  const url = `/api/v1/files/${encodeURIComponent(anexo.key)}`

  const openBlob = async (download = false) => {
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] as string })
      )
      if (download) {
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = anexo.nombre
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        window.open(blobUrl, '_blank')
      }
    } catch {
      alert('Error al cargar el documento')
    }
  }

  const isPdf = anexo.tipoMime === 'application/pdf' || anexo.nombre?.endsWith('.pdf')

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors"
      style={{ borderColor: '#e2e8f0' }}>
      <div className="p-2.5 rounded-xl flex-shrink-0"
        style={{ background: isPdf ? 'rgba(220,38,38,0.08)' : 'rgba(37,99,235,0.08)' }}>
        <FileText size={18} style={{ color: isPdf ? '#DC2626' : '#2563EB' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-blue-950 text-sm font-semibold truncate">{anexo.nombre}</p>
        <p className="text-slate-400 text-xs mt-0.5">
          {isPdf ? 'PDF' : 'Imagen'} • {(anexo.tamano / 1024).toFixed(1)} KB
          {anexo.hash && <> • <span className="font-mono">SHA: {anexo.hash.slice(0, 12)}…</span></>}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => openBlob(false)} title="Ver"
          className="p-2 rounded-lg transition-all text-blue-600 hover:bg-blue-50">
          <Eye size={16} />
        </button>
        <button onClick={() => openBlob(true)} title="Descargar"
          className="p-2 rounded-lg transition-all text-slate-500 hover:bg-slate-100">
          <Download size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Indicador de campo del formulario de dictamen ──
function CheckItem({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className="flex items-center gap-3 p-3 rounded-xl border transition-all text-left w-full"
      style={{
        background: checked ? 'rgba(22,163,74,0.06)' : 'white',
        borderColor: checked ? 'rgba(22,163,74,0.4)' : '#e2e8f0',
      }}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        checked ? 'border-green-500 bg-green-500' : 'border-slate-300'
      }`}>
        {checked && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <span className={`text-sm font-medium ${checked ? 'text-green-700' : 'text-slate-600'}`}>{label}</span>
    </button>
  )
}

export function DetalleSolicitudSecretaria() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [solicitud, setSolicitud] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Checklist de verificación
  const [checks, setChecks] = useState({
    firmaPresente: false,
    documentosCompletos: false,
    datosCorrectos: false,
    predioIdentificado: false,
  })

  // Formulario de dictamen
  const [decision, setDecision] = useState<'aprobar' | 'devolver' | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      if (!id) return
      try {
        const { data } = await solicitudesApi.getById(id)
        setSolicitud(data)
      } catch {
        setError('No se pudo cargar la solicitud')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const todosCheckeados = Object.values(checks).every(Boolean)

  const handleDictamen = async () => {
    if (!id || !decision) return
    if (decision === 'devolver' && !observaciones.trim()) {
      setError('Escribe las observaciones para devolver la solicitud')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.post(`/api/v1/solicitudes/${id}/dictamen-secretaria`, {
        aprobada: decision === 'aprobar',
        observaciones: observaciones.trim() || undefined,
      })
      navigate('/secretaria/bandeja')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al registrar el dictamen')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl shimmer" />)}
      </div>
    )
  }

  if (!solicitud || error) {
    return (
      <div className="glass-card p-12 text-center max-w-xl mx-auto">
        <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600">{error || 'Solicitud no encontrada'}</p>
        <Link to="/secretaria/bandeja" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft size={16} /> Volver a la bandeja
        </Link>
      </div>
    )
  }

  const tipoColor = TIPO_COLOR[solicitud.tipoTramite] ?? '#2563EB'
  const tipoLabel = TIPO_LABEL[solicitud.tipoTramite] ?? solicitud.tipoTramite
  const docsCiudadano = (solicitud.anexos ?? []).filter((a: any) => a.tipo !== 'INSPECCION_FOTO')
  const yaResuelta = solicitud.dictamenSecretaria != null || !['PENDIENTE_SECRETARIA', 'OBSERVADO'].includes(solicitud.estado)

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link to="/secretaria/bandeja" className="btn-secondary p-2 mt-1 flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-blue-950">{tipoLabel}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: `${tipoColor}15`, color: tipoColor, border: `1px solid ${tipoColor}30` }}>
              {tipoLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: solicitud.estado === 'PENDIENTE_SECRETARIA' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                color: solicitud.estado === 'PENDIENTE_SECRETARIA' ? '#D97706' : '#DC2626',
                border: `1px solid ${solicitud.estado === 'PENDIENTE_SECRETARIA' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
              {solicitud.estado === 'PENDIENTE_SECRETARIA' ? '⏳ Pendiente de revisión' : '↩ Observado'}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <Clock size={14} />
            Recibido: {formatDateTime(solicitud.createdAt)}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />{error}
        </div>
      )}

      {/* ── Datos del ciudadano ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2 text-sm">
          <User size={15} className="text-blue-600" /> Ciudadano Solicitante
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { l: 'Nombre completo', v: `${solicitud.ciudadano?.nombre} ${solicitud.ciudadano?.apellido}` },
            { l: 'Cédula', v: solicitud.ciudadano?.cedula || '—' },
            { l: 'Correo', v: solicitud.ciudadano?.email },
            { l: 'Teléfono', v: solicitud.ciudadano?.telefono || '—' },
          ].map(({ l, v }) => (
            <div key={l}>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-0.5">{l}</p>
              <p className="text-blue-950 font-medium">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Datos del predio ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2 text-sm">
          <MapPin size={15} className="text-blue-600" /> Datos del Predio
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { l: 'Tipo de trámite', v: tipoLabel },
            { l: 'Zona', v: solicitud.predio?.ubicacion === 'URBANO' ? '🏙️ Urbano' : '🌾 Rural' },
            { l: 'Dirección', v: solicitud.predio?.direccion },
            { l: 'Área', v: solicitud.predio?.area ? `${solicitud.predio.area} m²` : '—' },
          ].map(({ l, v }) => (
            <div key={l}>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-0.5">{l}</p>
              <p className="text-blue-950 font-medium">{v || '—'}</p>
            </div>
          ))}
        </div>
        {solicitud.predio?.descripcion && (
          <p className="text-slate-500 text-sm mt-3 pt-3 border-t border-slate-100">{solicitud.predio.descripcion}</p>
        )}
      </div>

      {/* ── Documentos del ciudadano ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-blue-950 flex items-center gap-2 text-sm">
            <FileText size={15} className="text-blue-600" />
            Expediente Documental ({docsCiudadano.length} archivos)
          </h2>
          {solicitud.firmas?.length > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
              <CheckCircle2 size={11} /> Firma del ciudadano presente
            </span>
          )}
        </div>

        {docsCiudadano.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay documentos adjuntos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docsCiudadano.map((a: any) => <AnexoRow key={a.id} anexo={a} />)}
          </div>
        )}
      </div>

      {/* ── Firmas registradas ── */}
      {solicitud.firmas?.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2 text-sm">
            <PenLine size={15} className="text-blue-600" /> Firmas Digitales
          </h2>
          <div className="space-y-2">
            {solicitud.firmas.map((firma: any) => (
              <div key={firma.id} className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-800">Firma de {firma.tipo}</p>
                  <p className="text-xs text-green-600 font-mono truncate">Hash: {firma.hashDocumento?.slice(0, 24)}…</p>
                </div>
                <p className="text-xs text-slate-400">{formatDateTime(firma.creadoEn)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          PANEL DE DICTAMEN (solo si no está resuelta)
      ══════════════════════════════════════ */}
      {!yaResuelta ? (
        <div className="glass-card p-5 space-y-5" style={{ borderColor: 'rgba(217,119,6,0.3)' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(217,119,6,0.1)' }}>
              <FileCheck2 size={20} style={{ color: '#D97706' }} />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-blue-950">Dictamen de Secretaría</h2>
              <p className="text-slate-400 text-xs">Verifica que el expediente esté completo y correctamente firmado</p>
            </div>
          </div>

          {/* Checklist de verificación */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Lista de verificación ({Object.values(checks).filter(Boolean).length}/{Object.keys(checks).length})
            </p>
            <div className="space-y-2">
              <CheckItem label="✍️ Firma digital del ciudadano presente" checked={checks.firmaPresente} onToggle={() => toggleCheck('firmaPresente')} />
              <CheckItem label="📁 Todos los documentos requeridos adjuntos" checked={checks.documentosCompletos} onToggle={() => toggleCheck('documentosCompletos')} />
              <CheckItem label="👤 Datos del solicitante correctos y completos" checked={checks.datosCorrectos} onToggle={() => toggleCheck('datosCorrectos')} />
              <CheckItem label="📍 Predio identificado con dirección clara" checked={checks.predioIdentificado} onToggle={() => toggleCheck('predioIdentificado')} />
            </div>
          </div>

          {/* Decisión */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Resolución</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setDecision('aprobar')}
                className="flex items-center gap-2 p-4 rounded-xl border-2 transition-all font-semibold text-sm"
                style={decision === 'aprobar'
                  ? { borderColor: '#16A34A', background: 'rgba(22,163,74,0.08)', color: '#16A34A' }
                  : { borderColor: '#e2e8f0', color: '#64748b' }}>
                <CheckCircle2 size={20} />
                <div className="text-left">
                  <p className="font-bold">Aprobar</p>
                  <p className="text-xs opacity-70">Enviar al técnico</p>
                </div>
              </button>
              <button type="button" onClick={() => setDecision('devolver')}
                className="flex items-center gap-2 p-4 rounded-xl border-2 transition-all font-semibold text-sm"
                style={decision === 'devolver'
                  ? { borderColor: '#DC2626', background: 'rgba(220,38,38,0.08)', color: '#DC2626' }
                  : { borderColor: '#e2e8f0', color: '#64748b' }}>
                <XCircle size={20} />
                <div className="text-left">
                  <p className="font-bold">Devolver</p>
                  <p className="text-xs opacity-70">Con observaciones</p>
                </div>
              </button>
            </div>
          </div>

          {/* Observaciones (siempre visible, obligatorio si devuelve) */}
          <div>
            <label className="input-label">
              Observaciones {decision === 'devolver' ? '*' : '(opcional)'}
            </label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder={decision === 'devolver'
                ? 'Describe qué documentos faltan, qué errores se encontraron o qué debe corregir el ciudadano...'
                : 'Notas adicionales para el expediente (opcional)...'}
            />
          </div>

          {/* Aviso de verificación */}
          {!todosCheckeados && (
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs leading-relaxed">
                Completa la lista de verificación antes de aprobar. Puedes devolver sin completarla si el expediente está incompleto.
              </p>
            </div>
          )}

          {/* Botón de confirmar */}
          <button
            type="button"
            onClick={handleDictamen}
            disabled={submitting || !decision || (decision === 'aprobar' && !todosCheckeados)}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: !decision || (decision === 'aprobar' && !todosCheckeados)
                ? '#e2e8f0'
                : decision === 'aprobar'
                ? 'linear-gradient(135deg, #16A34A 0%, #166534 100%)'
                : 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
              color: !decision || (decision === 'aprobar' && !todosCheckeados) ? '#94a3b8' : 'white',
              boxShadow: decision && (decision === 'devolver' || todosCheckeados)
                ? `0 4px 20px ${decision === 'aprobar' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`
                : 'none',
              cursor: !decision || (decision === 'aprobar' && !todosCheckeados) ? 'not-allowed' : 'pointer',
            }}>
            {submitting
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : decision === 'aprobar'
              ? <><CheckCircle2 size={18} /> Aprobar y enviar al Técnico</>
              : decision === 'devolver'
              ? <><XCircle size={18} /> Devolver al Ciudadano con observaciones</>
              : 'Selecciona una resolución'}
          </button>
        </div>
      ) : (
        /* ── Dictamen ya registrado (solo lectura) ── */
        <div className="glass-card p-5" style={{
          borderColor: solicitud.dictamenSecretaria?.aprobada ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)',
        }}>
          <div className="flex items-center gap-3 mb-3">
            {solicitud.dictamenSecretaria?.aprobada
              ? <CheckCircle2 size={24} className="text-green-600" />
              : <XCircle size={24} className="text-red-600" />}
            <div>
              <h2 className="font-heading font-bold text-blue-950">
                Dictamen registrado: {solicitud.dictamenSecretaria?.aprobada ? '✅ Aprobado' : '❌ Devuelto'}
              </h2>
              <p className="text-slate-400 text-xs">{formatDateTime(solicitud.dictamenSecretaria?.creadoEn)}</p>
            </div>
          </div>
          {solicitud.dictamenSecretaria?.observaciones && (
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200 mt-2">
              {solicitud.dictamenSecretaria.observaciones}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
