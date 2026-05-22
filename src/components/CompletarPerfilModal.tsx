import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserCheck, Eye, EyeOff, AlertCircle, CheckCircle2,
  User, CreditCard, Lock, Phone, X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

const perfilSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres'),
  cedula: z.string().regex(/^\d{10}$/, 'La cédula debe tener exactamente 10 dígitos'),
  telefono: z.string().optional(),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Necesita mayúscula, minúscula y número'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type PerfilForm = z.infer<typeof perfilSchema>

interface Props {
  onSuccess?: () => void
  onClose?: () => void
  allowClose?: boolean
}

export function CompletarPerfilModal({ onSuccess, onClose, allowClose = false }: Props) {
  const { completarPerfil, isLoading, error, clearError, user } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PerfilForm>({ resolver: zodResolver(perfilSchema) })

  // Limpiar errores al montar
  useEffect(() => { clearError() }, [])

  const onSubmit = async (data: PerfilForm) => {
    clearError()
    try {
      await completarPerfil({
        nombre: data.nombre,
        apellido: data.apellido,
        cedula: data.cedula,
        password: data.password,
        telefono: data.telefono,
      })
      setDone(true)
      setTimeout(() => onSuccess?.(), 900)
    } catch {
      // El error ya está en el store
    }
  }

  return createPortal(
    /* ── Overlay ──────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md animate-slide-up relative"
        style={{
          background: 'linear-gradient(135deg, rgba(24,24,40,0.98) 0%, rgba(18,18,30,0.98) 100%)',
          border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: '1.25rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(37,99,235,0.06)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Botón cerrar (solo si allowClose) */}
        {allowClose && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(160,140,80,0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(37,99,235,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(160,140,80,0.5)')}
          >
            <X size={18} />
          </button>
        )}

        <div className="p-7">
          {done ? (
            /* ── Estado: éxito ───────────────────────── */
            <div className="text-center py-8 animate-fade-in">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(46,139,87,0.15)', border: '2px solid rgba(46,139,87,0.4)' }}
              >
                <CheckCircle2 size={40} style={{ color: '#2E8B57' }} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-blue-950 mb-2">
                ¡Perfil completado!
              </h2>
              <p className="text-sm" style={{ color: 'rgba(160,180,140,0.7)' }}>
                Tu cuenta está activa. Continuando…
              </p>
            </div>
          ) : (
            <>
              {/* ── Header ─────────────────────────────── */}
              <div className="mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
                >
                  <UserCheck size={22} style={{ color: '#2563EB' }} />
                </div>
                <h2 className="font-heading text-xl font-bold text-blue-950 mb-1">
                  Completa tu perfil
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(160,140,100,0.7)' }}>
                  Para crear trámites necesitamos verificar tu identidad.
                  Estos datos son requeridos por la normativa de la LOPDP.
                </p>
                {user?.email && (
                  <p className="text-xs mt-2" style={{ color: 'rgba(37,99,235,0.5)' }}>
                    Cuenta: <strong style={{ color: 'rgba(37,99,235,0.8)' }}>{user.email}</strong>
                  </p>
                )}
              </div>

              {/* ── Error global ───────────────────────── */}
              {error && (
                <div
                  className="flex items-start gap-3 p-3 rounded-xl text-sm mb-5"
                  style={{ background: 'rgba(204,34,41,0.1)', border: '1px solid rgba(204,34,41,0.3)', color: '#F87171' }}
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* ── Formulario ─────────────────────────── */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Nombre + Apellido */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label flex items-center gap-1">
                      <User size={11} /> Nombre
                    </label>
                    <input
                      {...register('nombre')}
                      id="perfil-nombre"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        color: '#0f172a',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
                      placeholder="Juan"
                      autoFocus
                    />
                    {errors.nombre && (
                      <p className="input-error"><AlertCircle size={11} />{errors.nombre.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="input-label">Apellido</label>
                    <input
                      {...register('apellido')}
                      id="perfil-apellido"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        color: '#0f172a',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
                      placeholder="Pérez"
                    />
                    {errors.apellido && (
                      <p className="input-error"><AlertCircle size={11} />{errors.apellido.message}</p>
                    )}
                  </div>
                </div>

                {/* Cédula */}
                <div>
                  <label className="input-label flex items-center gap-1">
                    <CreditCard size={11} /> Número de cédula
                  </label>
                  <input
                    {...register('cedula')}
                    id="perfil-cedula"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      color: '#0f172a',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
                    placeholder="0102030405"
                    maxLength={10}
                  />
                  {errors.cedula && (
                    <p className="input-error"><AlertCircle size={11} />{errors.cedula.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="input-label flex items-center gap-1">
                    <Phone size={11} /> Teléfono <span className="text-slate-500">(opcional)</span>
                  </label>
                  <input
                    {...register('telefono')}
                    id="perfil-telefono"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      color: '#0f172a',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
                    placeholder="0987654321"
                  />
                </div>

                {/* Separador */}
                <div style={{ borderTop: '1px solid rgba(37,99,235,0.08)', paddingTop: '0.75rem' }}>
                  <p className="text-xs mb-3" style={{ color: 'rgba(160,140,80,0.5)' }}>
                    <Lock size={10} style={{ display: 'inline', marginRight: 4 }} />
                    Crea una contraseña para iniciar sesión en el futuro
                  </p>

                  {/* Contraseña */}
                  <div className="space-y-3">
                    <div>
                      <label className="input-label">Contraseña</label>
                      <div className="relative">
                        <input
                          {...register('password')}
                          type={showPwd ? 'text' : 'password'}
                          id="perfil-password"
                          className="w-full px-4 py-3 pr-12 rounded-xl text-sm font-medium outline-none transition-all"
                          style={{
                            background: '#ffffff',
                            border: '1.5px solid #e2e8f0',
                            color: '#0f172a',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                          onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
                          placeholder="Mínimo 8 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-500 transition-colors"
                        >
                          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="input-error"><AlertCircle size={11} />{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="input-label">Confirmar contraseña</label>
                      <input
                        {...register('confirmPassword')}
                        type={showPwd ? 'text' : 'password'}
                        id="perfil-confirm-password"
                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #e2e8f0',
                          color: '#0f172a',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}
                        placeholder="Repite la contraseña"
                      />
                      {errors.confirmPassword && (
                        <p className="input-error"><AlertCircle size={11} />{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  id="perfil-submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all"
                  style={{
                    background: isLoading
                      ? 'rgba(37,99,235,0.15)'
                      : 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #1E40AF 100%)',
                    color: isLoading ? 'rgba(37,99,235,0.5)' : '#1a1400',
                    boxShadow: isLoading ? 'none' : '0 0 24px rgba(37,99,235,0.3)',
                  }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-yellow-500/30 border-t-yellow-400 rounded-full animate-spin" />
                  ) : (
                    <><UserCheck size={18} /> Activar mi cuenta</>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
