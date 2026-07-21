import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { auth_api } from '@/lib/api.calls';
import { GetApiError } from '@/lib/errors';
import { AlertBanner } from '@/components/ui/alert.banner';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [search_params] = useSearchParams();
  const token = search_params.get('token')?.trim() ?? '';
  const failed = search_params.get('failed') === '1';

  const [status, set_status] = useState<'loading' | 'success' | 'error'>(
    token && !failed ? 'loading' : 'error'
  );
  const [message, set_message] = useState(
    failed
      ? 'The verification link is invalid or has expired.'
      : token
        ? ''
        : 'Missing verification token.'
  );

  useEffect(() => {
    if (!token || failed) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await auth_api.ConfirmEmailToken(token);
        if (cancelled) return;
        set_status('success');
        set_message(data.message || 'Your email was verified successfully.');
        window.setTimeout(() => {
          navigate('/auth/signin?verified=1', { replace: true });
        }, 2500);
      } catch (err) {
        if (cancelled) return;
        set_status('error');
        set_message(GetApiError(err, 'Could not verify your email.'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, failed, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-16 bg-neutral-100">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-primary-default" size={36} />
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Verifying your email</h1>
            <p className="text-sm text-neutral-600">
              Please wait while we activate your account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-green-600" size={40} />
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Email verified</h1>
            <p className="text-sm text-neutral-600 mb-6">{message}</p>
            <Link
              to="/auth/signin"
              className="inline-flex items-center justify-center rounded-xl bg-primary-default px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark"
            >
              Go to sign in
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Verification failed</h1>
            <AlertBanner message={message} className="mb-6 text-left" />
            <div className="flex flex-col gap-3">
              <Link
                to="/auth/signin"
                className="inline-flex items-center justify-center rounded-xl bg-primary-default px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark"
              >
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
