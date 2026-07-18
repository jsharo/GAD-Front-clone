import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileCheck2,
  Loader2,
} from 'lucide-react';
import {
  applications_api,
  SubmitSecretaryReview,
  type RequestSignatureSummary,
} from '@/lib/api.calls';
import { FormatDateTime } from '@/lib/utils';
import { GetProcedureTypeLabel } from '@/lib/constants/procedure.types';
import { DocumentPanel } from '@/components/documents/document.panel';
import { SignatureVerificationPanel } from '@/components/documents/signature.verification.panel';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { AlertBanner } from '@/components/ui/alert.banner';
import { DetailSection } from '@/components/ui/detail.section';
import { InfoGrid } from '@/components/ui/info.grid';
import { DetailPageHeader } from '@/components/ui/detail.page.header';

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

// ── Indicador de campo del formulario de dictamen ──
function CheckItem({
  label,
  checked,
  OnToggle,
}: {
  label: string;
  checked: boolean;
  OnToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={OnToggle}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
        checked ? 'border-success-light bg-success-light/10' : 'border-slate-200 bg-white'
      }`}
    >
      <div
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? 'border-green-500 bg-green-500' : 'border-slate-300'
        }`}
      >
        {checked && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <span className={`text-sm font-medium ${checked ? 'text-green-700' : 'text-slate-600'}`}>
        {label}
      </span>
    </button>
  );
}

export function ApplicationDetailSecretary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, set_application] = useState<ApplicationDetail | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  // Checklist de verificación
  const [checks, set_checks] = useState({
    documents_complete: false,
    data_correct: false,
    property_identified: false,
    title_validated: false,
  });
  const [signature_summary, set_signature_summary] = useState<RequestSignatureSummary | null>(null);
  const [signature_loading, set_signature_loading] = useState(true);
  const [signature_refresh_key, set_signature_refresh_key] = useState(0);
  const [confirm_unvalidated_signature, set_confirm_unvalidated_signature] = useState(false);

  const [decision, set_decision] = useState<'approve' | 'return' | null>(null);
  const [observations, set_observations] = useState('');
  const [is_submitting, set_is_submitting] = useState(false);

  const LoadApplication = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await applications_api.GetById(id);
      set_application(data as ApplicationDetail);
    } catch {
      set_error('No se pudo cargar la solicitud');
    } finally {
      set_is_loading(false);
    }
  }, [id]);

  useEffect(() => {
    LoadApplication();
  }, [LoadApplication]);

  const ToggleCheck = (key: keyof typeof checks) => {
    set_checks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const HandleSignatureChange = useCallback((summary: RequestSignatureSummary | null) => {
    set_signature_summary(summary);
    if (summary && !summary.requires_acknowledgement) {
      set_confirm_unvalidated_signature(false);
    }
  }, []);

  const all_checked = Object.values(checks).every(Boolean);
  const signature_validated = Boolean(signature_summary?.has_valid_expected_signature);
  const signature_requires_acknowledgement = signature_summary?.requires_acknowledgement ?? true;

  const SubmitDecision = async (acknowledge_signature_warning = false) => {
    if (!id || !decision) return;

    set_is_submitting(true);
    set_error(null);
    try {
      await SubmitSecretaryReview(id, {
        approved: decision === 'approve',
        acknowledge_signature_warning,
        remarks: observations.trim() || undefined,
      });
      navigate('/secretary/inbox');
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al registrar el dictamen');
    } finally {
      set_is_submitting(false);
    }
  };

  const HandleSubmitDecision = async () => {
    if (!id || !decision) return;
    if (decision === 'return' && !observations.trim()) {
      set_error('Escribe las observaciones para devolver la solicitud');
      return;
    }

    if (decision === 'approve' && signature_loading) {
      set_error('Espera a que termine la verificación automática de firmas');
      return;
    }

    if (decision === 'approve' && signature_requires_acknowledgement) {
      set_confirm_unvalidated_signature(true);
      return;
    }

    await SubmitDecision(false);
  };

  if (is_loading) {
    return <LoadingSkeleton className="max-w-3xl mx-auto" />;
  }

  if (!application || error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={error || 'Solicitud no encontrada'}
        action={
          <Link to="/secretary/inbox" className="btn-secondary inline-flex">
            <ArrowLeft size={16} /> Volver a la bandeja
          </Link>
        }
        className="glass-card max-w-xl mx-auto"
      />
    );
  }

  const type_label = GetProcedureTypeLabel(application.procedure_type);
  const is_already_resolved =
    application.secretary_decision != null ||
    !['PENDING_SECRETARY', 'OBSERVED'].includes(application.status);
  const expected_signer = application.architect ?? application.citizen;
  const expected_signer_role = application.architect ? 'Profesional responsable' : 'Solicitante';

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">
      <DetailPageHeader
        back_to="/secretary/inbox"
        title={type_label}
        subtitle={
          <span className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            Recibido: {FormatDateTime(application.created_at)}
          </span>
        }
        status={application.status}
        content_class_name="text-left"
      />

      {/* Error */}
      {error && (
        <AlertBanner message={error} OnDismiss={() => set_error(null)} className="text-left" />
      )}

      {application.citizen && (
        <DetailSection title="Ciudadano Solicitante" icon={User} className="text-left">
          <InfoGrid
            items={[
              {
                label: 'Nombre completo',
                value: `${application.citizen.first_name} ${application.citizen.last_name}`,
              },
              { label: 'Cédula', value: application.citizen.national_id },
              { label: 'Correo', value: application.citizen.email },
              { label: 'Teléfono', value: application.citizen.phone },
            ]}
          />
        </DetailSection>
      )}

      {application.architect && (
        <DetailSection
          title="Arquitecto Responsable (Patrocinador)"
          icon={User}
          className="text-left"
        >
          <InfoGrid
            items={[
              {
                label: 'Nombre completo',
                value: `${application.architect.first_name} ${application.architect.last_name}`,
              },
              { label: 'Cédula', value: application.architect.national_id },
              { label: 'Título profesional', value: application.architect.title },
              { label: 'Registro SENESCYT', value: application.architect.registration_number },
              { label: 'Correo', value: application.architect.email },
              { label: 'Teléfono', value: application.architect.phone },
            ]}
          />
        </DetailSection>
      )}

      <DetailSection title="Datos del Predio" icon={MapPin} className="text-left">
        <InfoGrid
          items={[
            { label: 'Tipo de trámite', value: type_label },
            {
              label: 'Zona',
              value: application.property?.location === 'URBAN' ? '🏙️ Urbano' : '🌾 Rural',
            },
            { label: 'Dirección', value: application.property?.address },
            {
              label: 'Área',
              value: application.property?.area ? `${application.property.area} m²` : undefined,
            },
          ]}
        />
        {application.property?.description && (
          <p className="text-slate-500 text-sm mt-3 pt-3 border-t border-slate-100">
            {application.property.description}
          </p>
        )}
      </DetailSection>

      {id && (
        <>
          <DocumentPanel
            request_id={id}
            allowed_upload
            allowed_ipfs
            OnAttachmentsChanged={() => set_signature_refresh_key((current) => current + 1)}
          />
          <SignatureVerificationPanel
            request_id={id}
            refresh_key={signature_refresh_key}
            OnLoadingChange={set_signature_loading}
            OnChange={HandleSignatureChange}
          />
        </>
      )}

      {/* ── PANEL DE DICTAMEN (solo si no está resuelta) ── */}
      {!is_already_resolved ? (
        <div className="glass-card border border-secondary-light p-5 space-y-5 text-left">
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-xl bg-secondary-light/10 p-2">
              <FileCheck2 size={20} className="text-secondary-dark" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-blue-955">Dictamen de Secretaría</h2>
              <p className="text-slate-400 text-xs">Verifica que el expediente esté completo</p>
            </div>
          </div>

          {/* Checklist de verificación */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Lista de verificación ({Object.values(checks).filter(Boolean).length}/
              {Object.keys(checks).length})
            </p>
            <div className="space-y-2">
              <CheckItem
                label="📁 Todos los documentos requeridos adjuntos"
                checked={checks.documents_complete}
                OnToggle={() => ToggleCheck('documents_complete')}
              />
              <CheckItem
                label="👤 Datos del solicitante correctos y completos"
                checked={checks.data_correct}
                OnToggle={() => ToggleCheck('data_correct')}
              />
              <CheckItem
                label="📍 Predio identificado con dirección clara"
                checked={checks.property_identified}
                OnToggle={() => ToggleCheck('property_identified')}
              />
              <CheckItem
                label="🪪 Título del Arquitecto validado con su Cédula"
                checked={checks.title_validated}
                OnToggle={() => ToggleCheck('title_validated')}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Firma digital del responsable
            </p>
            {expected_signer && (
              <p className="mb-3 text-xs text-slate-500">
                {expected_signer_role}: {expected_signer.first_name} {expected_signer.last_name}
                {expected_signer.national_id ? ` · Cédula ${expected_signer.national_id}` : ''}
              </p>
            )}
            {signature_loading ? (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                <Loader2 size={15} className="animate-spin" /> Verificando firmas y certificados...
              </div>
            ) : (
              <div
                className={
                  !signature_requires_acknowledgement
                    ? 'flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs leading-relaxed text-green-800'
                    : signature_validated
                      ? 'flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900'
                      : 'flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs leading-relaxed text-red-800'
                }
              >
                {!signature_requires_acknowledgement ? (
                  <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                )}
                <p>
                  {!signature_requires_acknowledgement
                    ? 'Firma, identidad y confianza verificadas automáticamente.'
                    : signature_validated
                      ? `La identidad y la integridad coinciden, pero existen advertencias. Estado: ${signature_summary?.status || 'ERROR'}.`
                      : `No existe una coincidencia automática válida. Estado: ${signature_summary?.status || 'ERROR'}. Revisa el detalle antes de decidir.`}
                </p>
              </div>
            )}
          </div>

          {/* Decisión */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Resolución
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  set_decision('approve');
                  set_confirm_unvalidated_signature(false);
                }}
                className={
                  decision === 'approve'
                    ? 'flex items-center gap-2 rounded-xl border-2 border-success-default bg-success-light/10 p-4 text-sm font-semibold text-success-dark'
                    : 'flex items-center gap-2 rounded-xl border-2 border-slate-200 p-4 text-sm font-semibold text-slate-500'
                }
              >
                <CheckCircle2 size={20} />
                <div className="text-left">
                  <p className="font-bold">Aprobar</p>
                  <p className="text-xs opacity-70">Enviar al técnico</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  set_decision('return');
                  set_confirm_unvalidated_signature(false);
                }}
                className={
                  decision === 'return'
                    ? 'flex items-center gap-2 rounded-xl border-2 border-error-default bg-error-light/10 p-4 text-sm font-semibold text-error-default'
                    : 'flex items-center gap-2 rounded-xl border-2 border-slate-200 p-4 text-sm font-semibold text-slate-500'
                }
              >
                <XCircle size={20} />
                <div className="text-left">
                  <p className="font-bold">Devolver</p>
                  <p className="text-xs opacity-70">Con observaciones</p>
                </div>
              </button>
            </div>
          </div>

          {/* Observaciones (siempre visible, obligatorio si devuelve) */}
          <div>
            <label className="input-label">
              Observaciones {decision === 'return' ? '*' : '(opcional)'}
            </label>
            <textarea
              value={observations}
              onChange={(e) => set_observations(e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder={
                decision === 'return'
                  ? 'Describe qué documentos faltan, qué errores se encontraron o qué debe corregir el ciudadano...'
                  : 'Notas adicionales para el expediente (opcional)...'
              }
            />
          </div>

          {!all_checked && (
            <div className="flex items-start gap-3 rounded-xl border border-warning-light bg-warning-light/20 p-3">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs leading-relaxed">
                Completa la lista de verificación antes de aprobar. Puedes devolver sin completarla
                si el expediente está incompleto.
              </p>
            </div>
          )}

          {decision === 'approve' && all_checked && signature_requires_acknowledgement && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-700" />
              <p className="text-xs leading-relaxed text-amber-800">
                La verificación contiene diferencias, incertidumbres o alertas de confianza. El
                expediente puede avanzar solo con confirmación explícita y trazabilidad.
              </p>
            </div>
          )}

          {confirm_unvalidated_signature && (
            <div
              role="alert"
              className="space-y-3 rounded-xl border border-amber-400 bg-amber-50 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-amber-700" />
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Confirmar aprobación con alerta de identidad
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    Confirma que deseas enviar el expediente al técnico después de revisar las
                    diferencias, incertidumbres o alertas de confianza mostradas por el verificador.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => set_confirm_unvalidated_signature(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void SubmitDecision(true)}
                  disabled={is_submitting}
                  className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-60"
                >
                  {is_submitting ? 'Guardando...' : 'Continuar con alerta'}
                </button>
              </div>
            </div>
          )}

          {/* Botón de confirmar */}
          <button
            type="button"
            onClick={HandleSubmitDecision}
            disabled={
              is_submitting ||
              signature_loading ||
              !decision ||
              confirm_unvalidated_signature ||
              (decision === 'approve' && !all_checked)
            }
            className={
              !decision ||
              signature_loading ||
              confirm_unvalidated_signature ||
              (decision === 'approve' && !all_checked)
                ? 'flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 py-3.5 font-bold text-slate-400'
                : decision === 'approve'
                  ? 'flex w-full items-center justify-center gap-2 rounded-xl bg-success-default py-3.5 font-bold text-white hover:bg-success-dark'
                  : 'flex w-full items-center justify-center gap-2 rounded-xl bg-error-default py-3.5 font-bold text-white hover:bg-red-700'
            }
          >
            {is_submitting ? (
              <span>Guardando...</span>
            ) : decision === 'approve' ? (
              <>
                <CheckCircle2 size={18} /> Aprobar y enviar al Técnico
              </>
            ) : decision === 'return' ? (
              <>
                <XCircle size={18} /> Devolver al Ciudadano con observaciones
              </>
            ) : (
              'Selecciona una resolución'
            )}
          </button>
        </div>
      ) : (
        /* ── Dictamen ya registrado (solo lectura) ── */
        <div
          className={
            application.secretary_decision?.is_approved
              ? 'glass-card border border-success-light p-5 text-left'
              : 'glass-card border border-error-light p-5 text-left'
          }
        >
          <div className="flex items-center gap-3 mb-3">
            {application.secretary_decision?.is_approved ? (
              <CheckCircle2 size={24} className="text-green-600" />
            ) : (
              <XCircle size={24} className="text-red-600" />
            )}
            <div>
              <h2 className="font-heading font-bold text-blue-955">
                Dictamen registrado:{' '}
                {application.secretary_decision?.is_approved ? '✅ Aprobado' : '❌ Devuelto'}
              </h2>
              {application.secretary_decision?.created_at && (
                <p className="text-slate-400 text-xs">
                  {FormatDateTime(application.secretary_decision.created_at)}
                </p>
              )}
            </div>
          </div>
          <div
            className={
              application.secretary_decision?.signature_validated
                ? 'rounded-xl border border-success-light bg-success-light/10 p-3 text-sm font-medium text-success-dark'
                : 'rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-medium text-amber-800'
            }
          >
            Firma del responsable:{' '}
            {application.secretary_decision?.signature_validated
              ? 'identidad e integridad verificadas automáticamente'
              : 'sin coincidencia automática; alerta registrada'}
          </div>
          {application.secretary_decision?.observations && (
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200 mt-2">
              {application.secretary_decision.observations}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
