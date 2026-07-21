import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, KeyRound } from 'lucide-react';
import { auth_api } from '@/lib/api.calls';
import { GetApiError } from '@/lib/errors';
import { AlertBanner } from '@/components/ui/alert.banner';

const ForgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type ForgotForm = z.infer<typeof ForgotSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [is_loading, set_is_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(ForgotSchema),
  });

  const OnSubmit = async (data: ForgotForm) => {
    set_error(null);
    set_is_loading(true);
    try {
      await auth_api.ForgotPassword(data.email);
      navigate('/auth/reset-password', {
        state: { email: data.email.trim().toLowerCase(), from_forgot: true },
      });
    } catch (err) {
      set_error(
        GetApiError(
          err,
          'We could not find an account with that email. Use your primary email or your verified secondary email.'
        )
      );
    } finally {
      set_is_loading(false);
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
        </div>

        <div className="mb-10">
          <h1 className="font-heading font-black text-neutral-900 text-[1.9rem] tracking-[-0.02em]">
            Reset password
          </h1>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed flex items-start gap-2">
            <KeyRound size={15} className="flex-shrink-0 mt-0.5 text-neutral-600" />
            <span>
              Enter the email for the account you want to recover. It can be your{' '}
              <strong className="font-semibold text-neutral-700">primary email</strong> or your{' '}
              <strong className="font-semibold text-neutral-700">verified secondary email</strong>.
              The code will be sent to that same address.
            </span>
          </p>
        </div>

        {error && (
          <AlertBanner message={error} OnDismiss={() => set_error(null)} className="mb-6" />
        )}

        <form onSubmit={handleSubmit(OnSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-2">
              Account email
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="primary or secondary"
              className="w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none bg-neutral-50 border border-neutral-300 text-neutral-900 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
            />
            {errors.email && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-neutral-600">
                <AlertCircle size={11} />
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={is_loading}
            className={`w-full py-3.5 rounded-xl font-bold text-sm text-neutral-50 mt-2 ${
              is_loading ? 'bg-neutral-400/50' : 'bg-primary-default hover:bg-primary-dark'
            }`}
          >
            {is_loading ? 'Sending...' : 'Send code'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link
            to="/auth/signin"
            className="text-sm font-semibold text-neutral-600 hover:text-primary-dark"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
