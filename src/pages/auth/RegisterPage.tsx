import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, ArrowRight, AlertCircle, CheckCircle2, LogIn } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

export function RegisterPage() {
  const navigate = useNavigate()
  const { registerInvitado, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [done, setDone] = useState(false)

  const validateEmail = (val: string) => {
    if (!val) return 'El correo es requerido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Correo electrónico inválido'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    const err = validateEmail(email)
    if (err) { setEmailError(err); return }
    setEmailError('')
    try {
      await registerInvitado(email)
      setDone(true)
      // Breve pausa para mostrar el éxito antes de navegar
      setTimeout(() => navigate('/ciudadano'), 1200)
    } catch {
      // El error ya está en el store
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
            <Building2 size={20} className="text-blue-950" />
          </div>
          <div>
            <span className="font-heading font-bold text-blue-950">GAD Cañar</span>
            <p className="text-blue-800 text-xs">Ordenamiento Territorial</p>
          </div>
        </div>

        <div className="glass-card p-8">

          {/* Estado: éxito */}
          {done ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h2 className="font-heading text-xl font-bold text-blue-950 mb-2">¡Bienvenido!</h2>
              <p className="text-blue-800 text-sm">Redirigiendo al portal ciudadano…</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-heading text-2xl font-bold text-blue-950 mb-1">
                  Accede al portal
                </h1>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Solo necesitas tu correo electrónico para empezar.
                  Completarás tus datos cuando vayas a realizar un trámite.
                </p>
              </div>

              {/* Error del store */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-5">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    {error.includes('cuenta activa') && (
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1 mt-2 font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        <LogIn size={13} /> Ir a iniciar sesión
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reg-email" className="input-label flex items-center gap-2">
                    <Mail size={13} /> Correo electrónico
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError('') }}
                    className="input-field"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    autoFocus
                  />
                  {emailError && (
                    <p className="input-error">
                      <AlertCircle size={12} />{emailError}
                    </p>
                  )}
                </div>

                {/* Explicación visual del proceso */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.1)' }}>
                  <p style={{ color: 'rgba(200,160,30,0.7)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ¿Cómo funciona?
                  </p>
                  {[
                    { num: '1', text: 'Ingresa tu correo y accede al portal' },
                    { num: '2', text: 'Explora los tipos de trámites disponibles' },
                    { num: '3', text: 'Al crear un trámite, completas tu perfil (nombre, cédula)' },
                  ].map(s => (
                    <div key={s.num} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB' }}>
                        {s.num}
                      </span>
                      <p className="text-sm" style={{ color: 'rgba(200,180,120,0.75)' }}>{s.text}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  id="reg-submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-4"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Acceder al portal <ArrowRight size={18} /></>
                  )}
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
