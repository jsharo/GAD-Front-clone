import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Clock,
  FileText,
  CheckCircle2,
  Star,
  MapPin,
  Users,
  Search,
  HardHat,
  XCircle,
  AlertCircle,
  Loader,
  HelpCircle,
} from 'lucide-react';
import { applications_api } from '@/lib/api.calls';

const STATS = [
  { value: '3,200+', label: 'Planos y Proyectos Aprobados', icon: FileText },
  { value: '48h', label: 'Tiempo Promedio de Revisión', icon: Clock },
  { value: '250+', label: 'Profesionales Habilitados', icon: Star },
  { value: '12', label: 'Analistas Técnicos GAD', icon: Users },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'Línea de Fábrica Digital',
    desc: 'Obtención rápida de informes de regulación urbana y compatibilidad de uso de suelo.',
    iconWrapperClass: 'bg-primary-light/10 border border-primary-light/20',
    iconClass: 'text-primary-default',
  },
  {
    icon: Shield,
    title: 'Aprobación de Planos',
    desc: 'Envío técnico de proyectos arquitectónicos y estructurales para revisión ágil de los analistas.',
    iconWrapperClass: 'bg-error-light/20 border border-error-light',
    iconClass: 'text-error-default',
  },
  {
    icon: MapPin,
    title: 'Permisos de Construcción',
    desc: 'Licenciamiento de edificación 100% en línea para áreas urbanas y rurales del cantón.',
    iconWrapperClass: 'bg-success-light/20 border border-success-light',
    iconClass: 'text-success-dark',
  },
];

const PROCEDURE_TYPE_LABELS: Record<string, string> = {
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
};

const STATUS_INFO: Record<string, { label: string; badgeClass: string; step: number }> = {
  BORRADOR: {
    label: 'Borrador (Pendiente Envío)',
    badgeClass: 'bg-neutral-200 text-neutral-700 border border-neutral-300',
    step: 1,
  },
  PENDIENTE_SECRETARIA: {
    label: 'Enviado (Espera Validación Documental)',
    badgeClass: 'bg-warning-light/20 text-warning-dark border border-warning-light',
    step: 1,
  },
  OBSERVADO: {
    label: 'Observado por Secretaría (Devuelto)',
    badgeClass: 'bg-error-light/20 text-error-dark border border-error-light',
    step: 2,
  },
  EN_REVISION_TECNICA: {
    label: 'En Revisión Técnica',
    badgeClass: 'bg-primary-light/10 text-primary-default border border-primary-light/30',
    step: 2,
  },
  PENDIENTE_PAGO: {
    label: 'Aprobado (Pendiente de Pago)',
    badgeClass: 'bg-warning-light/20 text-warning-dark border border-warning-light',
    step: 3,
  },
  PAGADO: {
    label: 'Pago Registrado (En Firma Final)',
    badgeClass: 'bg-success-light/20 text-success-dark border border-success-light',
    step: 3,
  },
  APROBADO: {
    label: 'Aprobado y Concluido',
    badgeClass: 'bg-success-light/20 text-success-dark border border-success-light',
    step: 4,
  },
  RECHAZADO: {
    label: 'Rechazado Definitivamente',
    badgeClass: 'bg-error-light/20 text-error-dark border border-error-light',
    step: 4,
  },
};

export function LandingPage() {
  const [search_val, set_search_val] = useState('');
  const [is_loading, set_is_loading] = useState(false);
  const [error_msg, set_error_msg] = useState<string | null>(null);
  const [tracking_result, set_tracking_result] = useState<any>(null);
  const [is_modal_open, set_is_modal_open] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search_val.trim()) return;

    set_is_loading(true);
    set_error_msg(null);
    set_tracking_result(null);

    try {
      const is_email = search_val.includes('@');
      const params = is_email ? { email: search_val.trim() } : { national_id: search_val.trim() };

      const { data } = await applications_api.publicTracking(params);

      if (!data.solicitudes || data.solicitudes.length === 0) {
        set_error_msg(
          'El ciudadano se encuentra registrado, pero aún no tiene ningún trámite ingresado.'
        );
      } else {
        set_tracking_result(data);
        set_is_modal_open(true);
      }
    } catch (err: any) {
      set_error_msg(
        err.response?.data?.message ||
          'No se encontraron registros que coincidan con la cédula o correo ingresado.'
      );
    } finally {
      set_is_loading(false);
    }
  };

  // Map backend response properties to snake_case English for template use
  const citizen = tracking_result?.ciudadano
    ? {
        first_name: tracking_result.ciudadano.nombre,
        last_name: tracking_result.ciudadano.apellido,
      }
    : null;

  const applications = (tracking_result?.solicitudes || []).map((sol: any) => ({
    id: sol.id,
    procedure_type: sol.tipoTramite,
    address: sol.direccion,
    location: sol.ubicacion,
    status: sol.estado,
    observations: sol.observaciones,
    rejection_reason: sol.motivoRechazo,
    payment: sol.cobro
      ? {
          concept: sol.cobro.concepto,
          amount: sol.cobro.monto,
        }
      : null,
    updated_at: sol.updatedAt,
  }));

  return (
    <div className="min-h-screen text-neutral-800 bg-neutral-100 font-sans">
      {/* NAVBAR PROTOTIPO */}
      <nav className="bg-neutral-50 border-b border-neutral-200 sticky top-0 z-50">
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
                <p className="font-heading font-black text-xl leading-none text-primary-default tracking-tight">
                  CAÑAR
                </p>
                <p className="text-secondary-dark font-bold text-[9px] tracking-wider uppercase mt-0.5">
                  Cantón Intercultural
                </p>
              </div>
              {/* Franja de Colores del Prototipo */}
              <div className="flex flex-col gap-[3px] ml-4 justify-center h-7 border-l pl-3 border-neutral-200">
                <div className="w-5 h-[3px] bg-error-default" />
                <div className="w-5 h-[3px] bg-secondary-default" />
                <div className="w-5 h-[3px] bg-secondary-light" />
                <div className="w-5 h-[3px] bg-success-default" />
                <div className="w-5 h-[3px] bg-primary-default" />
              </div>
            </div>
          </div>

          {/* Buscador Central (Estilo Prototipo) */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xs mx-8">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Buscar trámites o servicios..."
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 focus:bg-neutral-50 focus:border-primary-default text-xs outline-none"
              />
            </div>
          </div>

          {/* Acceso y Registro */}
          <div className="flex items-center gap-4">
            <Link
              to="/auth/signin"
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-primary-dark"
            >
              <span className="w-5 h-5 flex items-center justify-center border border-neutral-300 rounded-lg text-neutral-500">
                →
              </span>
              Sign In
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-primary-default hover:bg-primary-dark text-neutral-50"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Fila 2: Enlaces de Navegación */}
        <div className="border-t border-neutral-100 bg-neutral-50/95">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-start gap-8 overflow-x-auto text-xs font-bold tracking-wider text-neutral-600">
            <a
              href="#inicio"
              className="text-primary-default border-b-2 border-secondary-light pb-1 hover:text-primary-dark"
            >
              INICIO
            </a>
            <a href="#servicios" className="hover:text-primary-dark">
              TRÁMITES TÉCNINES
            </a>
            <a href="#seguimiento" className="hover:text-primary-dark">
              CONSULTA EXPEDIENTES
            </a>
            <a href="#registro-profesional" className="hover:text-primary-dark">
              HABILITACIÓN PROFESIONAL
            </a>
            <a href="#noticias" className="hover:text-primary-dark">
              NOTICIAS GAD
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION CLARO */}
      <section
        id="inicio"
        className="relative overflow-hidden bg-neutral-50 py-16 lg:py-24 border-b border-neutral-200"
      >
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-light/10 pointer-events-none -mr-40" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Heading and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light/10 border border-primary-light/20 text-primary-default text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-default" />
              PORTAL TÉCNICO DE PLANIFICACIÓN TERRITORIAL · GAD CAÑAR
            </div>

            <h1 className="font-heading font-extrabold leading-tight text-4xl sm:text-5xl lg:text-6xl text-neutral-900 tracking-tight">
              Gestión Profesional <br />
              <span className="text-primary-default">de Proyectos y Planos</span>.
            </h1>

            <p className="text-base text-neutral-600 max-w-xl leading-relaxed">
              Plataforma oficial para arquitectos, ingenieros civiles y profesionales técnicos.
              Gestione de forma 100% digital la aprobación de planos, líneas de fábrica y permisos
              de edificación en el cantón Cañar.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/auth/signin"
                className="inline-flex items-center justify-center gap-2 text-base px-8 py-3.5 rounded-xl bg-primary-default hover:bg-primary-dark text-neutral-50 font-bold"
              >
                Ingresar al Portal
                <ArrowRight size={18} />
              </Link>
              <a
                href="#registro-profesional"
                className="inline-flex items-center justify-center gap-2 text-base px-8 py-3.5 rounded-xl border border-primary-default/30 text-primary-default font-semibold hover:bg-primary-dark hover:text-neutral-50 hover:border-primary-dark"
              >
                Registrarme como Profesional
              </a>
            </div>

            {/* Check Features del Prototipo */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-neutral-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-primary-light" /> Firma Electrónica
                (XAdES-BES)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success-default" /> Revisión Ágil
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-warning-default" /> Trazabilidad Completa
              </span>
            </div>
          </div>

          {/* Right Column: Escudo Flotante y Tarjetas Estadísticas */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-8 lg:py-0">
            {/* Brillo circular detrás del escudo */}
            <div className="absolute w-72 h-72 rounded-full bg-primary-light/10" />

            {/* Escudo del GAD Cañar en el centro */}
            <div className="relative z-10 w-44 h-56 bg-neutral-50 p-4 rounded-3xl border border-neutral-200 flex items-center justify-center">
              <img
                src="/logo-gad.png"
                alt="Escudo de Cañar"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Tarjeta Flotante 1 (Trámites) */}
            <div className="absolute top-6 left-6 z-20 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5 flex flex-col items-start min-w-[100px] text-left">
              <span className="text-primary-default font-extrabold text-sm leading-none">
                3,200+
              </span>
              <span className="text-neutral-500 text-[10px] font-bold mt-0.5">
                Planos Aprobados
              </span>
            </div>

            {/* Tarjeta Flotante 2 (Promedio) */}
            <div className="absolute bottom-6 left-6 z-20 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5 flex flex-col items-start min-w-[100px] text-left">
              <span className="text-warning-default font-extrabold text-sm leading-none">48h</span>
              <span className="text-neutral-500 text-[10px] font-bold mt-0.5">
                Revisión Técnica
              </span>
            </div>

            {/* Tarjeta Flotante 3 (Satisfacción) */}
            <div className="absolute bottom-12 right-2 z-20 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-2.5 flex flex-col items-start min-w-[110px] text-left">
              <span className="text-success-dark font-extrabold text-sm leading-none">250+</span>
              <span className="text-neutral-500 text-[10px] font-bold mt-0.5">Profesionales</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: SEGUIMIENTO DE TRÁMITES */}
      <section id="seguimiento" className="py-12 bg-neutral-50 border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-neutral-100 border border-neutral-200/80 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary-default" />
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 text-left">
                <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-800">
                  <Search size={18} className="text-primary-default" />
                  Consulta de Expedientes Técnicos
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Consulte el estado de las solicitudes patrocinadas en nombre de su cliente
                  ingresando la cédula del propietario o correo electrónico.
                </p>
              </div>

              <div className="md:col-span-7">
                <form onSubmit={handleTrack} className="space-y-3">
                  <div className="relative">
                    <input
                      id="trackInput"
                      type="text"
                      className="w-full pl-4 pr-12 py-3.5 bg-neutral-50 border border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-primary-default focus:ring-2 focus:ring-primary-light text-xs rounded-2xl outline-none"
                      placeholder="Cédula del propietario o correo del expediente"
                      value={search_val}
                      onChange={(e) => {
                        set_search_val(e.target.value);
                        set_error_msg(null);
                      }}
                    />
                    <button
                      type="submit"
                      disabled={is_loading || !search_val.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-primary-default hover:bg-primary-dark text-neutral-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {is_loading ? (
                        <span className="text-[10px] font-bold">...</span>
                      ) : (
                        <Search size={15} />
                      )}
                    </button>
                  </div>

                  {error_msg && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-error-light/20 border border-error-light text-error-default text-xs text-left">
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
          <div className="inline-flex p-3 bg-primary-light/10 text-primary-default rounded-2xl mb-4">
            <HardHat size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-900">
            Registro y Habilitación de Firmas Técnicas
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto mt-2 text-sm leading-relaxed">
            Si eres Arquitecto o Ingeniero Civil y requieres ingresar expedientes urbanísticos en
            nombre de tus clientes, solicita tu registro profesional para comenzar a operar de
            inmediato.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-neutral-50 border border-neutral-200/80 rounded-3xl p-6 sm:p-8 hover:border-primary-default flex flex-col sm:flex-row items-start sm:items-center gap-6 text-left">
          <div className="p-4 rounded-2xl bg-primary-light/10 text-primary-default flex-shrink-0">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-neutral-800 text-lg">
                Registro de Profesional Acreditado
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-success-light/20 text-success-dark border border-success-light">
                Habilitación Inmediata
              </span>
            </div>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Completa tus datos personales, título profesional y número de registro SENESCYT.
              Podrás iniciar sesión e ingresar expedientes técnicos inmediatamente. Tus credenciales
              profesionales y título se validarán con la copia de tu cédula al momento de iniciar tu
              primer trámite.
            </p>
            <div className="pt-2">
              <Link
                to="/auth/signup"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl bg-primary-default hover:bg-primary-dark text-neutral-50 border-none"
              >
                Crear Cuenta Profesional <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION CLARA */}
      <section className="bg-neutral-100/50 py-12 border-y border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-extrabold text-primary-default mb-1">{s.value}</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES CLARAS */}
      <section id="servicios" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-neutral-900">
            Trámites Técnicos Habilitados
          </h2>
          <p className="text-neutral-500 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
            Gestión optimizada y control digital completo sobre las solicitudes técnicas
            municipales.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200/60 flex flex-col items-start space-y-4 text-left hover:border-primary-default"
            >
              <div className={`p-3 rounded-2xl ${f.iconWrapperClass}`}>
                <f.icon size={20} className={f.iconClass} />
              </div>
              <h3 className="font-bold text-neutral-800 text-lg">{f.title}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CLARO */}
      <footer className="bg-neutral-100 border-t border-neutral-200 text-neutral-600 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <img src="/logo-gad.png" alt="GAD Cañar" className="w-11 h-11 object-contain mx-auto" />
          <p className="text-sm font-bold text-neutral-800">
            GAD Municipal de Cañar — Sistema de Planificación y Trámites Técnicos
          </p>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            © {new Date().getFullYear()} GAD Cañar. Todos los derechos reservados.
            <br />
            Plataforma para profesionales acreditados de la construcción. Soporte de firma digital
            oficial del Ecuador.
          </p>
        </div>
      </footer>

      {/* MODAL: TRACKING DE TRÁMITE */}
      {is_modal_open && tracking_result && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-900/40"
            onClick={() => set_is_modal_open(false)}
          />

          <div className="relative w-full max-w-2xl bg-neutral-50 rounded-3xl border border-neutral-200 p-6 overflow-hidden max-h-[90vh] flex flex-col text-left">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Estado de Trámites</h3>
                {citizen && (
                  <p className="text-xs text-neutral-500">
                    Propietario: {citizen.first_name} {citizen.last_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => set_is_modal_open(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-primary-dark hover:text-neutral-50 text-neutral-600 font-bold flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {applications.map((sol: any) => {
                const info = STATUS_INFO[sol.status] || {
                  label: sol.status,
                  badgeClass: 'bg-neutral-200 text-neutral-700 border border-neutral-300',
                  step: 1,
                };
                const steps = [
                  { num: 1, label: 'Ingreso' },
                  { num: 2, label: 'Revisión' },
                  { num: 3, label: 'Pago Tasas' },
                  { num: 4, label: 'Finalizado' },
                ];

                return (
                  <div
                    key={sol.id}
                    className="p-5 rounded-2xl bg-neutral-100 border border-neutral-200/60 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] bg-neutral-200 text-neutral-700 font-bold px-2 py-1 rounded">
                          ID: #{sol.id.slice(0, 8).toUpperCase()}
                        </span>
                        <h4 className="font-bold text-neutral-800 text-base mt-1">
                          {PROCEDURE_TYPE_LABELS[sol.procedure_type] || sol.procedure_type}
                        </h4>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {sol.address} ({sol.location})
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-full w-max text-center ${info.badgeClass}`}
                      >
                        {info.label}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-start justify-between gap-2 max-w-md mx-auto">
                        {steps.map((s, index) => {
                          const is_past = info.step > s.num;
                          const is_active = info.step === s.num;

                          let bg_circle = 'bg-neutral-200 text-neutral-400';

                          if (is_past) {
                            bg_circle = 'bg-success-default text-neutral-50';
                          } else if (is_active) {
                            bg_circle = 'bg-primary-default text-neutral-50 font-bold';
                          }

                          return (
                            <div key={s.num} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center relative z-10 min-w-8">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${bg_circle}`}
                                >
                                  {is_past ? '✓' : s.num}
                                </div>
                                <span
                                  className={`text-[10px] mt-1.5 font-bold text-center ${is_active ? 'text-primary-default' : 'text-neutral-500'}`}
                                >
                                  {s.label}
                                </span>
                              </div>
                              {index < steps.length - 1 && (
                                <div
                                  className={`h-1 flex-1 mx-2 mt-[-18px] rounded-full ${info.step > s.num ? 'bg-primary-default' : 'bg-neutral-200'}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {sol.status === 'OBSERVADO' && sol.observations && (
                      <div className="p-3.5 rounded-xl bg-error-light/20 border border-error-light text-error-dark text-xs">
                        <p className="font-bold flex items-center gap-1.5 mb-1 text-error-dark">
                          <AlertCircle size={14} /> Observación documental a subsanar:
                        </p>
                        <p>{sol.observations}</p>
                      </div>
                    )}

                    {sol.status === 'RECHAZADO' && sol.rejection_reason && (
                      <div className="p-3.5 rounded-xl bg-error-light/20 border border-error-light text-error-dark text-xs">
                        <p className="font-bold flex items-center gap-1.5 mb-1 text-error-dark">
                          <XCircle size={14} /> Motivo del rechazo técnico:
                        </p>
                        <p>{sol.rejection_reason}</p>
                      </div>
                    )}

                    {sol.status === 'PENDIENTE_PAGO' && sol.payment && (
                      <div className="p-3.5 rounded-xl bg-warning-light/20 border border-warning-light text-warning-dark text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-warning-dark">Monto Liquidado a Pagar:</p>
                          <p className="text-neutral-500">{sol.payment.concept}</p>
                        </div>
                        <span className="text-lg font-black text-warning-default">
                          ${sol.payment.amount}
                        </span>
                      </div>
                    )}

                    <div className="text-[10px] text-neutral-400 text-right">
                      Última actualización: {new Date(sol.updated_at).toLocaleDateString('es-EC')} a
                      las{' '}
                      {new Date(sol.updated_at).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 mt-4 text-center">
              <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1">
                <HelpCircle size={12} /> Para soporte adicional, contacta al departamento de
                Planificación GAD Cañar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
