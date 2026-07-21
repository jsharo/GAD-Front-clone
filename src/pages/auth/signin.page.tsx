import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GetApiError } from '@/lib/errors';
import { AlertBanner } from '@/components/ui/alert.banner';
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_HOME } from '@/router/portal.config';

const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Minimum 6 characters'),
});
type SignInForm = z.infer<typeof SignInSchema>;

export function SignInPage() {
  const navigate = useNavigate();
  const Login = useAuthStore((s) => s.Login);
  const [show_pass, set_show_pass] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
  });

  const OnSubmit = async (data: SignInForm) => {
    set_error(null);
    set_is_loading(true);
    try {
      const role = await Login(data.email, data.password);
      navigate(ROLE_HOME[role], { replace: true });
    } catch (err) {
      set_error(GetApiError(err, 'Error logging in'));
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
          Sign In
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
              id="signin-email"
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
                id="signin-password"
                type={show_pass ? 'text' : 'password'}
                autoComplete="current-password"
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
            <div className="mt-2 text-right">
              <Link
                to="/auth/forgot-password"
                className="text-xs font-semibold text-primary-default hover:text-primary-dark"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Main button */}
          <button
            type="submit"
            id="signin-submit"
            disabled={is_loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-neutral-50 mt-2 ${
              is_loading ? 'bg-neutral-400/50' : 'bg-primary-default hover:bg-primary-dark'
            }`}
          >
            {is_loading ? (
              <span>Loading...</span>
            ) : (
              <>
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-5 text-center">
          <span className="text-sm text-neutral-500">Don't have an account? </span>
          <Link
            to="/auth/signup"
            id="signin-to-register"
            className="text-sm font-semibold text-neutral-600 hover:text-primary-dark"
          >
            Sign Up
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
