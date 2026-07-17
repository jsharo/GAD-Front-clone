import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
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
import { GetApiError } from '@/lib/errors';
import { FormatDateTime } from '@/lib/utils';
import { AlertBanner } from '@/components/ui/alert.banner';
import { DetailSection } from '@/components/ui/detail.section';

interface SignatureVerificationPanelProps {
  request_id: string;
  refresh_key?: number;
  OnChange?: (summary: RequestSignatureSummary | null) => void;
  OnLoadingChange?: (loading: boolean) => void;
}

const STATUS_LABELS: Record<SignatureVerificationStatus, string> = {
  MATCH: 'Identidad verificada',
  MATCH_WITH_WARNINGS: 'Coincidencia con advertencias',
  MISMATCH: 'Firmante diferente',
  UNSIGNED: 'Documento sin firma',
  INVALID: 'Firma o documento inválido',
  INDETERMINATE: 'Identidad no concluyente',
  ERROR: 'No se pudo verificar',
};

const STATUS_STYLES: Record<SignatureVerificationStatus, string> = {
  MATCH: 'border-green-200 bg-green-50 text-green-800',
  MATCH_WITH_WARNINGS: 'border-amber-300 bg-amber-50 text-amber-900',
  MISMATCH: 'border-red-300 bg-red-50 text-red-800',
  UNSIGNED: 'border-amber-300 bg-amber-50 text-amber-900',
  INVALID: 'border-red-300 bg-red-50 text-red-800',
  INDETERMINATE: 'border-amber-300 bg-amber-50 text-amber-900',
  ERROR: 'border-red-300 bg-red-50 text-red-800',
};

function IdentityLabel(status: SignatureIdentityStatus) {
  if (status === 'MATCH') return 'Cédula coincide';
  if (status === 'MISMATCH') return 'Cédula no coincide';
  return 'Identidad no concluyente';
}

function IdentityStyle(status: SignatureIdentityStatus) {
  if (status === 'MATCH') return 'bg-green-50 text-green-700';
  if (status === 'MISMATCH') return 'bg-red-50 text-red-700';
  return 'bg-amber-50 text-amber-800';
}

function TrustLabel(status: SignatureTrustStatus) {
  const labels: Record<SignatureTrustStatus, string> = {
    TRUSTED: 'Cadena confiable',
    UNTRUSTED: 'Cadena no confiable',
    REVOKED: 'Certificado revocado',
    EXPIRED: 'Fuera de vigencia',
    NOT_CONFIGURED: 'Confianza no configurada',
    UNKNOWN: 'Confianza desconocida',
  };
  return labels[status];
}

export function SignatureVerificationPanel({
  request_id,
  refresh_key = 0,
  OnChange,
  OnLoadingChange,
}: SignatureVerificationPanelProps) {
  const [summary, set_summary] = useState<RequestSignatureSummary | null>(null);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  const Load = useCallback(
    async (refresh = false) => {
      set_loading(true);
      OnLoadingChange?.(true);
      set_error(null);
      try {
        const result = await GetRequestSignatureVerification(request_id, refresh);
        set_summary(result);
        OnChange?.(result);
      } catch (err) {
        set_summary(null);
        OnChange?.(null);
        set_error(GetApiError(err, 'No se pudo ejecutar el verificador de firmas.'));
      } finally {
        set_loading(false);
        OnLoadingChange?.(false);
      }
    },
    [OnChange, OnLoadingChange, request_id]
  );

  useEffect(() => {
    void Load(refresh_key > 0);
  }, [Load, refresh_key]);

  return (
    <DetailSection title="Verificación automática de firmas" icon={FileSignature}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Se comprueba cada firma y se compara la identidad del certificado con el responsable.
        </p>
        <button
          type="button"
          title="Volver a verificar firmas"
          aria-label="Volver a verificar firmas"
          onClick={() => void Load(true)}
          disabled={loading}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <AlertBanner message={error} OnDismiss={() => set_error(null)} />}

      {loading && (
        <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Analizando certificados y firmas...
        </div>
      )}

      {!loading && summary && (
        <div className="space-y-4 text-left">
          <div
            className={`flex items-start gap-3 rounded-lg border p-3 ${STATUS_STYLES[summary.status]}`}
          >
            {summary.has_valid_expected_signature ? (
              <ShieldCheck size={19} className="mt-0.5 flex-none" />
            ) : (
              <ShieldAlert size={19} className="mt-0.5 flex-none" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold">{STATUS_LABELS[summary.status]}</p>
              <p className="mt-1 text-xs leading-relaxed">
                Persona esperada: {summary.expected_signer.full_name || 'No definida'}
                {summary.expected_signer.national_id
                  ? ` · Cédula ${summary.expected_signer.national_id}`
                  : ''}
              </p>
            </div>
          </div>

          {summary.attachments.map((attachment) => (
            <div
              key={attachment.attachment_id}
              className="border-t border-slate-200 pt-4 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-blue-955">
                    {attachment.attachment_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {attachment.signature_count} firma{attachment.signature_count === 1 ? '' : 's'}{' '}
                    · {attachment.verifier}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${STATUS_STYLES[attachment.status]}`}
                >
                  {STATUS_LABELS[attachment.status]}
                </span>
              </div>

              {attachment.signatures.length > 0 && (
                <div className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
                  {attachment.signatures.map((signature) => (
                    <div key={`${attachment.attachment_id}-${signature.index}`} className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {signature.integrity_valid ? (
                          <CheckCircle2 size={15} className="text-green-600" />
                        ) : (
                          <AlertTriangle size={15} className="text-red-600" />
                        )}
                        <p className="text-sm font-semibold text-slate-800">
                          {signature.common_name || `Firma ${signature.index}`}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${IdentityStyle(signature.identity_status)}`}
                        >
                          {IdentityLabel(signature.identity_status)}
                        </span>
                      </div>
                      <div className="mt-1 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
                        <p>Cédula del certificado: {signature.national_id || 'No disponible'}</p>
                        <p>
                          {signature.integrity_valid ? 'Integridad válida' : 'Integridad inválida'}
                        </p>
                        <p>{TrustLabel(signature.trust_status)}</p>
                        <p>
                          Firma:{' '}
                          {signature.signing_time
                            ? FormatDateTime(signature.signing_time)
                            : 'Fecha no disponible'}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{signature.identity_message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {summary.warnings.length > 0 && (
            <div className="space-y-1 border-t border-slate-200 pt-3">
              {summary.warnings.map((warning) => (
                <p
                  key={warning}
                  className="flex items-start gap-2 text-xs leading-relaxed text-amber-800"
                >
                  <AlertTriangle size={14} className="mt-0.5 flex-none" /> {warning}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </DetailSection>
  );
}
