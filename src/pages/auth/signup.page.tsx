import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'

// Validate data with Zod
const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string().min(6, 'Minimum 6 characters'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type SignUpForm = z.infer<typeof SignUpSchema>

export function SignUpPage() {
  const { register: signup, is_loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [show_pass, set_show_pass] = useState(false)
  const [show_confirm, set_show_confirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
  })

  const onSubmit = async (data: SignUpForm) => {
    clearError()
    try {
      await signup({ email: data.email, password: data.password, first_name: '', last_name: '', national_id: '' })
      navigate('/auth/signup/email-code', { state: { fromSignup: true } })
    } catch {}
  }

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-16 bg-scale-1 overflow-y-auto">
      <div className="w-full max-w-xs my-auto">

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <img src="/logo-gad.png" alt="GAD" className="w-40 h-40 object-contain rounded-2xl bg-scale-1 p-1 mb-3" />
          <p className="font-heading font-black text-scale-5 text-base tracking-wide">CAÑAR</p>
          <p className="text-scale-4 text-[0.55rem] tracking-[0.2em] font-bold">GAD MUNICIPAL</p>
        </div>

        {/* Title */}
        <h1 className="font-heading font-black text-scale-5 mb-10 text-[1.9rem] tracking-[-0.02em]">
          Sign Up
        </h1>

        {/* Global error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-6 text-sm bg-scale-3/10 border border-scale-3/30 text-scale-4">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-scale-3 tracking-widest mb-2">
              Email
            </label>
            <input
              {...register('email')}
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              className="w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none bg-scale-1 border-[1.5px] border-scale-2 text-scale-5 hover:border hover:border-solid hover:border-scale-3 active:border-transparent active:ring-[2px] active:ring-inset active:ring-scale-4 focus:border-transparent focus:bg-scale-1 focus:ring-[2px] focus:ring-inset focus:ring-scale-4"
            />
            {errors.email && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-scale-4">
                <AlertCircle size={11} />{errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-scale-3 tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                id="signup-password"
                type={show_pass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="hide-password-reveal w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium outline-none bg-scale-1 border-[1.5px] border-scale-2 text-scale-5 hover:border hover:border-solid hover:border-scale-3 active:border-transparent active:ring-[2px] active:ring-inset active:ring-scale-4 focus:border-transparent focus:bg-scale-1 focus:ring-[2px] focus:ring-inset focus:ring-scale-4"
              />
              <button type="button" onClick={() => set_show_pass(!show_pass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-scale-3 hover:text-scale-5">
                {show_pass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-scale-4">
                <AlertCircle size={11} />{errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-scale-3 tracking-widest mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                id="signup-confirm-password"
                type={show_confirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="hide-password-reveal w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium outline-none bg-scale-1 border-[1.5px] border-scale-2 text-scale-5 hover:border hover:border-solid hover:border-scale-3 active:border-transparent active:ring-[2px] active:ring-inset active:ring-scale-4 focus:border-transparent focus:bg-scale-1 focus:ring-[2px] focus:ring-inset focus:ring-scale-4"
              />
              <button type="button" onClick={() => set_show_confirm(!show_confirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-scale-3 hover:text-scale-5">
                {show_confirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-scale-4">
                <AlertCircle size={11} />{errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Main button */}
          <button
            type="submit"
            id="signup-submit"
            disabled={is_loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-scale-1 transition-all mt-2 ${
              is_loading
                ? 'bg-scale-3/50'
                : 'bg-scale-5 hover:bg-scale-3'
            }`}
          >
            {is_loading
              ? <div className="w-5 h-5 border-2 rounded-full animate-spin border-scale-1/30 border-t-scale-1" />
              : <><span>Sign Up</span></>
            }
          </button>
        </form>

        {/* Login link */}
        <div className="mt-5 text-center">
          <span className="text-sm text-scale-3">Already have an account?{' '}</span>
          <Link to="/auth/signin" id="signup-to-signin"
            className="text-sm font-semibold transition-colors text-scale-4 hover:text-scale-5">
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-scale-2 text-[0.65rem]">
          © {new Date().getFullYear()} GAD Municipal de Cañar
        </p>
      </div>
    </div>
  )
}
