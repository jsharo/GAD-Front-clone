import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin, FileText, CheckCircle2, ArrowRight, ArrowLeft,
  AlertCircle, Building2, Upload, X, Factory, Layers, HardHat,
} from 'lucide-react'
import { solicitudesApi, anexosApi } from '@/lib/apiCalls'
import { useAuthStore } from '@/stores/auth.store'
import { CompletarPerfilModal } from '@/components/CompletarPerfilModal'
import { cn } from '@/lib/utils'

// ── Tipos de trámite alineados con enum TipoTramite del backend ──
type TipoTramite = 'LINEA_FABRICAS' | 'APROBACION_PLANOS' | 'PERMISO_CONSTRUCCION'

const TRAMITES: {
  value: TipoTramite
  label: string
  desc: string
  icon: React.ReactNode
  color: string
  docs: string[]
}[] = [
  {
    value: 'LINEA_FABRICAS',
    label: 'Línea de Fábricas',
    desc: 'Certificado que establece el lindero frontal de un predio respecto a la vía pública.',
    icon: <Factory size={28} />,
    color: '#D97706',
    docs: ['Título de propiedad', 'Cédula del propietario', 'Ficha catastral', 'Plano de ubicación'],
  },
  {
    value: 'APROBACION_PLANOS',
    label: 'Aprobación de Planos',
    desc: 'Revisión y aprobación técnica de planos arquitectónicos y estructurales de construcción.',
    icon: <Layers size={28} />,
    color: '#2563EB',
    docs: ['Título de propiedad', 'Planos arquitectónicos', 'Planos estructurales', 'Memoria de cálculo', 'Cédula del propietario'],
  },
  {
    value: 'PERMISO_CONSTRUCCION',
    label: 'Permiso de Construcción',
    desc: 'Autorización municipal para ejecutar obras de construcción, ampliación o remodelación.',
    icon: <HardHat size={28} />,
    color: '#2E8B57',
    docs: ['Título de propiedad', 'Planos aprobados', 'Contrato con profesional', 'Cédula del propietario', 'Pago de impuesto predial'],
  },
]

// ── Schema del paso 1 ──
const step1Schema = z.object({
  tipoTramite: z.enum(['LINEA_FABRICAS', 'APROBACION_PLANOS', 'PERMISO_CONSTRUCCION'] as const),
  ubicacion: z.enum(['URBANO', 'RURAL'] as const),
  direccion: z.string().min(5, 'Ingresa la dirección del predio'),
  area: z.string().optional(),
  descripcion: z.string().optional(),
})
type Step1Form = z.infer<typeof step1Schema>

const STEPS = [
  { num: 1, label: 'Tipo de Trámite', icon: FileText },
  { num: 2, label: 'Datos del Predio', icon: MapPin },
  { num: 3, label: 'Documentos', icon: Upload },
  { num: 4, label: 'Confirmación', icon: CheckCircle2 },
]

export function NuevaSolicitud() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoTramite | null>(null)
  const [solicitudId, setSolicitudId] = useState<string | null>(null)
  const [archivos, setArchivos] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const esInvitado = user?.role === 'INVITADO'

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { ubicacion: 'URBANO' },
  })

  const tramiteInfo = TRAMITES.find(t => t.value === tipoSeleccionado)

  // ── PASO 1: Selección de tipo ──
  const handleSelectTipo = (tipo: TipoTramite) => {
    setTipoSeleccionado(tipo)
    setValue('tipoTramite', tipo)
  }

  const onStep1Next = () => {
    if (!tipoSeleccionado) {
      setError('Selecciona el tipo de trámite para continuar')
      return
    }
    setError(null)
    setStep(2)
  }

  // ── PASO 2: Crear solicitud con datos del predio ──
  const onStep2 = async (data: Step1Form) => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await solicitudesApi.create({
        tipoTramite: tipoSeleccionado,
        ubicacion: data.ubicacion,
        direccion: data.direccion,
        area: data.area,
        descripcion: data.descripcion,
      })
      setSolicitudId(res.id)
      setStep(3)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al crear la solicitud')
    } finally {
      setLoading(false)
    }
  }

  // ── PASO 3: Subir archivos ──
  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const valid = files.filter(f => {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) {
        setError(`"${f.name}" no es un tipo válido (PDF, JPG, PNG)`)
        return false
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(`"${f.name}" supera el límite de 10 MB`)
        return false
      }
      return true
    })
    setArchivos(prev => [...prev, ...valid])
    setError(null)
  }

  const uploadArchivos = async () => {
    if (!solicitudId) return
    setLoading(true)
    setError(null)
    try {
      for (const file of archivos) {
        setUploadProgress(p => ({ ...p, [file.name]: false }))
        await anexosApi.upload(solicitudId, file)
        setUploadProgress(p => ({ ...p, [file.name]: true }))
      }
      setStep(4)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al subir archivos')
    } finally {
      setLoading(false)
    }
  }

  // ── PASO 4: Firmar y enviar ──
  const handleEnviar = async () => {
    if (!solicitudId) return
    setLoading(true)
    setError(null)
    try {
      await solicitudesApi.enviar(solicitudId)
      navigate(`/ciudadano/solicitudes/${solicitudId}`)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">

      {/* Modal: completar perfil si es INVITADO */}
      {esInvitado && (
        <CompletarPerfilModal
          allowClose
          onClose={() => navigate('/ciudadano')}
          onSuccess={() => {}}
        />
      )}

      <div>
        <h1 className="font-heading text-2xl font-bold text-blue-950">Nueva Solicitud</h1>
        <p className="text-blue-800 mt-1 text-sm">Inicia un trámite de ordenamiento territorial ante el GAD Municipal de Cañar</p>
      </div>

      {/* ── Stepper ── */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center gap-1 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0',
              step > s.num ? 'bg-green-500 text-white' :
              step === s.num ? 'bg-blue-600 text-white shadow-lg' :
              'bg-slate-200 text-slate-500',
            )}>
              {step > s.num ? <CheckCircle2 size={14} /> : s.num}
            </div>
            <span className={cn(
              'text-xs font-medium hidden sm:block',
              step >= s.num ? 'text-blue-950' : 'text-slate-400'
            )}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-px ml-1', step > s.num ? 'bg-green-500' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════
          PASO 1: Selección de tipo de trámite
      ══════════════════════════════════════ */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="font-heading font-semibold text-blue-950 mb-1">Selecciona el tipo de trámite</h2>
            <p className="text-slate-500 text-sm mb-5">El GAD Municipal ofrece tres procesos de ordenamiento territorial</p>

            <div className="space-y-3">
              {TRAMITES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleSelectTipo(t.value)}
                  className={cn(
                    'w-full text-left p-5 rounded-2xl border-2 transition-all group',
                    tipoSeleccionado === t.value
                      ? 'shadow-lg'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  )}
                  style={tipoSeleccionado === t.value ? {
                    borderColor: t.color,
                    background: `${t.color}08`,
                    boxShadow: `0 4px 24px ${t.color}20`,
                  } : {}}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl flex-shrink-0 transition-all"
                      style={{
                        background: tipoSeleccionado === t.value ? `${t.color}20` : 'rgba(0,0,0,0.04)',
                        color: tipoSeleccionado === t.value ? t.color : '#64748b',
                      }}>
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-blue-950 text-base">{t.label}</p>
                        {tipoSeleccionado === t.value && (
                          <CheckCircle2 size={20} style={{ color: t.color }} />
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">{t.desc}</p>
                      
                      {/* Documentos requeridos */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {t.docs.slice(0, 3).map(doc => (
                          <span key={doc} className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: tipoSeleccionado === t.value ? `${t.color}15` : 'rgba(0,0,0,0.04)',
                              color: tipoSeleccionado === t.value ? t.color : '#64748b',
                              border: `1px solid ${tipoSeleccionado === t.value ? `${t.color}30` : 'rgba(0,0,0,0.08)'}`,
                            }}>
                            {doc}
                          </span>
                        ))}
                        {t.docs.length > 3 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: '#94a3b8' }}>
                            +{t.docs.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onStep1Next}
            disabled={!tipoSeleccionado}
            id="step1-next"
            className="btn-primary w-full"
          >
            <span>Continuar</span><ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════
          PASO 2: Datos del predio
      ══════════════════════════════════════ */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onStep2 as unknown as Parameters<typeof handleSubmit>[0])} className="space-y-4">
          {/* Banner del tipo seleccionado */}
          {tramiteInfo && (
            <div className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: `${tramiteInfo.color}10`, border: `1px solid ${tramiteInfo.color}30` }}>
              <div style={{ color: tramiteInfo.color }}>{tramiteInfo.icon}</div>
              <div>
                <p className="font-bold text-blue-950 text-sm">{tramiteInfo.label}</p>
                <p className="text-slate-500 text-xs">Completa los datos del predio</p>
              </div>
            </div>
          )}

          <div className="glass-card p-6 space-y-5">
            {/* Ubicación */}
            <div>
              <label className="input-label">Ubicación del Predio *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['URBANO', 'RURAL'] as const).map(u => (
                  <label key={u} className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                    watch('ubicacion') === u
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}>
                    <input {...register('ubicacion')} type="radio" value={u} className="sr-only" />
                    <Building2 size={18} className={watch('ubicacion') === u ? 'text-blue-600' : 'text-slate-400'} />
                    <span className={cn('font-medium text-sm', watch('ubicacion') === u ? 'text-blue-700' : 'text-blue-800')}>
                      {u === 'URBANO' ? '🏙️ Urbano' : '🌾 Rural'}
                    </span>
                  </label>
                ))}
              </div>
              {errors.ubicacion && <p className="input-error"><AlertCircle size={12} />{errors.ubicacion.message}</p>}
            </div>

            {/* Dirección */}
            <div>
              <label className="input-label">Dirección del Predio *</label>
              <input {...register('direccion')} id="predio-direccion" className="input-field"
                placeholder="Av. Los Cerezos y Calle 5, sector norte" />
              {errors.direccion && <p className="input-error"><AlertCircle size={12} />{errors.direccion.message}</p>}
            </div>

            {/* Área */}
            <div>
              <label className="input-label">Área del Predio (m²) <span className="text-slate-400 normal-case">— opcional</span></label>
              <input {...register('area')} type="number" step="0.01" id="predio-area" className="input-field" placeholder="150.5" />
            </div>

            {/* Descripción */}
            <div>
              <label className="input-label">Descripción adicional <span className="text-slate-400 normal-case">— opcional</span></label>
              <textarea {...register('descripcion')} id="predio-descripcion" className="input-field resize-none" rows={3}
                placeholder="Información adicional sobre el predio o el trámite..." />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
              <ArrowLeft size={18} /> Atrás
            </button>
            <button type="submit" disabled={loading} id="step2-next" className="btn-primary flex-1">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Siguiente</span><ArrowRight size={18} /></>}
            </button>
          </div>
        </form>
      )}

      {/* ══════════════════════════════════════
          PASO 3: Documentos
      ══════════════════════════════════════ */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-5">
            <div>
              <h2 className="font-heading font-semibold text-blue-950 mb-1">Adjunta los documentos requeridos</h2>
              <p className="text-slate-500 text-sm">Escaneados en PDF o fotos JPG/PNG. Máximo 10 MB por archivo.</p>
            </div>

            {/* Lista de documentos sugeridos */}
            {tramiteInfo && (
              <div className="p-4 rounded-xl" style={{ background: `${tramiteInfo.color}08`, border: `1px solid ${tramiteInfo.color}20` }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tramiteInfo.color }}>
                  📋 Documentos requeridos para {tramiteInfo.label}
                </p>
                <ul className="space-y-1">
                  {tramiteInfo.docs.map(doc => (
                    <li key={doc} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tramiteInfo.color }} />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Zona de carga */}
            <label className="block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition-all group bg-white">
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileAdd} className="sr-only" id="file-upload" />
              <Upload size={32} className="text-slate-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
              <p className="text-slate-600 group-hover:text-blue-700 transition-colors font-medium">
                Haz clic o arrastra archivos aquí
              </p>
              <p className="text-slate-400 text-sm mt-1">PDF, JPG, PNG — máximo 10 MB</p>
            </label>

            {/* Lista de archivos */}
            {archivos.length > 0 && (
              <div className="space-y-2">
                {archivos.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <FileText size={18} className="text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-blue-950 text-sm font-medium truncate">{f.name}</p>
                      <p className="text-slate-400 text-xs">{(f.size / 1024).toFixed(1)} KB</p>
                    </div>
                    {uploadProgress[f.name] === true && <CheckCircle2 size={16} className="text-green-500" />}
                    <button type="button"
                      onClick={() => setArchivos(prev => prev.filter((_, j) => j !== i))}
                      className="text-slate-400 hover:text-red-500 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
              <ArrowLeft size={18} /> Atrás
            </button>
            <button type="button" id="step3-upload" disabled={loading || archivos.length === 0}
              onClick={uploadArchivos} className="btn-primary flex-1">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Upload size={18} /> Subir y continuar</>}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          PASO 4: Confirmación y firma
      ══════════════════════════════════════ */}
      {step === 4 && (
        <div className="glass-card p-6 space-y-5">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="font-heading font-bold text-blue-950 text-xl mb-2">¡Todo listo para enviar!</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Al confirmar, se generará tu <strong className="text-blue-950">firma digital</strong> y la solicitud
              será enviada a la Secretaría del GAD para verificación documental.
            </p>
          </div>

          {/* Resumen */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
            {tramiteInfo && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: `${tramiteInfo.color}15`, color: tramiteInfo.color }}>
                  {tramiteInfo.icon}
                </div>
                <div>
                  <p className="font-bold text-blue-950 text-sm">{tramiteInfo.label}</p>
                  <p className="text-slate-400 text-xs">Tipo de trámite seleccionado</p>
                </div>
              </div>
            )}
            <div className="h-px bg-slate-200" />
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle2 size={14} /> Datos del predio registrados
            </div>
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle2 size={14} /> {archivos.length} documento(s) adjuntado(s)
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
              <FileText size={14} /> Firma digital lista para aplicar
            </div>
          </div>

          {/* Flujo de revisión */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)' }}>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Flujo de revisión</p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: 'Secretaría', desc: 'Verifica docs', color: '#D97706' },
                { label: 'Técnico', desc: 'Evalúa contenido', color: '#2E8B57' },
                { label: 'Financiero', desc: 'Gestiona cobro', color: '#7C3AED' },
                { label: 'Tú', desc: 'Recibes resultado', color: '#2563EB' },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto"
                      style={{ background: item.color }}>
                      {i + 1}
                    </div>
                    <p className="text-xs font-semibold mt-1" style={{ color: item.color }}>{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  {i < arr.length - 1 && <ArrowRight size={14} className="text-slate-300 flex-shrink-0 mb-4" />}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-200 pt-4">
            Al firmar y enviar, confirmas que los datos son verídicos y aceptas su verificación técnica.
            La firma es válida bajo la normativa ecuatoriana de firma electrónica.
            <span className="text-yellow-500"> [Entorno de prueba: firma simulada]</span>
          </p>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1">
              <ArrowLeft size={18} /> Atrás
            </button>
            <button type="button" id="step4-firmar" disabled={loading} onClick={handleEnviar} className="btn-success flex-1">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><FileText size={18} /> Firmar y Enviar</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
