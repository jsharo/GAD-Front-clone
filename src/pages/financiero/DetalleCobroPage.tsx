import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, MapPin, AlertCircle,
  DollarSign, CheckCircle2, Clock, Receipt, CreditCard,
} from 'lucide-react'
import { solicitudesApi } from '@/lib/apiCalls'
import api from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

const TIPO_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
}

// Tabla de tarifas base por tipo de trámite (referencial)
const TARIFAS_BASE: Record<string, number> = {
  LINEA_FABRICAS: 25.00,
  APROBACION_PLANOS: 80.00,
  PERMISO_CONSTRUCCION: 150.00,
}

export function DetalleCobroPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [solicitud, setSolicitud] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Formulario de cobro
  const [monto, setMonto] = useState('')
  const [concepto, setConcepto] = useState('')
  const [notas, setNotas] = useState('')

  useEffect(() => {
    const cargar = async () => {
      if (!id) return
      try {
        const { data } = await solicitudesApi.getById(id)
        setSolicitud(data)
        // Pre-llenar monto sugerido según tipo de trámite
        const tipoTramite = data.tipoTramite
        const base = TARIFAS_BASE[tipoTramite] ?? 50
        const area = data.predio?.area ?? 0
        // Cálculo simple: base + 0.20 por m²
        const sugerido = base + (area * 0.20)
        setMonto(sugerido.toFixed(2))
        setConcepto(`${TIPO_LABEL[tipoTramite] ?? tipoTramite} — ${data.predio?.direccion ?? 'Predio'}`)
      } catch {
        setError('No se pudo cargar la solicitud')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [id])

  const handleRegistrarCobro = async () => {
    if (!id || !monto || !concepto) {
      setError('Completa el monto y el concepto del cobro')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.post(`/api/v1/solicitudes/${id}/cobrar`, {
        monto: parseFloat(monto),
        concepto,
        notas: notas.trim() || undefined,
      })
      navigate('/financiero/cobros')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al registrar el cobro')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarcarPagado = async () => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      await api.patch(`/api/v1/solicitudes/${id}/cobros/pagar`)
      navigate('/financiero/cobros')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al marcar como pagado')
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
        <Link to="/financiero/cobros" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft size={16} /> Volver a cobros
        </Link>
      </div>
    )
  }

  const cobro = solicitud.cobros?.[0]
  const estadoCobro = cobro?.estado
  const tipoLabel = TIPO_LABEL[solicitud.tipoTramite] ?? solicitud.tipoTramite
  const esPendientePago = solicitud.estado === 'PENDIENTE_PAGO'
  const esPagado = solicitud.estado === 'PAGADO' || solicitud.estado === 'APROBADO'

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link to="/financiero/cobros" className="btn-secondary p-2 mt-1 flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-blue-950">{tipoLabel}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: esPagado ? 'rgba(22,163,74,0.1)' : 'rgba(124,58,237,0.1)',
                color: esPagado ? '#16A34A' : '#7C3AED',
                border: `1px solid ${esPagado ? 'rgba(22,163,74,0.3)' : 'rgba(124,58,237,0.3)'}`,
              }}>
              {esPagado ? '✅ Pagado' : esPendientePago ? '💰 Pendiente de pago' : solicitud.estado}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <Clock size={14} />
            Aprobado técnicamente: {formatDateTime(solicitud.dictamenTecnico?.creadoEn ?? solicitud.updatedAt)}
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
          <User size={15} className="text-purple-600" /> Ciudadano
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { l: 'Nombre', v: `${solicitud.ciudadano?.nombre} ${solicitud.ciudadano?.apellido}` },
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

      {/* ── Datos del trámite ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-950 mb-4 flex items-center gap-2 text-sm">
          <MapPin size={15} className="text-purple-600" /> Trámite y Predio
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
      </div>

      {/* ── Dictamen técnico ── */}
      {solicitud.dictamenTecnico && (
        <div className="glass-card p-5" style={{ borderColor: 'rgba(22,163,74,0.3)' }}>
          <h2 className="font-heading font-semibold text-blue-950 mb-3 flex items-center gap-2 text-sm">
            <CheckCircle2 size={15} className="text-green-600" /> Dictamen Técnico (aprobado)
          </h2>
          {solicitud.dictamenTecnico.observaciones && (
            <p className="text-slate-600 text-sm bg-green-50 rounded-xl p-3 border border-green-100">
              {solicitud.dictamenTecnico.observaciones}
            </p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          COBRO YA REGISTRADO — Solo lectura
      ══════════════════════════════════════════ */}
      {cobro && (
        <div className="glass-card p-5" style={{
          borderColor: estadoCobro === 'PAGADO' ? 'rgba(22,163,74,0.4)' : 'rgba(124,58,237,0.3)',
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-blue-950 flex items-center gap-2 text-sm">
              <Receipt size={15} style={{ color: '#7C3AED' }} /> Cobro Registrado
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: estadoCobro === 'PAGADO' ? 'rgba(22,163,74,0.1)' : 'rgba(124,58,237,0.1)',
                color: estadoCobro === 'PAGADO' ? '#16A34A' : '#7C3AED',
                border: `1px solid ${estadoCobro === 'PAGADO' ? 'rgba(22,163,74,0.3)' : 'rgba(124,58,237,0.3)'}`,
              }}>
              {estadoCobro === 'PAGADO' ? '✅ Pagado' : '⏳ Pendiente de pago'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Monto</p>
              <p className="text-2xl font-extrabold text-purple-700">${Number(cobro.monto).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-0.5">Concepto</p>
              <p className="text-blue-950 font-medium">{cobro.concepto}</p>
            </div>
          </div>

          {cobro.notas && (
            <p className="text-slate-500 text-sm bg-slate-50 rounded-xl p-3 border border-slate-200">
              {cobro.notas}
            </p>
          )}

          {/* Botón marcar como pagado si aún está pendiente */}
          {estadoCobro === 'PENDIENTE' && (
            <button onClick={handleMarcarPagado} disabled={submitting}
              className="w-full mt-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #16A34A 0%, #166534 100%)',
                boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
              }}>
              {submitting
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CreditCard size={18} /> Confirmar Pago Recibido</>}
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          FORMULARIO DE COBRO (solo si no hay cobro registrado)
      ══════════════════════════════════════════ */}
      {!cobro && esPendientePago && (
        <div className="glass-card p-5 space-y-5" style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <DollarSign size={20} style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-blue-950">Registrar Cobro</h2>
              <p className="text-slate-400 text-xs">El técnico aprobó este trámite — registra el cobro correspondiente</p>
            </div>
          </div>

          {/* Tarifa referencial */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7C3AED' }}>
              📊 Tarifa referencial
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {Object.entries(TARIFAS_BASE).map(([tipo, base]) => (
                <div key={tipo} className={`p-2 rounded-lg text-center ${solicitud.tipoTramite === tipo ? 'ring-2 ring-purple-400' : ''}`}
                  style={{ background: 'white', border: '1px solid rgba(124,58,237,0.1)' }}>
                  <p className="font-bold text-purple-700">${base}</p>
                  <p className="text-slate-400 text-xs leading-tight">{TIPO_LABEL[tipo]?.split(' ')[0]}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-2">
              + $0.20/m² de área del predio. Monto pre-calculado: <strong className="text-purple-700">${monto}</strong>
            </p>
          </div>

          {/* Monto */}
          <div>
            <label className="input-label">Monto a Cobrar (USD) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                className="input-field pl-8"
                placeholder="0.00"
                id="cobro-monto"
              />
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="input-label">Concepto *</label>
            <input
              type="text"
              value={concepto}
              onChange={e => setConcepto(e.target.value)}
              className="input-field"
              placeholder="Descripción del cobro..."
              id="cobro-concepto"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="input-label">Notas adicionales <span className="text-slate-400 normal-case">— opcional</span></label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Información adicional para el comprobante..."
              id="cobro-notas"
            />
          </div>

          <button
            onClick={handleRegistrarCobro}
            disabled={submitting || !monto || !concepto}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: !monto || !concepto ? '#e2e8f0' : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              color: !monto || !concepto ? '#94a3b8' : 'white',
              boxShadow: monto && concepto ? '0 4px 20px rgba(124,58,237,0.3)' : 'none',
              cursor: !monto || !concepto ? 'not-allowed' : 'pointer',
            }}>
            {submitting
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Receipt size={18} /> Registrar Cobro</>}
          </button>
        </div>
      )}

      {/* Si la solicitud fue pagada y aprobada */}
      {esPagado && (
        <div className="glass-card p-5 text-center" style={{ borderColor: 'rgba(22,163,74,0.4)' }}>
          <CheckCircle2 size={40} className="mx-auto mb-3 text-green-500" />
          <h2 className="font-heading font-bold text-blue-950 text-lg mb-1">Trámite Completado</h2>
          <p className="text-slate-500 text-sm">El ciudadano ha sido notificado de la aprobación y pago de su trámite.</p>
        </div>
      )}
    </div>
  )
}
