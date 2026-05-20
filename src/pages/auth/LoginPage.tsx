import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type LoginForm = z.infer<typeof loginSchema>

// TODO (backend): El backend retorna el rol en el JWT.
// El store lo lee y devuelve user.role para la redirección.
const ROLE_REDIRECT: Record<string, string> = {
  CIUDADANO:  '/ciudadano',
  INVITADO:   '/ciudadano',
  TECNICO:    '/tecnico',
  SECRETARIA: '/secretaria',
  FINANCIERO: '/financiero',
  SUPERADMIN: '/admin',
}

export function LoginPage() {
  const { login, loginAsGuest, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    clearError()
    try {
      await login(data.email, data.password)
      const role = useAuthStore.getState().user?.role ?? ''
      navigate(ROLE_REDIRECT[role] ?? '/ciudadano', { replace: true })
    } catch {}
  }

  const handleGuest = () => {
    loginAsGuest()
    navigate('/ciudadano', { replace: true })
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#fff' }}>

      {/* ── PANEL IZQUIERDO — Identidad institucional ── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: '#07112A', maxWidth: '52%' }}>

        {/* Banda de colores institucionales — top */}
        <div className="absolute top-0 left-0 right-0 flex" style={{ height: 5 }}>
          {['#CC2229', '#F5C100', '#22C55E', '#2563EB'].map(c => (
            <div key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>

        {/* Patrón de fondo — topografía suave */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 25% 30%, rgba(37,99,235,0.12) 0%, transparent 50%),
            radial-gradient(circle at 75% 70%, rgba(34,197,94,0.06) 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, rgba(245,193,0,0.06) 0%, transparent 40%),
            radial-gradient(circle at 25% 75%, rgba(204,34,41,0.06) 0%, transparent 40%)`,
        }} />

        {/* Líneas decorativas tipo topografía */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <pattern id="topo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="35" fill="none" stroke="white" strokeWidth="0.8"/>
            <circle cx="40" cy="40" r="25" fill="none" stroke="white" strokeWidth="0.8"/>
            <circle cx="40" cy="40" r="15" fill="none" stroke="white" strokeWidth="0.8"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#topo)" />
        </svg>

        {/* Contenido */}
        <div className="relative z-10 text-center px-14 max-w-md">
          {/* Escudo con glow */}
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 rounded-3xl opacity-40 blur-2xl"
              style={{ background: 'conic-gradient(#CC2229 0deg 90deg, #2563EB 90deg 180deg, #22C55E 180deg 270deg, #F5C100 270deg 360deg)', transform: 'scale(1.3)' }} />
            <img src="/logo-gad.png" alt="GAD Municipal de Cañar"
              className="relative w-36 h-36 object-contain"
              style={{ background: 'white', borderRadius: 24, padding: 10, boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 24px 64px rgba(0,0,0,0.4)' }} />
          </div>

          <h2 className="font-heading font-black text-white mb-2"
            style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            CAÑAR
          </h2>
          <p className="font-bold tracking-[0.25em] mb-1" style={{ color: '#F5C100', fontSize: '0.7rem' }}>
            GAD MUNICIPAL
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem', letterSpacing: '0.15em', marginBottom: '2.5rem' }}>
            ORDENAMIENTO TERRITORIAL
          </p>

          {/* Divisor colores */}
          <div className="flex gap-2 justify-center mb-8">
            {[
              { c: '#CC2229', label: 'Justicia' },
              { c: '#F5C100', label: 'Progreso' },
              { c: '#22C55E', label: 'Naturaleza' },
              { c: '#2563EB', label: 'Agua' },
            ].map(({ c, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div style={{ width: 28, height: 4, background: c, borderRadius: 99, opacity: 0.9 }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
                  {label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', lineHeight: 1.8 }}>
            Plataforma oficial de trámites digitales<br />del Cantón Cañar, Ecuador
          </p>
        </div>

        {/* Banda de colores — bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex" style={{ height: 5 }}>
          {['#2563EB', '#22C55E', '#F5C100', '#CC2229'].map(c => (
            <div key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* ── PANEL DERECHO — Formulario minimalista ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-white">
        <div className="w-full max-w-xs">

          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src="/logo-gad.png" alt="GAD" className="w-10 h-10 object-contain rounded-xl"
              style={{ background: 'white', padding: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
            <div>
              <p className="font-heading font-black text-blue-950 text-sm tracking-wide">CAÑAR</p>
              <p style={{ color: '#F5C100', fontSize: '0.55rem', letterSpacing: '0.2em', fontWeight: 700 }}>GAD MUNICIPAL</p>
            </div>
          </div>

          {/* Título */}
          <h1 className="font-heading font-black text-blue-950 mb-1" style={{ fontSize: '1.9rem', letterSpacing: '-0.02em' }}>
            Inicia sesión
          </h1>
          <p className="text-slate-400 mb-9" style={{ fontSize: '0.88rem' }}>
            El sistema te llevará a tu espacio automáticamente.
          </p>

          {/* Error global */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-6 text-sm"
              style={{ background: 'rgba(204,34,41,0.06)', border: '1px solid rgba(204,34,41,0.2)', color: '#CC2229' }}>
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Correo electrónico
              </label>
              <input
                {...register('email')}
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="tu@correo.ec"
                className="w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#0f172a' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none' }}
              />
              {errors.email && (
                <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: '#CC2229' }}>
                  <AlertCircle size={11} />{errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#0f172a' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.08)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: '#CC2229' }}>
                  <AlertCircle size={11} />{errors.password.message}
                </p>
              )}
            </div>

            {/* Botón principal */}
            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all mt-2"
              style={{
                background: isLoading
                  ? 'rgba(37,99,235,0.5)'
                  : 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
              }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none' }}
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                : <><span>Ingresar</span><ArrowRight size={17} /></>
              }
            </button>
          </form>

          {/* Enlace registro */}
          <div className="mt-5 text-center">
            <span className="text-sm text-slate-400">¿No tienes cuenta?{' '}</span>
            <Link to="/registro" id="login-to-register"
              className="text-sm font-semibold transition-colors"
              style={{ color: '#2563EB' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1E40AF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#2563EB')}>
              Registrarme
            </Link>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: '#f1f5f9' }} />
          </div>

          {/* Enlace invitado — sutil y elegante */}
          <div className="text-center">
            <button
              onClick={handleGuest}
              id="login-guest"
              className="text-xs transition-all"
              style={{ color: '#94a3b8', textDecoration: 'underline', textUnderlineOffset: 3 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
            >
              ¿Solo vienes a consultar? Entrar como invitado
            </button>
          </div>

          {/* Footer */}
          <p className="text-center mt-10" style={{ color: '#cbd5e1', fontSize: '0.68rem' }}>
            © {new Date().getFullYear()} GAD Municipal de Cañar
          </p>
        </div>
      </div>
    </div>
  )
}
