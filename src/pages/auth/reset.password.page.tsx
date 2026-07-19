import { useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { auth_api } from '@/lib/api.calls';
import { GetApiError } from '@/lib/errors';
import { AlertBanner } from '@/components/ui/alert.banner';

const CODE_LENGTH = 6;

const ResetSchema = z
  .object({
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(8, 'Minimum 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type ResetForm = z.infer<typeof ResetSchema>;

type ResetLocationState = {
  from_forgot?: boolean;
  email?: string;
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResetLocationState | null;

  const [digits, set_digits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [show_pass, set_show_pass] = useState(false);
  const [show_confirm, set_show_confirm] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(ResetSchema),
  });

  if (!state?.from_forgot || !state.email) {
    return <Navigate to="/auth/forgot-password" replace />;
  }

  const email = state.email;

  const FocusAt = (index: number) => inputs.current[index]?.focus();

  const HandleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    set_digits(next);
    if (digit && index < CODE_LENGTH - 1) FocusAt(index + 1);
  };

  const HandleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) FocusAt(index - 1);
  };

  const HandlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    const next = [...digits];
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    set_digits(next);
    FocusAt(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const OnSubmit = async (data: ResetForm) => {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      set_error('Ingresa el código de 6 dígitos completo.');
      return;
    }
    set_error(null);
    set_is_loading(true);
    try {
      await auth_api.ResetPassword(email, code, data.password);
      navigate('/auth/signin', { replace: true });
    } catch (err) {
      set_error(GetApiError(err, 'No se pudo restablecer la contraseña'));
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-16 bg-neutral-100 overflow-y-auto">
      <div className="w-full max-w-xs my-auto">
        <h1 className="font-heading font-black text-neutral-900 mb-2 text-[1.9rem] tracking-[-0.02em]">
          Nueva contraseña
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          Código enviado para <span className="font-medium text-neutral-700">{email}</span>
        </p>

        {error && (
          <AlertBanner message={error} OnDismiss={() => set_error(null)} className="mb-6" />
        )}

        <form onSubmit={handleSubmit(OnSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-4">
              Código de verificación
            </label>
            <div className="flex gap-2 justify-between">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={(e) => HandleChange(i, e.target.value)}
                  onKeyDown={(e) => HandleKeyDown(i, e)}
                  onPaste={HandlePaste}
                  className="w-full aspect-square text-center text-lg font-bold outline-none rounded-xl bg-neutral-50 border border-neutral-300 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={show_pass ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm outline-none bg-neutral-50 border border-neutral-300 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
              />
              <button
                type="button"
                onClick={() => set_show_pass(!show_pass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
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

          <div>
            <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={show_confirm ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm outline-none bg-neutral-50 border border-neutral-300 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
              />
              <button
                type="button"
                onClick={() => set_show_confirm(!show_confirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
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

          <button
            type="submit"
            disabled={is_loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-neutral-50 ${
              is_loading ? 'bg-neutral-400/50' : 'bg-primary-default hover:bg-primary-dark'
            }`}
          >
            {is_loading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            to="/auth/forgot-password"
            className="text-sm font-semibold text-neutral-600 hover:text-primary-dark"
          >
            Solicitar otro código
          </Link>
        </div>
      </div>
    </div>
  );
}
