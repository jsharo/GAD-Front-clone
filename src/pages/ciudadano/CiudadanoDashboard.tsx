import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText, Clock, CheckCircle2, XCircle, PlusCircle, ArrowRight,
  Factory, Layers, HardHat, ShieldCheck, AlertTriangle,
  Lock, UserCheck, Star, Zap, Eye,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { CompletarPerfilModal } from '@/components/CompletarPerfilModal'
import { SolicitudTimeline } from '@/components/SolicitudTimeline'
import { solicitudesApi } from '@/lib/apiCalls'

interface Solicitud {
  id: string
  estado: string
  tipoTramite: string
  predio?: { direccion: string }
  createdAt: string
}

const TRAMITES = [
  { value: 'LINEA_FABRICAS',       label: 'Línea de Fábricas',      icon: Factory, color: '#D97706', tiempo: '3–5 días', desc: 'Certificado de retiro y alineamiento del predio respecto a la vía pública.' },
  { value: 'APROBACION_PLANOS',    label: 'Aprobación de Planos',   icon: Layers,  color: '#2563EB', tiempo: '5–10 días', desc: 'Revisión técnica municipal de planos arquitectónicos y estructurales.' },
  { value: 'PERMISO_CONSTRUCCION', label: 'Permiso de Construcción', icon: HardHat, color: '#16A34A', tiempo: '7–12 días', desc: 'Autorización para ejecutar obras de construcción, ampliación o remodelación.' },
]

// ─── VISTA INVITADO ───────────────────────────────────────────────────────────

function InvitadoDashboard({ email }: { email?: string }) {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const LIMITACIONES = [
    { icon: Eye,      label: 'Puedes hacer',    items: ['Ver trámites disponibles', 'Revisar requisitos', 'Explorar el portal'], ok: true },
    { icon: Lock,     label: 'Requiere perfil', items: ['Enviar solicitudes', 'Subir documentos', 'Firmar digitalmente'], ok: false },
  ]

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Banner principal de activación ── */}
      <div className="relative overflow-hidden rounded-3xl border-2 bg-white"
        style={{ borderColor: 'rgba(245,193,0,0.5)', background: 'linear-gradient(135deg,#fffbeb 0%,#fff 60%)' }}>

        {/* Decorador fondo */}
        <div className="absolute right-0 top-0 w-64 h-64 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'url(/logo-gad.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'right top' }} />

        <div className="relative z-10 p-6 md:p-8">
          {/* Badge de estado */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
            style={{ background: 'rgba(245,193,0,0.15)', border: '1.5px solid rgba(245,193,0,0.4)', color: '#D97706' }}>
            <AlertTriangle size={13} />
            ACCESO LIMITADO — Perfil sin completar
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-blue-950 mb-3">
                Bienvenido, <span style={{ color: '#D97706' }}>{email?.split('@')[0] || 'visitante'}</span>
              </h1>
              <p className="text-slate-600 leading-relaxed mb-6 max-w-lg">
                Entraste como <strong className="text-blue-950">Invitado</strong>. Puedes explorar el portal y los trámites,
                pero para enviar una solicitud necesitas <strong className="text-blue-950">verificar tu identidad</strong> completando
                tu perfil con tu nombre, cédula y contraseña.
              </p>

              {/* Qué puede y qué no */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {LIMITACIONES.map(({ icon: Icon, label, items, ok }) => (
                  <div key={label} className="p-4 rounded-2xl border"
                    style={{
                      background: ok ? 'rgba(34,197,94,0.04)' : 'rgba(234,88,12,0.04)',
                      borderColor: ok ? 'rgba(34,197,94,0.2)' : 'rgba(234,88,12,0.2)',
                    }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={14} style={{ color: ok ? '#16A34A' : '#EA580C' }} />
                      <span className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: ok ? '#15803D' : '#C2410C' }}>{label}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {items.map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                          {ok
                            ? <CheckCircle2 size={13} style={{ color: '#16A34A', flexShrink: 0 }} />
                            : <Lock size={13} style={{ color: '#EA580C', flexShrink: 0 }} />
                          }
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg,#D97706,#F59E0B)', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' }}>
                  <UserCheck size={18} />
                  Verificar mi identidad — Es gratis
                </button>
                <a href="#tramites-info"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  <Eye size={16} /> Ver trámites
                </a>
              </div>
            </div>

            {/* Panel pasos rápidos */}
            <div className="w-full lg:w-72 flex-shrink-0 p-5 rounded-2xl"
              style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.1)' }}>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-4">
                Para activar tu cuenta necesitas:
              </p>
              <ul className="space-y-3">
                {[
                  { num: 1, label: 'Nombre y apellido completos' },
                  { num: 2, label: 'Número de cédula (10 dígitos)' },
                  { num: 3, label: 'Teléfono (opcional)' },
                  { num: 4, label: 'Contraseña para futuros accesos' },
                ].map(({ num, label }) => (
                  <li key={num} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                      style={{ background: '#2563EB' }}>{num}</span>
                    <span className="text-sm text-slate-600">{label}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowModal(true)}
                className="mt-5 w-full py-2.5 rounded-xl text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                Completar ahora →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trámites disponibles (solo informativo) ── */}
      <div id="tramites-info">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={16} className="text-slate-400" />
          <h2 className="font-heading font-bold text-blue-950">Trámites disponibles <span className="text-slate-400 font-normal text-sm">(solo lectura)</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRAMITES.map(t => (
            <div key={t.value} className="glass-card p-5 relative overflow-hidden">
              {/* Overlay de bloqueo */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(234,88,12,0.08)', color: '#EA580C', border: '1px solid rgba(234,88,12,0.2)' }}>
                <Lock size={10} /> Requiere verificación
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${t.color}12`, color: t.color }}>
                <t.icon size={22} />
              </div>
              <h3 className="font-heading font-bold text-blue-950 text-sm mb-1">{t.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{t.desc}</p>
              <span className="text-xs font-bold" style={{ color: t.color }}>⏱ {t.tiempo}</span>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: `${t.color}12`, color: t.color, border: `1px dashed ${t.color}40` }}>
                Verificar para iniciar →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de completar perfil */}
      {showModal && (
        <CompletarPerfilModal
          allowClose
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); navigate('/ciudadano') }}
        />
      )}
    </div>
  )
}

// ─── VISTA CIUDADANO VERIFICADO ──────────────────────────────────────────────

export function CiudadanoDashboard() {
  const { user } = useAuthStore()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'INVITADO') {
      setLoading(false)
      return
    }
    const fetchSol = async () => {
      try {
        setLoading(true)
        const { data } = await solicitudesApi.misSolicitudes()
        const rawList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
        setSolicitudes(rawList)
      } catch (e) {
        console.error('Error cargando solicitudes dashboard:', e)
        setSolicitudes([])
      } finally {
        setLoading(false)
      }
    }
    fetchSol()
  }, [user?.role])

  // ── Render Invitado ──
  if (user?.role === 'INVITADO') {
    return <InvitadoDashboard email={user?.email} />
  }

  const stats = [
    { label: 'Total', value: solicitudes.length, icon: FileText, color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    { label: 'En Proceso', value: solicitudes.filter(s => ['EN_REVISION','INSPECCION','COBRO_PENDIENTE'].includes(s.estado)).length, icon: Clock, color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
    { label: 'Aprobadas', value: solicitudes.filter(s => s.estado === 'APROBADO').length, icon: CheckCircle2, color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
    { label: 'Negadas', value: solicitudes.filter(s => s.estado === 'NEGADO').length, icon: XCircle, color: '#CC2229', bg: 'rgba(204,34,41,0.08)' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header con badge verificado ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading text-2xl font-bold text-blue-950">
              Hola, {user?.nombre || 'Usuario'} 👋
            </h1>
            {/* Badge verificado */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(22,163,74,0.1)', border: '1.5px solid rgba(22,163,74,0.3)', color: '#15803D' }}>
              <ShieldCheck size={12} />
              Ciudadano verificado
            </div>
          </div>
          <p className="text-slate-500 text-sm">Gestiona tus trámites de ordenamiento territorial desde aquí.</p>
        </div>
        <Link to="/ciudadano/solicitudes/nueva" className="btn-primary flex-shrink-0">
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Nueva Solicitud</span>
          <span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <span className="text-2xl font-heading font-bold text-blue-950">{stat.value}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Accesos rápidos a trámites ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} style={{ color: '#D97706' }} />
          <h2 className="font-heading font-semibold text-blue-950">Iniciar un trámite</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRAMITES.map(t => (
            <Link key={t.value} to="/ciudadano/solicitudes/nueva"
              className="p-4 rounded-xl border bg-white hover:bg-slate-50 transition-all group flex items-start gap-3 hover:border-blue-200"
              style={{ borderColor: '#e2e8f0' }}>
              <div className="p-2.5 rounded-xl flex-shrink-0 transition-all"
                style={{ background: `${t.color}12`, color: t.color }}>
                <t.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-blue-950 text-sm group-hover:text-blue-700 transition-colors">{t.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">⏱ {t.tiempo}</p>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 ml-auto flex-shrink-0 mt-0.5 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Solicitudes recientes ── */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-heading font-semibold text-blue-950">Solicitudes Recientes</h2>
          <Link to="/ciudadano/solicitudes"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl shimmer" />)}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-blue-300" />
            </div>
            <p className="font-semibold text-blue-950 mb-1">Sin solicitudes aún</p>
            <p className="text-slate-400 text-sm mb-5">Crea tu primera solicitud de trámite municipal</p>
            <Link to="/ciudadano/solicitudes/nueva" className="btn-primary inline-flex">
              <PlusCircle size={16} /> Crear mi primera solicitud
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
             {solicitudes.slice(0, 5).map(sol => {
               const safeId = typeof sol.id === 'string' ? sol.id : String(sol.id || '')
               const displayId = safeId ? safeId.slice(0, 8).toUpperCase() : 'N/A'
               return (
                 <Link key={safeId} to={`/ciudadano/solicitudes/${safeId}`}
                   className="block p-5 hover:bg-slate-50 transition-colors group">
                   <div className="flex items-center gap-4 mb-3">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                       <FileText size={18} className="text-blue-500" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-blue-950 text-sm truncate">{sol.tipoTramite || 'Ordenamiento Territorial'}</p>
                       <p className="text-slate-400 text-xs">#{displayId} · {sol.predio?.direccion || '—'}</p>
                     </div>
                     <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                   </div>
                   <div className="ml-14">
                     <SolicitudTimeline estadoActual={sol.estado || 'BORRADOR'} />
                   </div>
                 </Link>
               )
             })}
          </div>
        )}
      </div>

      {/* ── Beneficios de la cuenta verificada ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ShieldCheck, color: '#16A34A', title: 'Firma digital válida', desc: 'Tus solicitudes tienen validez legal bajo normativa ecuatoriana.' },
          { icon: Clock, color: '#2563EB', title: 'Seguimiento en tiempo real', desc: 'Monitorea cada etapa del proceso: Secretaría, Técnico, Financiero.' },
          { icon: Star, color: '#D97706', title: 'Historial completo', desc: 'Accede a todas tus solicitudes pasadas con sus resoluciones.' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="glass-card p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}12` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p className="font-semibold text-blue-950 text-sm">{title}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
