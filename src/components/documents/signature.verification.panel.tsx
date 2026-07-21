import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileSignature,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  GetRequestSignatureVerification,
  type RequestSignatureSummary,
  type SignatureIdentityStatus,
  type SignatureTrustStatus,
  type SignatureVerificationStatus,
} from '@/lib/api.calls';
import { BaseModal } from '@/components/logic/base.modal';
import { GetApiError } from '@/lib/errors';
import { FormatDateTime } from '@/lib/utils';

interface SignatureVerificationPanelProps {
  request_id: string;
  refresh_key?: number;
  on_change?: (summary: RequestSignatureSummary | null) => void;
  on_loading_change?: (loading: boolean) => void;
}

const status_labels: Record<SignatureVerificationStatus, string> = {
  MATCH: 'Signature verified',
  MATCH_WITH_WARNINGS: 'Signatures with warnings',
  MISMATCH: 'Different signer',
  UNSIGNED: 'Unsigned document',
  INVALID: 'Invalid signature or document',
  INDETERMINATE: 'Inconclusive identity',
  ERROR: 'Could not verify',
};

const status_messages: Record<SignatureVerificationStatus, string> = {
  MATCH: 'Identity, integrity, and trust were verified.',
  MATCH_WITH_WARNINGS: 'A matching signature exists, but the file requires review.',
  MISMATCH: 'The certificate identity does not match the registered person.',
  UNSIGNED: 'At least one PDF does not contain an embedded digital signature.',
  INVALID: 'Invalid signatures or changes after signing were detected.',
  INDETERMINATE: 'The certificate does not contain enough data to confirm identity.',
  ERROR: 'The verifier could not analyze one or more documents.',
};

const status_styles: Record<SignatureVerificationStatus, string> = {
  MATCH: 'border-green-300 bg-green-50 text-green-900',
  MATCH_WITH_WARNINGS: 'border-amber-300 bg-amber-50 text-amber-950',
  MISMATCH: 'border-red-300 bg-red-50 text-red-900',
  UNSIGNED: 'border-amber-300 bg-amber-50 text-amber-950',
  INVALID: 'border-red-300 bg-red-50 text-red-900',
  INDETERMINATE: 'border-amber-300 bg-amber-50 text-amber-950',
  ERROR: 'border-red-300 bg-red-50 text-red-900',
};

function identityLabel(status: SignatureIdentityStatus) {
  if (status === 'MATCH') return 'National ID matches';
  if (status === 'MISMATCH') return 'National ID does not match';
  return 'Inconclusive identity';
}

function identityStyle(status: SignatureIdentityStatus) {
  if (status === 'MATCH') return 'bg-green-50 text-green-700';
  if (status === 'MISMATCH') return 'bg-red-50 text-red-700';
  return 'bg-amber-50 text-amber-800';
}

function trustLabel(status: SignatureTrustStatus) {
  const trust_labels: Record<SignatureTrustStatus, string> = {
    TRUSTED: 'Trusted chain',
    UNTRUSTED: 'Untrusted chain',
    REVOKED: 'Revoked certificate',
    EXPIRED: 'Expired',
    NOT_CONFIGURED: 'Trust not configured',
    UNKNOWN: 'Unknown trust',
  };
  return trust_labels[status];
}

function StatusIcon({ status }: { status: SignatureVerificationStatus }) {
  if (status === 'MATCH') return <ShieldCheck size={21} className="flex-none" />;
  if (status === 'MATCH_WITH_WARNINGS' || status === 'UNSIGNED') {
    return <AlertTriangle size={21} className="flex-none" />;
  }
  return <ShieldAlert size={21} className="flex-none" />;
}

export function SignatureVerificationPanel({
  request_id,
  refresh_key = 0,
  on_change,
  on_loading_change,
}: SignatureVerificationPanelProps) {
  const [summary, setSummary] = useState<RequestSignatureSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details_open, setDetailsOpen] = useState(false);

  const loadVerification = useCallback(
    async (refresh = false) => {
      setLoading(true);
      on_loading_change?.(true);
      setError(null);
      try {
        const result = await GetRequestSignatureVerification(request_id, refresh);
        setSummary(result);
        on_change?.(result);
      } catch (verification_error) {
        setSummary(null);
        on_change?.(null);
        setError(GetApiError(verification_error, 'The signature verifier could not be run.'));
      } finally {
        setLoading(false);
        on_loading_change?.(false);
      }
    },
    [on_change, on_loading_change, request_id]
  );

  useEffect(() => {
    void loadVerification(refresh_key > 0);
  }, [loadVerification, refresh_key]);

  if (loading) {
    return (
      <section
        aria-live="polite"
        className="flex min-h-20 items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900"
      >
        <Loader2 size={20} className="animate-spin flex-none" />
        <div className="min-w-0 text-left">
          <p className="text-sm font-bold">Verifying signatures and certificates</p>
          <p className="mt-0.5 text-xs text-blue-700">
            The result will appear before the file record.
          </p>
        </div>
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-900"
      >
        <div className="flex min-w-0 items-start gap-3 text-left">
          <ShieldAlert size={21} className="mt-0.5 flex-none" />
          <div>
            <p className="text-sm font-bold">Signature verification unavailable</p>
            <p className="mt-0.5 text-xs leading-relaxed">{error}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadVerification(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold hover:bg-red-100"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </section>
    );
  }

  const primary_warning = summary.warnings[0];
  const remaining_warnings = Math.max(summary.warnings.length - 1, 0);

  return (
    <>
      <section
        aria-labelledby="signature-alert-title"
        className={`rounded-lg border px-4 py-3 ${status_styles[summary.status]}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 text-left">
            <StatusIcon status={summary.status} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p id="signature-alert-title" className="text-sm font-black">
                  {status_labels[summary.status]}
                </p>
                <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-bold">
                  {summary.signature_count} signature{summary.signature_count === 1 ? '' : 's'}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed">{status_messages[summary.status]}</p>
              {primary_warning && (
                <p className="mt-1 truncate text-xs font-semibold" title={primary_warning}>
                  {primary_warning}
                  {remaining_warnings > 0 ? ` and ${remaining_warnings} more alert(s)` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-none items-center gap-2 sm:justify-end">
            <button
              type="button"
              title="Re-verify signatures"
              aria-label="Re-verify signatures"
              onClick={() => void loadVerification(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-current/20 bg-white/70 hover:bg-white"
            >
              <RefreshCw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-current/20 bg-white/70 px-3 text-xs font-bold hover:bg-white"
            >
              <Eye size={15} /> View details
            </button>
          </div>
        </div>
      </section>

      <BaseModal
        is_open={details_open}
        OnClose={() => setDetailsOpen(false)}
        title="Signature and alert details"
        size="xl"
        respect_header
      >
        <div className="grid gap-6 text-left lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
          <section aria-labelledby="signature-documents-title" className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <FileSignature size={18} className="text-blue-700" />
              <h4 id="signature-documents-title" className="text-sm font-black text-slate-900">
                Signatures by document
              </h4>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {summary.attachments.map((attachment) => (
                <article key={attachment.attachment_id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {attachment.attachment_name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {attachment.signature_count} signature
                        {attachment.signature_count === 1 ? '' : 's'} · {attachment.verifier}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-bold ${status_styles[attachment.status]}`}
                    >
                      {status_labels[attachment.status]}
                    </span>
                  </div>

                  {attachment.signatures.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-500">
                      No embedded signatures were found.
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {attachment.signatures.map((signature) => (
                        <div
                          key={`${attachment.attachment_id}-${signature.index}`}
                          className="border-l-2 border-slate-200 pl-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {signature.integrity_valid ? (
                              <CheckCircle2 size={14} className="text-green-600" />
                            ) : (
                              <AlertTriangle size={14} className="text-red-600" />
                            )}
                            <p className="text-sm font-bold text-slate-800">
                              {signature.common_name || `Signature ${signature.index}`}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${identityStyle(signature.identity_status)}`}
                            >
                              {identityLabel(signature.identity_status)}
                            </span>
                          </div>
                          <dl className="mt-2 grid gap-1 text-xs text-slate-600">
                            <div className="flex justify-between gap-3">
                              <dt>National ID</dt>
                              <dd className="font-semibold text-slate-800">
                                {signature.national_id || 'Not available'}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                              <dt>Integrity</dt>
                              <dd className="font-semibold text-slate-800">
                                {signature.integrity_valid ? 'Valid' : 'Invalid'}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                              <dt>Trust</dt>
                              <dd className="text-right font-semibold text-slate-800">
                                {trustLabel(signature.trust_status)}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                              <dt>Date</dt>
                              <dd className="text-right font-semibold text-slate-800">
                                {signature.signing_time
                                  ? FormatDateTime(signature.signing_time)
                                  : 'Not available'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <aside className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-700" />
              <h4 className="text-sm font-black text-slate-900">Alerts found</h4>
            </div>

            {summary.warnings.length > 0 ? (
              <div className="mt-3 divide-y divide-amber-200 border-y border-amber-200">
                {summary.warnings.map((warning) => (
                  <p key={warning} className="py-3 text-xs leading-relaxed text-amber-900">
                    {warning}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-green-700">
                No alerts were found in the analyzed documents.
              </p>
            )}

            <dl className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-xs">
              <div>
                <dt className="font-bold uppercase text-slate-400">Expected person</dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {summary.expected_signer.full_name || 'Not defined'}
                </dd>
              </div>
              <div>
                <dt className="font-bold uppercase text-slate-400">Registered national ID</dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {summary.expected_signer.national_id || 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="font-bold uppercase text-slate-400">Last verification</dt>
                <dd className="mt-1 font-semibold text-slate-800">
                  {FormatDateTime(summary.verified_at)}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </BaseModal>
    </>
  );
}
