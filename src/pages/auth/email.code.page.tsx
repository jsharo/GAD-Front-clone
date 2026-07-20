import { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { GetApiError } from '@/lib/errors';
import { AlertBanner } from '@/components/ui/alert.banner';
import { useAuthStore } from '@/stores/auth.store';
import { auth_api } from '@/lib/api.calls';
import { ROLE_HOME } from '@/router/portal.config';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 15;

type EmailCodeLocationState = {
  from_signup?: boolean;
  email?: string;
};

export function EmailCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as EmailCodeLocationState | null;
  const VerifyEmail = useAuthStore((s) => s.VerifyEmail);
  const Login = useAuthStore((s) => s.Login);

  const email = state?.email;
  const can_verify = Boolean(state?.from_signup && email);

  const [digits, set_digits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, set_error] = useState<string | null>(null);
  const [info, set_info] = useState<string | null>(null);
  const [is_loading, set_is_loading] = useState(false);
  const [is_resending, set_is_resending] = useState(false);
  const [cooldown, set_cooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => set_cooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  if (!can_verify || !email) {
    return <Navigate to="/auth/signup" replace />;
  }

  const FocusAt = (index: number) => inputs.current[index]?.focus();

  const HandleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    set_digits(next);
    if (digit && index < CODE_LENGTH - 1) FocusAt(index + 1);
  };

  const HandleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      FocusAt(index - 1);
    }
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

  const OnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      set_error('Ingresa el código de 6 dígitos completo.');
      return;
    }
    set_error(null);
    set_info(null);
    set_is_loading(true);
    try {
      await VerifyEmail(email, code);

      const storage_key = `gad_signup_pw:${email.trim().toLowerCase()}`;
      let password: string | null = null;
      try {
        password = sessionStorage.getItem(storage_key);
        sessionStorage.removeItem(storage_key);
      } catch {
        password = null;
      }

      if (password) {
        const role = await Login(email, password);
        navigate(ROLE_HOME[role] ?? '/architect', { replace: true });
      } else {
        navigate('/auth/signin', { replace: true });
      }
    } catch (err) {
      set_error(GetApiError(err, 'Código inválido o expirado. Intenta de nuevo.'));
    } finally {
      set_is_loading(false);
    }
  };

  const HandleResend = async () => {
    if (cooldown > 0 || is_resending) return;
    set_error(null);
    set_info(null);
    set_is_resending(true);
    try {
      await auth_api.ResendVerificationCode(email);
      set_digits(Array(CODE_LENGTH).fill(''));
      set_cooldown(RESEND_COOLDOWN_SECONDS);
      set_info('Te enviamos un nuevo código. Revisa tu bandeja de entrada.');
      FocusAt(0);
    } catch (err) {
      const retry = (err as { response?: { data?: { retryAfterSeconds?: number } } })?.response
        ?.data?.retryAfterSeconds;
      if (typeof retry === 'number' && retry > 0) {
        set_cooldown(retry);
      }
      set_error(GetApiError(err, 'No se pudo reenviar el código.'));
    } finally {
      set_is_resending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-16 bg-neutral-100 overflow-y-auto">
      <div className="w-full max-w-xs my-auto">
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

        <div className="mb-10">
          <h1 className="font-heading font-black text-neutral-900 text-[1.9rem] tracking-[-0.02em]">
            Verificar correo
          </h1>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
            <span className="inline-flex items-start gap-2">
              <MailCheck size={15} className="mt-0.5 flex-shrink-0 text-neutral-600" />
              <span>
                Ingresa el código de 6 dígitos enviado a{' '}
                <span className="font-medium text-neutral-700">{email}</span>.
              </span>
            </span>
          </p>
        </div>

        {error && (
          <AlertBanner message={error} OnDismiss={() => set_error(null)} className="mb-6" />
        )}
        {info && !error && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            {info}
          </div>
        )}

        <form onSubmit={OnSubmit} className="space-y-4">
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
                  id={`email-code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                  onChange={(e) => HandleChange(i, e.target.value)}
                  onKeyDown={(e) => HandleKeyDown(i, e)}
                  onPaste={HandlePaste}
                  className="w-full aspect-square text-center text-lg font-bold outline-none rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            id="email-code-submit"
            disabled={is_loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-neutral-50 mt-2 ${
              is_loading ? 'bg-neutral-400/50' : 'bg-primary-default hover:bg-primary-dark'
            }`}
          >
            {is_loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-neutral-500">
            ¿No recibiste el código?{' '}
            {cooldown > 0 ? (
              <span className="font-semibold text-neutral-400">Reenviar en {cooldown}s</span>
            ) : (
              <button
                type="button"
                id="email-code-resend"
                onClick={() => void HandleResend()}
                disabled={is_resending}
                className="font-semibold text-primary-default hover:text-primary-dark disabled:opacity-50"
              >
                {is_resending ? 'Enviando...' : 'Enviar nuevo código'}
              </button>
            )}
          </p>
          <Link
            to="/auth/signup"
            id="email-code-back"
            className="inline-block text-sm font-semibold text-neutral-600 hover:text-primary-dark"
          >
            Volver al registro
          </Link>
        </div>

        <p className="text-center mt-6 text-neutral-400 text-[0.65rem]">
          © {new Date().getFullYear()} GAD Municipal de Cañar
        </p>
      </div>
    </div>
  );
}
