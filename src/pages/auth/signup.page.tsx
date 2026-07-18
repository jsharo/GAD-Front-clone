import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { GetApiError } from '@/lib/errors';
import { AlertBanner } from '@/components/ui/alert.banner';

const SignUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(8, 'Minimum 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type SignUpForm = z.infer<typeof SignUpSchema>;

/** Placeholder until national ID is collected in a later step (backend requires 10 digits). */
function GenerateTempNationalId(): string {
  const raw = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return raw.replace(/\D/g, '').slice(-10).padStart(10, '0');
}

export function SignUpPage() {
  const navigate = useNavigate();
  const [show_pass, set_show_pass] = useState(false);
  const [show_confirm, set_show_confirm] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
  });

  const OnSubmit = async (data: SignUpForm) => {
    set_error(null);
    set_is_loading(true);
    try {
      await api.post('/users/register', {
        email: data.email,
        password: data.password,
        // Backend wire field for Ecuadorian ID remains `cedula`
        cedula: GenerateTempNationalId(),
      });

      navigate('/auth/signup/email-code', {
        state: { from_signup: true, email: data.email },
      });
    } catch (err) {
      set_error(GetApiError(err, 'Error registering'));
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-16 bg-neutral-100 overflow-y-auto">
      <div className="w-full max-w-xs my-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <img
            src="/logo-gad.png"
            alt="GAD"
            className="w-40 h-40 object-contain rounded-2xl bg-primary-default p-1 mb-3"
          />
          <p className="font-heading font-black text-neutral-900 text-base tracking-wide">CAÑAR</p>
          <p className="text-neutral-600 text-[0.55rem] tracking-[0.2em] font-bold">
            GAD MUNICIPAL
          </p>
        </div>

        {/* Title */}
        <h1 className="font-heading font-black text-neutral-900 mb-10 text-[1.9rem] tracking-[-0.02em]">
          Sign Up
        </h1>

        {/* Global error */}
        {error && (
          <AlertBanner message={error} OnDismiss={() => set_error(null)} className="mb-6" />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(OnSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-2">
              Email
            </label>
            <input
              {...register('email')}
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              className="w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
            />
            {errors.email && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-neutral-600">
                <AlertCircle size={11} />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                id="signup-password"
                type={show_pass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium outline-none bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
              />
              <button
                type="button"
                onClick={() => set_show_pass(!show_pass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary-dark"
              >
                {show_pass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-neutral-600">
                <AlertCircle size={11} />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                id="signup-confirm-password"
                type={show_confirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium outline-none bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
              />
              <button
                type="button"
                onClick={() => set_show_confirm(!show_confirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary-dark"
              >
                {show_confirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-neutral-600">
                <AlertCircle size={11} />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Main button */}
          <button
            type="submit"
            id="signup-submit"
            disabled={is_loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-neutral-50 mt-2 ${
              is_loading ? 'bg-neutral-400/50' : 'bg-primary-default hover:bg-primary-dark'
            }`}
          >
            {is_loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-5 text-center">
          <span className="text-sm text-neutral-500">Already have an account? </span>
          <Link
            to="/auth/signin"
            id="signup-to-signin"
            className="text-sm font-semibold text-neutral-600 hover:text-primary-dark"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-neutral-400 text-[0.65rem]">
          © {new Date().getFullYear()} GAD Municipal de Cañar
        </p>
      </div>
    </div>
  );
}
