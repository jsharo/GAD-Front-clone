import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileCheck2,
} from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { getProcedureTypeLabel } from '@/lib/constants/procedure-types';
import { AttachmentRow } from '@/components/logic/attachment.row';
import { DocumentPanel } from '@/components/documents/DocumentPanel';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { AlertBanner } from '@/components/ui/alert.banner';
import { DetailSection } from '@/components/ui/detail.section';
import { InfoGrid } from '@/components/ui/info.grid';
import { DetailPageHeader } from '@/components/ui/detail-page.header';

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
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
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
    documentosCompletos: false,
    datosCorrectos: false,
    predioIdentificado: false,
    validarTitulo: false,
  });

  // Formulario de dictamen
  const [decision, set_decision] = useState<'aprobar' | 'devolver' | null>(null);
  const [observations, set_observations] = useState('');
  const [is_submitting, set_is_submitting] = useState(false);

  const mapApplicationObj = (s: any): ApplicationDetail | null => {
    if (!s) return null;
    return {
      id: s.id,
      created_at: s.createdAt,
      status: s.estado,
      procedure_type: s.tipoTramite,
      rejection_reason: s.motivoRechazo,
      observations: s.observaciones,
      secretary_decision: s.dictamenSecretaria
        ? {
            is_approved: s.dictamenSecretaria.aprobada,
            observations: s.dictamenSecretaria.observaciones,
            created_at: s.dictamenSecretaria.creadoEn,
          }
        : null,
      citizen: s.ciudadano
        ? {
            first_name: s.ciudadano.nombre,
            last_name: s.ciudadano.apellido,
            national_id: s.ciudadano.cedula,
            email: s.ciudadano.email,
            phone: s.ciudadano.telefono,
          }
        : null,
      architect: s.arquitecto
        ? {
            first_name: s.arquitecto.nombre,
            last_name: s.arquitecto.apellido,
            national_id: s.arquitecto.cedula,
            email: s.arquitecto.email,
            phone: s.arquitecto.telefono,
            title: s.arquitecto.titulo,
            registration_number: s.arquitecto.numeroRegistro,
          }
        : null,
      property: s.predio
        ? {
            address: s.predio.direccion,
            location: s.predio.ubicacion,
            area: s.predio.area,
            description: s.predio.descripcion,
          }
        : null,
      attachments: (s.anexos || []).map((anexo: any) => ({
        id: anexo.id,
        name: anexo.nombre,
        size: anexo.tamano,
        hash: anexo.hash,
        key: anexo.key,
        mime_type: anexo.tipoMime,
      })),
    };
  };

  const loadApplication = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await applications_api.getById(id);
      set_application(mapApplicationObj(data));
    } catch {
      set_error('No se pudo cargar la solicitud');
    } finally {
      set_is_loading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const toggleCheck = (key: keyof typeof checks) => {
    set_checks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const all_checked = Object.values(checks).every(Boolean);

  const handleSubmitDecision = async () => {
    if (!id || !decision) return;
    if (decision === 'devolver' && !observations.trim()) {
      set_error('Escribe las observaciones para devolver la solicitud');
      return;
    }
    set_is_submitting(true);
    set_error(null);
    try {
      await api.post(`/api/v1/solicitudes/${id}/dictamen-secretaria`, {
        aprobada: decision === 'aprobar',
        observaciones: observations.trim() || undefined,
      });
      navigate('/secretary/inbox');
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al registrar el dictamen');
    } finally {
      set_is_submitting(false);
    }
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

  const tipo_label = getProcedureTypeLabel(application.procedure_type);
  const citizen_docs = (application.attachments ?? []).filter(
    (a: any) => a.mime_type !== 'INSPECCION_FOTO'
  );
  const is_already_resolved =
    application.secretary_decision != null ||
    !['PENDIENTE_SECRETARIA', 'OBSERVADO'].includes(application.status);

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">
      <DetailPageHeader
        backTo="/secretary/inbox"
        title={tipo_label}
        subtitle={
          <span className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            Recibido: {formatDateTime(application.created_at)}
          </span>
        }
        status={application.status}
        contentClassName="text-left"
      />

      {/* Error */}
      {error && (
        <AlertBanner message={error} onDismiss={() => set_error(null)} className="text-left" />
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
            { label: 'Tipo de trámite', value: tipo_label },
            {
              label: 'Zona',
              value: application.property?.location === 'URBANO' ? '🏙️ Urbano' : '🌾 Rural',
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

      {id && <DocumentPanel requestId={id} allowedUpload allowedIpfs />}

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
                checked={checks.documentosCompletos}
                onToggle={() => toggleCheck('documentosCompletos')}
              />
              <CheckItem
                label="👤 Datos del solicitante correctos y completos"
                checked={checks.datosCorrectos}
                onToggle={() => toggleCheck('datosCorrectos')}
              />
              <CheckItem
                label="📍 Predio identificado con dirección clara"
                checked={checks.predioIdentificado}
                onToggle={() => toggleCheck('predioIdentificado')}
              />
              <CheckItem
                label="🪪 Título del Arquitecto validado con su Cédula"
                checked={checks.validarTitulo}
                onToggle={() => toggleCheck('validarTitulo')}
              />
            </div>
          </div>

          {/* Decisión */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Resolución
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => set_decision('aprobar')}
                className={
                  decision === 'aprobar'
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
                onClick={() => set_decision('devolver')}
                className={
                  decision === 'devolver'
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
              Observaciones {decision === 'devolver' ? '*' : '(opcional)'}
            </label>
            <textarea
              value={observations}
              onChange={(e) => set_observations(e.target.value)}
              className="input-field resize-none"
              rows={4}
              placeholder={
                decision === 'devolver'
                  ? 'Describe qué documentos faltan, qué errores se encontraron o qué debe corregir el ciudadano...'
                  : 'Notas adicionales para el expediente (opcional)...'
              }
            />
          </div>

          {/* Aviso de verificación */}
          {!all_checked && (
            <div className="flex items-start gap-3 rounded-xl border border-warning-light bg-warning-light/20 p-3">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-xs leading-relaxed">
                Completa la lista de verificación antes de aprobar. Puedes devolver sin completarla
                si el expediente está incompleto.
              </p>
            </div>
          )}

          {/* Botón de confirmar */}
          <button
            type="button"
            onClick={handleSubmitDecision}
            disabled={is_submitting || !decision || (decision === 'aprobar' && !all_checked)}
            className={
              !decision || (decision === 'aprobar' && !all_checked)
                ? 'flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 py-3.5 font-bold text-slate-400'
                : decision === 'aprobar'
                  ? 'flex w-full items-center justify-center gap-2 rounded-xl bg-success-default py-3.5 font-bold text-white hover:bg-success-dark'
                  : 'flex w-full items-center justify-center gap-2 rounded-xl bg-error-default py-3.5 font-bold text-white hover:bg-red-700'
            }
          >
            {is_submitting ? (
              <span>Guardando...</span>
            ) : decision === 'aprobar' ? (
              <>
                <CheckCircle2 size={18} /> Aprobar y enviar al Técnico
              </>
            ) : decision === 'devolver' ? (
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
                  {formatDateTime(application.secretary_decision.created_at)}
                </p>
              )}
            </div>
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
