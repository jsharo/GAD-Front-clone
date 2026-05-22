import { Link } from 'react-router-dom'
import {
  ArrowRight, FileText, CheckCircle2, Clock, Users, Shield,
  MapPin, Zap, Star, AlertCircle, BookOpen, MousePointer,
  Upload, Eye, Award, ChevronRight, Building2, Layers, HardHat, Factory,
} from 'lucide-react'
import { LandingTopbar } from '@/components/LandingTopbar'

// ─── Datos ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '3,200+', label: 'Trámites procesados', icon: FileText },
  { value: '48h', label: 'Tiempo promedio', icon: Clock },
  { value: '98%', label: 'Satisfacción', icon: Star },
  { value: '12', label: 'Técnicos activos', icon: Users },
]

const TRAMITES_DETALLE = [
  {
    icon: Factory,
    color: '#D97706',
    bg: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.25)',
    tag: 'Más solicitado',
    title: 'Línea de Fábricas',
    desc: 'Certificado oficial que determina el lindero frontal de un predio respecto a la vía pública. Indispensable para cualquier obra.',
    tiempo: '5–10 días hábiles',
    costo: 'Según ordenanza',
    requisitos: [
      'Copia de escritura o título de propiedad',
      'Copia de cédula del propietario',
      'Ficha catastral actualizada',
      'Plano de ubicación del predio',
    ],
  },
  {
    icon: Layers,
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.08)',
    border: 'rgba(37,99,235,0.25)',
    tag: 'Proceso técnico',
    title: 'Aprobación de Planos',
    desc: 'Revisión y aprobación técnica oficial de los planos arquitectónicos y estructurales antes de ejecutar cualquier construcción.',
    tiempo: '15–20 días hábiles',
    costo: 'Según m² de construcción',
    requisitos: [
      'Título de propiedad del predio',
      'Planos arquitectónicos (formato DWG/PDF)',
      'Planos estructurales firmados por ingeniero',
      'Memoria de cálculo estructural',
      'Cédula del propietario',
      'Pago de impuesto predial al día',
    ],
  },
  {
    icon: HardHat,
    color: '#16A34A',
    bg: 'rgba(22,163,74,0.08)',
    border: 'rgba(22,163,74,0.25)',
    tag: 'Autorización final',
    title: 'Permiso de Construcción',
    desc: 'Autorización municipal para ejecutar obras de construcción, ampliación o remodelación. Requerido antes de iniciar cualquier obra.',
    tiempo: '10–15 días hábiles',
    costo: 'Según área y tipo de obra',
    requisitos: [
      'Planos aprobados por el GAD',
      'Contrato con profesional responsable',
      'Título de propiedad del predio',
      'Cédula del propietario',
      'Pago de impuesto predial',
      'Línea de fábricas vigente',
    ],
  },
]

const REQUISITOS_CUENTA = [
  {
    icon: Shield,
    title: 'Cédula de ciudadanía',
    desc: 'Documento de identidad ecuatoriano o pasaporte vigente.',
    color: '#2563EB',
  },
  {
    icon: MapPin,
    title: 'Datos del predio',
    desc: 'Dirección, número catastral y ubicación (urbano o rural).',
    color: '#D97706',
  },
  {
    icon: FileText,
    title: 'Documentos digitalizados',
    desc: 'Escaneos en PDF, JPG o PNG. Máximo 10 MB por archivo.',
    color: '#16A34A',
  },
  {
    icon: Zap,
    title: 'Correo electrónico activo',
    desc: 'Para recibir notificaciones y el resultado de tu trámite.',
    color: '#CC2229',
  },
]

const GUIA_PASOS = [
  {
    num: '01',
    icon: MousePointer,
    title: 'Crea tu cuenta',
    desc: 'Regístrate con tu correo en menos de 2 minutos. Sin papeleo, sin filas.',
    tip: 'También puedes ingresar rápido como Invitado si no tienes cuenta aún.',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.06)',
  },
  {
    num: '02',
    icon: Building2,
    title: 'Elige tu trámite',
    desc: 'Selecciona entre Línea de Fábricas, Aprobación de Planos o Permiso de Construcción.',
    tip: 'El sistema te indica exactamente qué documentos necesitas según el trámite.',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.06)',
  },
  {
    num: '03',
    icon: Upload,
    title: 'Sube tus documentos',
    desc: 'Adjunta los archivos digitalizados. El sistema valida el formato automáticamente.',
    tip: 'Puedes subir en varias sesiones. Tu progreso se guarda automáticamente.',
    color: '#16A34A',
    bg: 'rgba(22,163,74,0.06)',
  },
  {
    num: '04',
    icon: Eye,
    title: 'Seguimiento en vivo',
    desc: 'Monitorea cada etapa: Secretaría → Técnico → Financiero → Resolución.',
    tip: 'Recibirás una notificación por correo en cada cambio de estado.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.06)',
  },
  {
    num: '05',
    icon: Award,
    title: 'Recibe tu certificado',
    desc: 'Descarga tu documento oficial con firma digital, válido ante cualquier entidad.',
    tip: 'El certificado tiene QR de verificación y es legalmente equivalente al físico.',
    color: '#CC2229',
    bg: 'rgba(204,34,41,0.06)',
  },
]

// ─── Componente principal ────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── TOPBAR INSTITUCIONAL ── */}
      <LandingTopbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #f0f6ff 0%, #f8fafc 60%, #fff 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(37,99,235,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">

          {/* Texto */}
          <div className="flex-1 max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#2563EB' }} />
              <span className="text-xs font-bold tracking-wider text-blue-700">PORTAL CIUDADANO DIGITAL · GAD CAÑAR</span>
            </div>

            <h1 className="font-heading font-extrabold text-blue-950 mb-6 leading-tight"
              style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)', lineHeight: 1.1 }}>
              Tu trámite municipal,{' '}
              <span style={{ color: '#2563EB' }}>sin filas</span>{' '}
              y sin papel.
            </h1>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed" style={{ maxWidth: 520 }}>
              Gestiona permisos de ordenamiento territorial del cantón Cañar de forma
              100% digital. Desde tu casa, en cualquier momento.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/registro" className="btn-primary text-sm px-7 py-3.5">
                Iniciar mi trámite <ArrowRight size={18} />
              </Link>
              <a href="#tramites" className="btn-secondary text-sm px-7 py-3.5">
                Ver trámites disponibles
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {[
                { color: '#CC2229', label: 'Seguro' },
                { color: '#2563EB', label: 'Rápido' },
                { color: '#22C55E', label: 'Legal' },
                { color: '#F5C100', label: 'Digital' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} style={{ color }} />
                  <span className="text-xs font-semibold text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Escudo + Stats flotantes */}
          <div className="flex-shrink-0 relative hidden lg:block">
            <div className="relative w-72 h-72 flex items-center justify-center">
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'conic-gradient(#CC2229 0deg 90deg, #2563EB 90deg 180deg, #22C55E 180deg 270deg, #F5C100 270deg 360deg)',
                opacity: 0.08, filter: 'blur(20px)',
              }} />
              <img src="/logo-gad.png" alt="GAD Cañar"
                className="w-48 h-48 object-contain relative z-10"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(37,99,235,0.2))' }} />
            </div>

            {/* Stats flotantes */}
            {[
              { value: '3,200+', label: 'Trámites', color: '#2563EB', pos: { top: 0, left: -40 } },
              { value: '98%', label: 'Satisfacción', color: '#16A34A', pos: { bottom: 20, right: -40 } },
              { value: '48h', label: 'Promedio', color: '#D97706', pos: { bottom: 20, left: -40 } },
            ].map(({ value, label, color, pos }) => (
              <div key={label} className="absolute glass-card px-3 py-2 text-center animate-slide-up"
                style={{ ...pos, minWidth: 80, borderColor: `${color}20` }}>
                <p className="font-heading font-bold text-sm" style={{ color }}>{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats móvil */}
        <div className="lg:hidden max-w-7xl mx-auto px-6 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className="font-heading font-bold text-2xl text-blue-600">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRÁMITES DISPONIBLES ── */}
      <section id="tramites" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4"
              style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB' }}>
              TRÁMITES DISPONIBLES
            </span>
            <h2 className="font-heading font-bold text-3xl text-blue-950 mb-3">
              ¿Qué trámites puedes gestionar?
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              El portal digital del GAD Cañar te permite gestionar los tres trámites
              principales de ordenamiento territorial de forma completamente digital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TRAMITES_DETALLE.map((t, i) => (
              <div key={t.title}
                className="glass-card p-6 flex flex-col animate-slide-up hover:scale-[1.02] transition-transform"
                style={{ animationDelay: `${i * 0.1}s`, borderColor: t.border }}>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                    <t.icon size={24} style={{ color: t.color }} />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                    {t.tag}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-blue-950 mb-2">{t.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">{t.desc}</p>

                {/* Tiempos */}
                <div className="flex gap-3 mb-5">
                  <div className="flex-1 p-2.5 rounded-xl text-center" style={{ background: t.bg }}>
                    <p className="text-xs font-bold" style={{ color: t.color }}>⏱ {t.tiempo}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Resolución</p>
                  </div>
                  <div className="flex-1 p-2.5 rounded-xl text-center" style={{ background: t.bg }}>
                    <p className="text-xs font-bold" style={{ color: t.color }}>💰 {t.costo}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tasa</p>
                  </div>
                </div>

                {/* Requisitos */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Documentos requeridos:</p>
                  <ul className="space-y-1.5">
                    {t.requisitos.map(r => (
                      <li key={r} className="flex items-start gap-2">
                        <ChevronRight size={13} className="flex-shrink-0 mt-0.5" style={{ color: t.color }} />
                        <span className="text-xs text-slate-600">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/registro"
                  className="mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>
                  Iniciar este trámite <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REQUISITOS PARA USAR LA APP ── */}
      <section id="requisitos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">

            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4"
                style={{ background: 'rgba(245,193,0,0.1)', color: '#D97706' }}>
                ANTES DE EMPEZAR
              </span>
              <h2 className="font-heading font-bold text-3xl text-blue-950 mb-4">
                ¿Qué necesito para usar el portal?
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                El acceso al portal es gratuito y abierto a todos los ciudadanos del cantón Cañar.
                Solo necesitas tener estos elementos listos antes de crear tu solicitud.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {REQUISITOS_CUENTA.map((r, i) => (
                  <div key={r.title}
                    className="flex items-start gap-3 p-4 rounded-2xl border animate-slide-up"
                    style={{ animationDelay: `${i * 0.08}s`, borderColor: `${r.color}20`, background: `${r.color}05` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${r.color}12` }}>
                      <r.icon size={18} style={{ color: r.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-blue-950">{r.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nota importante */}
              <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.2)' }}>
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#EA580C' }} />
                <div>
                  <p className="text-sm font-semibold text-orange-800">Modo Invitado disponible</p>
                  <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                    Puedes explorar el portal con acceso rápido (solo tu correo). Sin embargo, para enviar
                    una solicitud formal deberás completar tu perfil con los datos completos.
                  </p>
                </div>
              </div>
            </div>

            {/* Ilustración de formatos */}
            <div className="flex-shrink-0 w-full max-w-sm">
              <div className="glass-card p-6" style={{ borderColor: 'rgba(37,99,235,0.15)' }}>
                <div className="shield-divider mb-5" />
                <h3 className="font-heading font-bold text-blue-950 mb-4">Formatos aceptados</h3>
                {[
                  { ext: 'PDF', desc: 'Documentos y escaneos', color: '#CC2229' },
                  { ext: 'JPG/PNG', desc: 'Fotografías de documentos', color: '#2563EB' },
                  { ext: 'DWG', desc: 'Planos técnicos (AutoCAD)', color: '#D97706' },
                ].map(f => (
                  <div key={f.ext} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
                    <span className="w-12 text-center text-xs font-bold py-1 rounded-lg"
                      style={{ background: `${f.color}15`, color: f.color }}>
                      {f.ext}
                    </span>
                    <span className="text-sm text-slate-600">{f.desc}</span>
                    <CheckCircle2 size={14} className="ml-auto" style={{ color: '#22C55E' }} />
                  </div>
                ))}
                <div className="mt-4 p-3 rounded-xl text-center"
                  style={{ background: 'rgba(37,99,235,0.05)', border: '1px dashed rgba(37,99,235,0.2)' }}>
                  <p className="text-xs font-bold text-blue-700">Límite por archivo: 10 MB</p>
                  <p className="text-xs text-slate-400 mt-0.5">Puedes adjuntar múltiples archivos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GUÍA RÁPIDA ── */}
      <section id="guia" className="py-20" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4"
              style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB' }}>
              <BookOpen size={11} className="inline mr-1" />
              GUÍA RÁPIDA
            </span>
            <h2 className="font-heading font-bold text-3xl text-blue-950 mb-3">
              Tu primer trámite en 5 pasos
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Sigue esta guía y tendrás tu solicitud enviada en menos de 15 minutos.
            </p>
          </div>

          {/* Timeline visual */}
          <div className="relative">
            {/* Línea conectora */}
            <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-px h-[calc(100%-8rem)]"
              style={{ background: 'linear-gradient(180deg, #2563EB, #D97706, #16A34A, #7C3AED, #CC2229)' }} />

            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-4">
              {GUIA_PASOS.map((paso, i) => (
                <div key={paso.num}
                  className="relative flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3 p-5 rounded-2xl animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s`, background: paso.bg, border: `1px solid ${paso.color}20` }}>

                  {/* Número / icono */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 bg-white"
                    style={{ boxShadow: `0 4px 16px ${paso.color}25`, border: `2px solid ${paso.color}30` }}>
                    <paso.icon size={22} style={{ color: paso.color }} />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white flex items-center justify-center font-bold"
                      style={{ background: paso.color, fontSize: '0.6rem' }}>
                      {i + 1}
                    </span>
                  </div>

                  <div className="flex-1 lg:text-center">
                    <p className="font-heading font-bold text-sm text-blue-950 mb-1">{paso.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{paso.desc}</p>
                    <div className="inline-flex items-start gap-1 px-2 py-1.5 rounded-lg w-full lg:w-auto"
                      style={{ background: `${paso.color}10` }}>
                      <span style={{ color: paso.color, fontSize: '0.6rem' }}>💡</span>
                      <span className="text-xs leading-tight" style={{ color: paso.color }}>{paso.tip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA dentro de la guía */}
          <div className="mt-12 text-center">
            <Link to="/registro" className="btn-primary px-10 py-4 text-sm">
              Empezar ahora — es gratis <ArrowRight size={18} />
            </Link>
            <p className="mt-3 text-xs text-slate-400">
              Sin instalaciones · Sin pago de suscripción · Acceso inmediato
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL + FOOTER ── */}
      <section className="py-20 bg-blue-950 relative overflow-hidden">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(245,193,0,0.05) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(34,197,94,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <img src="/logo-gad.png" alt="GAD Cañar"
            className="w-16 h-16 object-contain mx-auto mb-6"
            style={{ background: 'white', padding: 6, borderRadius: 12, boxShadow: '0 0 30px rgba(245,193,0,0.3)' }} />

          <h2 className="font-heading font-extrabold text-white mb-4"
            style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
            Comienza hoy tu trámite{' '}
            <span style={{ color: '#F5C100' }}>sin salir de casa</span>
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Únete a los ciudadanos del cantón Cañar que ya gestionan
            sus trámites de ordenamiento territorial de forma digital.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link to="/registro" className="btn-primary px-10 py-4">
              Crear cuenta gratuita <ArrowRight size={20} />
            </Link>
            <Link to="/login"
              className="px-10 py-4 rounded-xl font-bold text-sm border border-blue-400 text-blue-200 hover:bg-blue-900 transition-colors">
              Iniciar sesión
            </Link>
          </div>

          {/* Colores del escudo como firma */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {['#CC2229','#F5C100','#22C55E','#2563EB'].map(c => (
              <div key={c} style={{ width: 32, height: 4, background: c, borderRadius: 99, opacity: 0.7 }} />
            ))}
          </div>

          <p className="text-blue-400 text-xs leading-relaxed">
            © {new Date().getFullYear()} GAD Municipal de Cañar — Sistema de Ordenamiento Territorial<br />
            Desarrollado bajo estándares de la normativa ecuatoriana de firma electrónica y protección de datos
          </p>
        </div>
      </section>
    </div>
  )
}
