import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Shield, Clock, FileText, CheckCircle2, Star, MapPin, Users,
  Search, HardHat, XCircle, AlertCircle, Loader, HelpCircle
} from 'lucide-react'
import { applications_api } from '@/lib/api.calls'

const STATS = [
  { value: '3,200+', label: 'Planos y Proyectos Aprobados', icon: FileText },
  { value: '48h', label: 'Tiempo Promedio de Revisión', icon: Clock },
  { value: '250+', label: 'Profesionales Habilitados', icon: Star },
  { value: '12', label: 'Analistas Técnicos GAD', icon: Users },
]

const FEATURES = [
  {
    icon: FileText,
    title: 'Línea de Fábrica Digital',
    desc: 'Obtención rápida de informes de regulación urbana y compatibilidad de uso de suelo.',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.06)',
    border: 'rgba(37,99,235,0.15)',
  },
  {
    icon: Shield,
    title: 'Aprobación de Planos',
    desc: 'Envío técnico de proyectos arquitectónicos y estructurales para revisión ágil de los analistas.',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.15)',
  },
  {
    icon: MapPin,
    title: 'Permisos de Construcción',
    desc: 'Licenciamiento de edificación 100% en línea para áreas urbanas y rurales del cantón.',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.06)',
    border: 'rgba(34,197,94,0.15)',
  },
]

const PROCEDURE_TYPE_LABELS: Record<string, string> = {
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
}

const STATUS_INFO: Record<string, { label: string; color: string; bg: string; step: number }> = {
  BORRADOR: { label: 'Borrador (Pendiente Envío)', color: '#64748B', bg: '#F1F5F9', step: 1 },
  PENDIENTE_SECRETARIA: { label: 'Enviado (Espera Validación Documental)', color: '#F5C100', bg: 'rgba(245,193,0,0.1)', step: 1 },
  OBSERVADO: { label: 'Observado por Secretaría (Devuelto)', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', step: 2 },
  EN_REVISION_TECNICA: { label: 'En Revisión Técnica', color: '#2563EB', bg: 'rgba(37,99,235,0.1)', step: 2 },
  PENDIENTE_PAGO: { label: 'Aprobado (Pendiente de Pago)', color: '#F5C100', bg: 'rgba(245,193,0,0.1)', step: 3 },
  PAGADO: { label: 'Pago Registrado (En Firma Final)', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', step: 3 },
  APROBADO: { label: 'Aprobado y Concluido', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', step: 4 },
  RECHAZADO: { label: 'Rechazado Definitivamente', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', step: 4 },
}

export function LandingPage() {
  const [search_val, set_search_val] = useState('')
  const [is_loading, set_is_loading] = useState(false)
  const [error_msg, set_error_msg] = useState<string | null>(null)
  const [tracking_result, set_tracking_result] = useState<any>(null)
  const [is_modal_open, set_is_modal_open] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search_val.trim()) return

    set_is_loading(true)
    set_error_msg(null)
    set_tracking_result(null)

    try {
      const is_email = search_val.includes('@')
      const params = is_email ? { email: search_val.trim() } : { national_id: search_val.trim() }
      
      const { data } = await applications_api.publicTracking(params)
      
      if (!data.solicitudes || data.solicitudes.length === 0) {
        set_error_msg('El ciudadano se encuentra registrado, pero aún no tiene ningún trámite ingresado.')
      } else {
        set_tracking_result(data)
        set_is_modal_open(true)
      }
    } catch (err: any) {
      set_error_msg(
        err.response?.data?.message || 
        'No se encontraron registros que coincidan con la cédula o correo ingresado.'
      )
    } finally {
      set_is_loading(false)
    }
  }

  // Map backend response properties to snake_case English for template use
  const citizen = tracking_result?.ciudadano ? {
    first_name: tracking_result.ciudadano.nombre,
    last_name: tracking_result.ciudadano.apellido
  } : null

  const applications = (tracking_result?.solicitudes || []).map((sol: any) => ({
    id: sol.id,
    procedure_type: sol.tipoTramite,
    address: sol.direccion,
    location: sol.ubicacion,
    status: sol.estado,
    observations: sol.observaciones,
    rejection_reason: sol.motivoRechazo,
    payment: sol.cobro ? {
      concept: sol.cobro.concepto,
      amount: sol.cobro.monto
    } : null,
    updated_at: sol.updatedAt
  }))

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50 font-sans">

      {/* NAVBAR PROTOTIPO */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-all duration-300">
        {/* Fila 1: Logo y Acciones */}
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo e Identidad */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-gad.png"
              alt="GAD Municipal de Cañar"
              className="w-11 h-11 object-contain"
            />
            <div className="flex items-center">
              <div className="text-left">
                <p className="font-heading font-black text-xl leading-none text-blue-600 tracking-tight">
                  CAÑAR
                </p>
                <p className="text-[#D4A800] font-bold text-[9px] tracking-wider uppercase mt-0.5">
                  Cantón Intercultural
                </p>
              </div>
              {/* Franja de Colores del Prototipo */}
              <div className="flex flex-col gap-[3px] ml-4 justify-center h-7 border-l pl-3 border-slate-200">
                <div className="w-5 h-[3px] bg-[#EF4444]" />
                <div className="w-5 h-[3px] bg-[#F97316]" />
                <div className="w-5 h-[3px] bg-[#F5C100]" />
                <div className="w-5 h-[3px] bg-[#22C55E]" />
                <div className="w-5 h-[3px] bg-[#2563EB]" />
              </div>
            </div>
          </div>

          {/* Buscador Central (Estilo Prototipo) */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar trámites o servicios..." 
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Acceso y Registro */}
          <div className="flex items-center gap-4">
            <Link to="/auth/signin" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors">
              <span className="w-5 h-5 flex items-center justify-center border border-slate-300 rounded-lg text-slate-500">→</span>
              Sign In
            </Link>
            <Link to="/auth/signup" className="btn-primary px-4 py-2 text-xs shadow-md">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Fila 2: Enlaces de Navegación */}
        <div className="border-t border-slate-100 bg-white/95">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-start gap-8 overflow-x-auto text-xs font-bold tracking-wider text-slate-600">
            <a href="#inicio" className="text-blue-600 border-b-2 border-[#F5C100] pb-1 hover:text-blue-700">INICIO</a>
            <a href="#servicios" className="hover:text-blue-600 transition-colors">TRÁMITES TÉCNINES</a>
            <a href="#seguimiento" className="hover:text-blue-600 transition-colors">CONSULTA EXPEDIENTES</a>
            <a href="#registro-profesional" className="hover:text-blue-600 transition-colors">HABILITACIÓN PROFESIONAL</a>
            <a href="#noticias" className="hover:text-blue-600 transition-colors">NOTICIAS GAD</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION CLARO */}
      <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-slate-50 to-white py-16 lg:py-24 border-b border-slate-100">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-[120px] pointer-events-none -mr-40" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Heading and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)', color: '#2563EB', fontSize: '0.75rem', fontWeight: 600 }}>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              PORTAL TÉCNICO DE PLANIFICACIÓN TERRITORIAL · GAD CAÑAR
            </div>

            <h1 className="font-heading font-extrabold leading-tight text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight">
              Gestión Profesional <br/>
              <span className="text-blue-600">de Proyectos y Planos</span>.
            </h1>

            <p className="text-base text-slate-600 max-w-xl leading-relaxed">
              Plataforma oficial para arquitectos, ingenieros civiles y profesionales técnicos. Gestione de forma 100% digital la aprobación de planos, líneas de fábrica y permisos de edificación en el cantón Cañar.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/login" className="btn-primary text-base px-8 py-3.5 shadow-lg">
                Ingresar al Portal
                <ArrowRight size={18} />
              </Link>
              <a href="#registro-profesional" className="btn-secondary text-base px-8 py-3.5">
                Registrarme como Profesional
              </a>
            </div>

            {/* Check Features del Prototipo */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-blue-500" /> Firma Electrónica (XAdES-BES)</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-green-500" /> Revisión Ágil</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-amber-500" /> Trazabilidad Completa</span>
            </div>
          </div>

          {/* Right Column: Escudo Flotante y Tarjetas Estadísticas */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-8 lg:py-0">
            {/* Brillo circular detrás del escudo */}
            <div className="absolute w-72 h-72 rounded-full bg-blue-200/20 blur-3xl" />
            
            {/* Escudo del GAD Cañar en el centro */}
            <div className="relative z-10 w-44 h-56 bg-white/70 backdrop-blur-sm p-4 rounded-3xl border border-white/60 shadow-xl flex items-center justify-center">
              <img
                src="/logo-gad.png"
                alt="Escudo de Cañar"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>

            {/* Tarjeta Flotante 1 (Trámites) */}
            <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl px-4 py-2.5 shadow-lg flex flex-col items-start min-w-[100px] text-left hover:scale-105 transition-transform">
              <span className="text-blue-600 font-extrabold text-sm leading-none">3,200+</span>
              <span className="text-slate-500 text-[10px] font-bold mt-0.5">Planos Aprobados</span>
            </div>

            {/* Tarjeta Flotante 2 (Promedio) */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl px-4 py-2.5 shadow-lg flex flex-col items-start min-w-[100px] text-left hover:scale-105 transition-transform">
              <span className="text-amber-500 font-extrabold text-sm leading-none">48h</span>
              <span className="text-slate-500 text-[10px] font-bold mt-0.5">Revisión Técnica</span>
            </div>

            {/* Tarjeta Flotante 3 (Satisfacción) */}
            <div className="absolute bottom-12 right-2 z-20 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl px-4 py-2.5 shadow-lg flex flex-col items-start min-w-[110px] text-left hover:scale-105 transition-transform">
              <span className="text-green-600 font-extrabold text-sm leading-none">250+</span>
              <span className="text-slate-500 text-[10px] font-bold mt-0.5">Profesionales</span>
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓN: SEGUIMIENTO DE TRÁMITES */}
      <section id="seguimiento" className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-50 border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-[#F5C100] to-green-500" />
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 text-left">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <Search size={18} className="text-blue-600" />
                  Consulta de Expedientes Técnicos
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Consulte el estado de las solicitudes patrocinadas en nombre de su cliente ingresando la cédula del propietario o correo electrónico.
                </p>
              </div>

              <div className="md:col-span-7">
                <form onSubmit={handleTrack} className="space-y-3">
                  <div className="relative">
                    <input
                      id="trackInput"
                      type="text"
                      className="input-field pl-4 pr-12 py-3.5 bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 text-xs rounded-2xl"
                      placeholder="Cédula del propietario o correo del expediente"
                      value={search_val}
                      onChange={(e) => { set_search_val(e.target.value); set_error_msg(null) }}
                    />
                    <button
                      type="submit"
                      disabled={is_loading || !search_val.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {is_loading ? <Loader size={15} className="animate-spin" /> : <Search size={15} />}
                    </button>
                  </div>

                  {error_msg && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-left">
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{error_msg}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL PROFESIONALES: CLARO */}
      <section id="registro-profesional" className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
            <HardHat size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Registro y Habilitación de Firmas Técnicas</h2>
          <p className="text-slate-500 max-w-xl mx-auto mt-2 text-sm leading-relaxed">
            Si eres Arquitecto o Ingeniero Civil y requieres ingresar expedientes urbanísticos en nombre de tus clientes, solicita tu registro profesional para comenzar a operar de inmediato.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6 text-left">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 flex-shrink-0">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-lg">Registro de Profesional Acreditado</h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-green-50 text-green-700 border border-green-200">
                Habilitación Inmediata
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Completa tus datos personales, título profesional y número de registro SENESCYT. Podrás iniciar sesión e ingresar expedientes técnicos inmediatamente. Tus credenciales profesionales y título se validarán con la copia de tu cédula al momento de iniciar tu primer trámite.
            </p>
            <div className="pt-2">
              <Link
                to="/register-architect"
                className="btn-primary w-full sm:w-auto px-6 py-3 text-xs bg-slate-900 hover:bg-slate-800 shadow-none border-none text-white flex items-center justify-center gap-2"
              >
                Crear Cuenta Profesional <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION CLARA */}
      <section className="bg-slate-100/50 py-12 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-extrabold text-blue-600 mb-1">{s.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES CLARAS */}
      <section id="servicios" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900">Trámites Técnicos Habilitados</h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
            Gestión optimizada y control digital completo sobre las solicitudes técnicas municipales.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-sm flex flex-col items-start space-y-4 text-left hover:shadow-md transition-shadow">
              <div className="p-3 rounded-2xl" style={{ background: f.bg }}>
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{f.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CLARO */}
      <footer className="bg-slate-100 border-t border-slate-200 text-slate-600 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <img src="/logo-gad.png" alt="GAD Cañar" className="w-11 h-11 object-contain mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            GAD Municipal de Cañar — Sistema de Planificación y Trámites Técnicos
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            © {new Date().getFullYear()} GAD Cañar. Todos los derechos reservados.
            <br />
            Plataforma para profesionales acreditados de la construcción. Soporte de firma digital oficial del Ecuador.
          </p>
        </div>
      </footer>

      {/* MODAL: TRACKING DE TRÁMITE */}
      {is_modal_open && tracking_result && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => set_is_modal_open(false)} />
          
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col text-left">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Estado de Trámites</h3>
                {citizen && (
                  <p className="text-xs text-slate-500">Propietario: {citizen.first_name} {citizen.last_name}</p>
                )}
              </div>
              <button
                onClick={() => set_is_modal_open(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {applications.map((sol: any) => {
                const info = STATUS_INFO[sol.status] || { label: sol.status, color: '#64748b', bg: '#f1f5f9', step: 1 }
                
                return (
                  <div key={sol.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded">
                          ID: #{sol.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h4 className="font-bold text-slate-800 text-base mt-1">
                          {PROCEDURE_TYPE_LABELS[sol.procedure_type] || sol.procedure_type}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {sol.address} ({sol.location})
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full w-max text-center"
                        style={{ color: info.color, background: info.bg }}>
                        {info.label}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="relative flex justify-between items-center max-w-md mx-auto">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 z-0 transition-all duration-500" 
                             style={{ width: `${(Math.max(0, info.step - 1) / 3) * 100}%` }} />

                        {[
                          { num: 1, label: 'Ingreso' },
                          { num: 2, label: 'Revisión' },
                          { num: 3, label: 'Pago Tasas' },
                          { num: 4, label: 'Finalizado' }
                        ].map((s) => {
                          const is_past = info.step > s.num
                          const is_active = info.step === s.num

                          let bg_circle = 'bg-slate-200 text-slate-400'
                          let ring_class = ''

                          if (is_past) {
                            bg_circle = 'bg-green-500 text-white'
                          } else if (is_active) {
                            bg_circle = 'bg-blue-600 text-white font-bold'
                            ring_class = 'ring-4 ring-blue-500/20'
                          }

                          return (
                            <div key={s.num} className="flex flex-col items-center relative z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${bg_circle} ${ring_class}`}>
                                {is_past ? '✓' : s.num}
                              </div>
                              <span className={`text-[10px] mt-1.5 font-bold ${is_active ? 'text-blue-600' : 'text-slate-500'}`}>
                                {s.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {sol.status === 'OBSERVADO' && sol.observations && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                        <p className="font-bold flex items-center gap-1.5 mb-1 text-red-900">
                          <AlertCircle size={14} /> Observación documental a subsanar:
                        </p>
                        <p>{sol.observations}</p>
                      </div>
                    )}

                    {sol.status === 'RECHAZADO' && sol.rejection_reason && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                        <p className="font-bold flex items-center gap-1.5 mb-1 text-red-900">
                          <XCircle size={14} /> Motivo del rechazo técnico:
                        </p>
                        <p>{sol.rejection_reason}</p>
                      </div>
                    )}

                    {sol.status === 'PENDIENTE_PAGO' && sol.payment && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-amber-950">Monto Liquidado a Pagar:</p>
                          <p className="text-slate-500">{sol.payment.concept}</p>
                        </div>
                        <span className="text-lg font-black text-amber-600">${sol.payment.amount}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 text-right">
                      Última actualización: {new Date(sol.updated_at).toLocaleDateString('es-EC')} a las {new Date(sol.updated_at).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4 mt-4 text-center">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <HelpCircle size={12} /> Para soporte adicional, contacta al departamento de Planificación GAD Cañar.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
