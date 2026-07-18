import { useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import api from '@/lib/api';
import { GetApiError } from '@/lib/errors';
import { AlertBanner } from '@/components/ui/alert.banner';

const CODE_LENGTH = 6;

type EmailCodeLocationState = {
  from_signup?: boolean;
  email?: string;
};

export function EmailCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as EmailCodeLocationState | null;

  const [digits, set_digits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, set_error] = useState<string | null>(null);
  const [is_loading, set_is_loading] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  if (!state?.from_signup || !state.email) {
    return <Navigate to="/auth/signup" replace />;
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
      set_error('Please enter the complete 6-digit code.');
      return;
    }
    set_error(null);
    set_is_loading(true);
    try {
      await api.post('/verification/verify-email', { email, code });
      navigate('/auth/signin', { replace: true });
    } catch (err) {
      set_error(GetApiError(err, 'Invalid or expired code. Please try again.'));
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
        <div className="mb-10">
          <h1 className="font-heading font-black text-neutral-900 text-[1.9rem] tracking-[-0.02em]">
            Verify Email Code
          </h1>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed flex items-center gap-2">
            <MailCheck size={15} className="flex-shrink-0 text-neutral-600" />
            Enter the 6-digit code sent to{' '}
            <span className="font-medium text-neutral-700">{email}</span>.
          </p>
        </div>

        {/* Global error */}
        {error && (
          <AlertBanner message={error} OnDismiss={() => set_error(null)} className="mb-6" />
        )}

        {/* Form */}
        <form onSubmit={OnSubmit} className="space-y-4">
          {/* Code inputs */}
          <div>
            <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-4">
              Verification Code
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

          {/* Submit button */}
          <button
            type="submit"
            id="email-code-submit"
            disabled={is_loading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-neutral-50 mt-2 ${
              is_loading ? 'bg-neutral-400/50' : 'bg-primary-default hover:bg-primary-dark'
            }`}
          >
            {is_loading ? <span>Verificando...</span> : <span>Verify</span>}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-5 text-center">
          <span className="text-sm text-neutral-500">Didn't receive a code? </span>
          <Link
            to="/auth/signup"
            id="email-code-back"
            className="text-sm font-semibold text-neutral-600 hover:text-primary-dark"
          >
            Go back
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
