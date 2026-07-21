import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  FolderOpen,
  Loader2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import {
  applications_api,
  SubmitSecretaryReview,
  type RequestSignatureSummary,
} from '@/lib/api.calls';
import { BaseModal } from '@/components/logic/base.modal';
import { DocumentPanel } from '@/components/documents/document.panel';
import { SignatureVerificationPanel } from '@/components/documents/signature.verification.panel';
import { AlertBanner } from '@/components/ui/alert.banner';
import { DetailPageHeader } from '@/components/ui/detail.page.header';
import { EmptyState } from '@/components/ui/empty.state';
import { InfoGrid } from '@/components/ui/info.grid';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { GetProcedureTypeLabel } from '@/lib/constants/procedure.types';
import { GetApiError } from '@/lib/errors';
import { FormatDateTime } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  size: number;
  hash: string;
  key: string;
  mime_type: string;
}

interface ApplicationDetail {
  id: string;
  created_at: string;
  status: string;
  procedure_type: string;
  rejection_reason: string | null;
  observations: string | null;
  secretary_decision: {
    is_approved: boolean;
    signature_validated: boolean;
    observations: string | null;
    created_at: string;
  } | null;
  citizen: {
    first_name: string;
    last_name: string;
    national_id: string;
    email: string;
    phone: string | null;
  } | null;
  architect: {
    first_name: string;
    last_name: string;
    national_id: string;
    email: string;
    phone: string | null;
    title: string | null;
    registration_number: string | null;
  } | null;
  property: {
    address: string;
    location: string;
    area: number;
    description: string | null;
  } | null;
  attachments: Attachment[];
}

function CheckItem({
  label,
  checked,
  on_toggle,
}: {
  label: string;
  checked: boolean;
  on_toggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={on_toggle}
      className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
        checked
          ? 'border-green-300 bg-green-50 text-green-800'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      <span
        className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 ${
          checked ? 'border-green-600 bg-green-600' : 'border-slate-300'
        }`}
      >
        {checked && <CheckCircle2 size={12} className="text-white" />}
      </span>
      <span className="text-xs font-semibold leading-snug">{label}</span>
    </button>
  );
}

function mapApplication(source: any): ApplicationDetail | null {
  if (!source) return null;
  return {
    id: source.id,
    created_at: source.createdAt,
    status: source.estado,
    procedure_type: source.tipoTramite,
    rejection_reason: source.motivoRechazo,
    observations: source.observaciones,
    secretary_decision: source.dictamenSecretaria
      ? {
          is_approved: source.dictamenSecretaria.aprobada,
          signature_validated: Boolean(source.dictamenSecretaria.firmaValidada),
          observations: source.dictamenSecretaria.observaciones,
          created_at: source.dictamenSecretaria.creadoEn,
        }
      : null,
    citizen: source.ciudadano
      ? {
          first_name: source.ciudadano.nombre,
          last_name: source.ciudadano.apellido,
          national_id: source.ciudadano.cedula,
          email: source.ciudadano.email,
          phone: source.ciudadano.telefono,
        }
      : null,
    architect: source.arquitecto
      ? {
          first_name: source.arquitecto.nombre,
          last_name: source.arquitecto.apellido,
          national_id: source.arquitecto.cedula,
          email: source.arquitecto.email,
          phone: source.arquitecto.telefono,
          title: source.arquitecto.titulo,
          registration_number: source.arquitecto.numeroRegistro,
        }
      : null,
    property: source.predio
      ? {
          address: source.predio.direccion,
          location: source.predio.ubicacion,
          area: source.predio.area,
          description: source.predio.descripcion,
        }
      : null,
    attachments: (source.anexos || []).map((attachment: any) => ({
      id: attachment.id,
      name: attachment.nombre,
      size: attachment.tamano,
      hash: attachment.hash,
      key: attachment.key,
      mime_type: attachment.tipoMime,
    })),
  };
}

function formatFileSize(size: number) {
  const size_in_kilobytes = (size || 0) / 1024;
  return `${size_in_kilobytes.toFixed(1)} KB`;
}

export function ApplicationDetailSecretary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [is_loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState({
    documents_complete: false,
    applicant_data_valid: false,
    property_identified: false,
    professional_title_valid: false,
  });
  const [signature_summary, setSignatureSummary] = useState<RequestSignatureSummary | null>(null);
  const [signature_loading, setSignatureLoading] = useState(true);
  const [signature_refresh_key, setSignatureRefreshKey] = useState(0);
  const [documents_open, setDocumentsOpen] = useState(false);
  const [confirmation_open, setConfirmationOpen] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'return' | null>(null);
  const [observations, setObservations] = useState('');
  const [is_submitting, setIsSubmitting] = useState(false);

  const loadApplication = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const { data } = await applications_api.GetById(id);
      setApplication(mapApplication(data));
    } catch (load_error) {
      setError(GetApiError(load_error, 'Could not load application.'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);

  const toggleCheck = (key: keyof typeof checks) => {
    setChecks((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSignatureChange = useCallback((summary: RequestSignatureSummary | null) => {
    setSignatureSummary(summary);
    if (summary && !summary.requires_acknowledgement) setConfirmationOpen(false);
  }, []);

  const handleAttachmentsChanged = useCallback(() => {
    setSignatureRefreshKey((current) => current + 1);
    void loadApplication();
  }, [loadApplication]);

  const all_checked = Object.values(checks).every(Boolean);
  const signature_requires_acknowledgement = signature_summary?.requires_acknowledgement ?? true;

  const submitDecision = async (acknowledge_signature_warning = false) => {
    if (!id || !decision) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await SubmitSecretaryReview(id, {
        approved: decision === 'approve',
        acknowledge_signature_warning,
        remarks: observations.trim() || undefined,
      });
      navigate('/secretary/inbox');
    } catch (submission_error) {
      setConfirmationOpen(false);
      setError(GetApiError(submission_error, 'Could not record the review decision.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDecision = async () => {
    if (!decision) return;
    if (decision === 'return' && !observations.trim()) {
      setError('Enter observations to return the application.');
      return;
    }
    if (decision === 'approve' && signature_loading) {
      setError('Wait for automatic signature verification to finish.');
      return;
    }
    if (decision === 'approve' && signature_requires_acknowledgement) {
      setConfirmationOpen(true);
      return;
    }
    await submitDecision(false);
  };

  if (is_loading) {
    return <LoadingSkeleton className="mx-auto max-w-7xl" />;
  }

  if (!application) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={error || 'Application not found'}
        action={
          <Link to="/secretary/inbox" className="btn-secondary inline-flex">
            <ArrowLeft size={16} /> Back to inbox
          </Link>
        }
        className="glass-card mx-auto max-w-xl"
      />
    );
  }

  const procedure_label = GetProcedureTypeLabel(application.procedure_type);
  const is_already_resolved =
    application.secretary_decision != null ||
    !['PENDING_SECRETARY', 'OBSERVED'].includes(application.status);
  const expected_signer = application.architect ?? application.citizen;
  const expected_signer_role = application.architect ? 'Responsible professional' : 'Applicant';
  const completed_checks = Object.values(checks).filter(Boolean).length;
  const submit_disabled =
    is_submitting || signature_loading || !decision || (decision === 'approve' && !all_checked);

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-4 pb-10">
      <DetailPageHeader
        back_to="/secretary/inbox"
        title={procedure_label}
        subtitle={
          <span className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            Received: {FormatDateTime(application.created_at)}
          </span>
        }
        status={application.status}
        content_class_name="text-left"
      />

      {error && <AlertBanner message={error} OnDismiss={() => setError(null)} />}

      {id && (
        <SignatureVerificationPanel
          request_id={id}
          refresh_key={signature_refresh_key}
          on_loading_change={setSignatureLoading}
          on_change={handleSignatureChange}
        />
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <main className="order-2 min-w-0 space-y-5 xl:order-1">
          <section className="border-y border-slate-200 bg-white py-5 text-left">
            <div className="mb-4 flex items-center gap-2 px-1">
              <User size={18} className="text-blue-700" />
              <div>
                <h2 className="text-sm font-black text-slate-900">File information</h2>
                <p className="text-xs text-slate-500">
                  Data to cross-check before issuing the review decision
                </p>
              </div>
            </div>

            <div className="grid divide-y divide-slate-200 border-y border-slate-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              {application.citizen && (
                <div className="p-4">
                  <p className="mb-3 text-xs font-black uppercase text-slate-500">Applicant</p>
                  <InfoGrid
                    items={[
                      {
                        label: 'Full name',
                        value: `${application.citizen.first_name} ${application.citizen.last_name}`,
                      },
                      { label: 'National ID', value: application.citizen.national_id },
                      { label: 'Email', value: application.citizen.email },
                      { label: 'Phone', value: application.citizen.phone },
                    ]}
                  />
                </div>
              )}

              {application.architect && (
                <div className="p-4">
                  <p className="mb-3 text-xs font-black uppercase text-slate-500">
                    Responsible professional
                  </p>
                  <InfoGrid
                    items={[
                      {
                        label: 'Full name',
                        value: `${application.architect.first_name} ${application.architect.last_name}`,
                      },
                      { label: 'National ID', value: application.architect.national_id },
                      { label: 'Professional title', value: application.architect.title },
                      {
                        label: 'SENESCYT registration',
                        value: application.architect.registration_number,
                      },
                      { label: 'Email', value: application.architect.email },
                      { label: 'Phone', value: application.architect.phone },
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 px-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-blue-700" />
                <p className="text-xs font-black uppercase text-slate-500">Property</p>
              </div>
              <InfoGrid
                items={[
                  { label: 'Procedure type', value: procedure_label },
                  { label: 'Zone', value: application.property?.location },
                  { label: 'Address', value: application.property?.address },
                  {
                    label: 'Area',
                    value: application.property?.area
                      ? `${application.property.area} m²`
                      : undefined,
                  },
                ]}
              />
              {application.property?.description && (
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                  {application.property.description}
                </p>
              )}
            </div>
          </section>

          <section className="border-y border-slate-200 bg-white py-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <FolderOpen size={18} className="text-blue-700" />
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Documents ({application.attachments.length})
                  </h2>
                  <p className="text-xs text-slate-500">Document file summary</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDocumentsOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100"
              >
                <FolderOpen size={15} /> Manage documents
              </button>
            </div>

            {application.attachments.length > 0 ? (
              <div className="mt-4 grid border-y border-slate-200 sm:grid-cols-2">
                {application.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:odd:border-r"
                  >
                    <FileText size={16} className="flex-none text-slate-400" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">{attachment.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 border-y border-slate-200 py-5 text-center text-xs text-slate-500">
                No attached documents.
              </p>
            )}
          </section>
        </main>

        <aside className="order-1 self-start xl:order-2 xl:sticky xl:top-24">
          {!is_already_resolved ? (
            <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <FileCheck2 size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Secretary Review</h2>
                  <p className="text-xs text-slate-500">File review and decision</p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase text-slate-500">
                    Document verification
                  </p>
                  <span className="text-xs font-bold text-slate-500">
                    {completed_checks}/{Object.keys(checks).length}
                  </span>
                </div>
                <div className="space-y-2">
                  <CheckItem
                    label="Required documents complete"
                    checked={checks.documents_complete}
                    on_toggle={() => toggleCheck('documents_complete')}
                  />
                  <CheckItem
                    label="Applicant data correct"
                    checked={checks.applicant_data_valid}
                    on_toggle={() => toggleCheck('applicant_data_valid')}
                  />
                  <CheckItem
                    label="Property correctly identified"
                    checked={checks.property_identified}
                    on_toggle={() => toggleCheck('property_identified')}
                  />
                  <CheckItem
                    label="Professional title and ID reviewed"
                    checked={checks.professional_title_valid}
                    on_toggle={() => toggleCheck('professional_title_valid')}
                  />
                </div>
              </div>

              <div className="border-y border-slate-200 py-3">
                <div className="flex items-start gap-2">
                  {signature_loading ? (
                    <Loader2 size={16} className="mt-0.5 animate-spin text-blue-700" />
                  ) : signature_requires_acknowledgement ? (
                    <ShieldAlert size={16} className="mt-0.5 text-amber-700" />
                  ) : (
                    <ShieldCheck size={16} className="mt-0.5 text-green-700" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800">Responsible party signature</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      {signature_loading
                        ? 'Verifying signatures and certificates...'
                        : signature_requires_acknowledgement
                          ? `Requires review: ${signature_summary?.status || 'ERROR'}`
                          : 'Identity, integrity, and trust verified.'}
                    </p>
                    {expected_signer && (
                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        {expected_signer_role}: {expected_signer.first_name}{' '}
                        {expected_signer.last_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase text-slate-500">Decision</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDecision('approve');
                      setConfirmationOpen(false);
                    }}
                    className={`min-h-16 rounded-lg border-2 p-3 text-left ${
                      decision === 'approve'
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2 size={17} />
                    <p className="mt-1 text-xs font-black">Approve</p>
                    <p className="text-[10px]">Send to technician</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDecision('return');
                      setConfirmationOpen(false);
                    }}
                    className={`min-h-16 rounded-lg border-2 p-3 text-left ${
                      decision === 'return'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <XCircle size={17} />
                    <p className="mt-1 text-xs font-black">Return</p>
                    <p className="text-[10px]">With observations</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">
                  Observations {decision === 'return' ? '*' : '(optional)'}
                </label>
                <textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  className="input-field resize-none"
                  rows={3}
                  placeholder={
                    decision === 'return'
                      ? 'Describe the errors or documents that must be corrected...'
                      : 'Additional notes for the file...'
                  }
                />
              </div>

              {!all_checked && decision === 'approve' && (
                <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-800">
                  <AlertCircle size={14} className="mt-0.5 flex-none" /> Complete document
                  verification to approve.
                </p>
              )}

              {decision === 'approve' && all_checked && signature_requires_acknowledgement && (
                <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-800">
                  <AlertCircle size={14} className="mt-0.5 flex-none" /> Approval will require
                  confirmation due to signature alerts.
                </p>
              )}

              <button
                type="button"
                onClick={() => void handleSubmitDecision()}
                disabled={submit_disabled}
                className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black ${
                  submit_disabled
                    ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                    : decision === 'approve'
                      ? 'bg-green-700 text-white hover:bg-green-800'
                      : 'bg-red-700 text-white hover:bg-red-800'
                }`}
              >
                {is_submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Saving...
                  </>
                ) : decision === 'approve' ? (
                  <>
                    <CheckCircle2 size={17} /> Approve and send
                  </>
                ) : decision === 'return' ? (
                  <>
                    <XCircle size={17} /> Return file
                  </>
                ) : (
                  'Select a decision'
                )}
              </button>
            </section>
          ) : (
            <section
              className={`rounded-lg border bg-white p-4 text-left shadow-sm ${
                application.secretary_decision?.is_approved ? 'border-green-300' : 'border-red-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {application.secretary_decision?.is_approved ? (
                  <CheckCircle2 size={22} className="text-green-700" />
                ) : (
                  <XCircle size={22} className="text-red-700" />
                )}
                <div>
                  <h2 className="text-sm font-black text-slate-900">Review recorded</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {application.secretary_decision?.is_approved ? 'Approved' : 'Returned'} ·{' '}
                    {application.secretary_decision?.created_at
                      ? FormatDateTime(application.secretary_decision.created_at)
                      : 'No date'}
                  </p>
                </div>
              </div>
              <p className="mt-4 border-y border-slate-200 py-3 text-xs leading-relaxed text-slate-700">
                Responsible party signature:{' '}
                {application.secretary_decision?.signature_validated
                  ? 'identity and integrity verified automatically.'
                  : 'signature alert acknowledged and recorded.'}
              </p>
              {application.secretary_decision?.observations && (
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  {application.secretary_decision.observations}
                </p>
              )}
            </section>
          )}
        </aside>
      </div>

      {id && (
        <BaseModal
          is_open={documents_open}
          OnClose={() => setDocumentsOpen(false)}
          title="Document management"
          size="xl"
          respect_header
        >
          <DocumentPanel
            request_id={id}
            allowed_upload
            allowed_ipfs
            on_attachments_changed={handleAttachmentsChanged}
            embedded
          />
        </BaseModal>
      )}

      <BaseModal
        is_open={confirmation_open}
        OnClose={() => setConfirmationOpen(false)}
        title="Confirm approval with alert"
        size="sm"
      >
        <div className="text-left">
          <div className="flex items-start gap-3 border-y border-amber-200 bg-amber-50 px-3 py-4 text-amber-900">
            <ShieldAlert size={21} className="mt-0.5 flex-none" />
            <div>
              <p className="text-sm font-black">The file contains signature alerts</p>
              <p className="mt-1 text-xs leading-relaxed">
                Status: {signature_summary?.status || 'ERROR'}. Confirm that you reviewed the
                details and want to send it to the technician. The decision will be recorded in the
                audit trail.
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmationOpen(false)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submitDecision(true)}
              disabled={is_submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {is_submitting && <Loader2 size={14} className="animate-spin" />}
              Continue with alert
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
