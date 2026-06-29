import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileText,
  Calendar,
  User,
  MapPin,
  XCircle,
  Upload,
  Send,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { applications_api, attachments_api } from '@/lib/api.calls';
import { formatDateTime, cn } from '@/lib/utils';
import { getProcedureTypeLabel } from '@/lib/constants/procedure-types';
import { ApplicationTimeline } from '@/components/ui/application.timeline';
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
}

interface Payment {
  id: string;
  amount: number;
  concept: string;
  status: string;
}

interface ApplicationDetail {
  id: string;
  created_at: string;
  status: string;
  procedure_type: string;
  rejection_reason: string | null;
  observations: string | null;
  secretary_decision: {
    observations: string | null;
  } | null;
  payments: Payment[];
  citizen: {
    first_name: string;
    last_name: string;
    national_id: string;
    email: string;
    phone: string | null;
  } | null;
  property: {
    address: string;
    location: string;
    area: number;
    description: string | null;
  } | null;
  technician: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  schedule: {
    date: string;
    notes: string | null;
    is_confirmed: boolean;
  } | null;
  attachments: Attachment[];
}

export function ProcedureDetail() {
  const { id } = useParams<{ id: string }>();
  const [application, set_application] = useState<ApplicationDetail | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);
  const [is_uploading_file, set_is_uploading_file] = useState(false);

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
            observations: s.dictamenSecretaria.observaciones,
          }
        : null,
      payments: (s.cobros || []).map((c: any) => ({
        id: c.id,
        amount: c.monto,
        concept: c.concepto,
        status: c.estado,
      })),
      citizen: s.ciudadano
        ? {
            first_name: s.ciudadano.nombre,
            last_name: s.ciudadano.apellido,
            national_id: s.ciudadano.cedula,
            email: s.ciudadano.email,
            phone: s.ciudadano.telefono,
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
      technician: s.tecnico
        ? {
            first_name: s.tecnico.nombre,
            last_name: s.tecnico.apellido,
            email: s.tecnico.email,
          }
        : null,
      schedule: s.agenda
        ? {
            date: s.agenda.fecha,
            notes: s.agenda.notas,
            is_confirmed: s.agenda.confirmada,
          }
        : null,
      attachments: (s.anexos || []).map((anexo: any) => ({
        id: anexo.id,
        name: anexo.nombre,
        size: anexo.tamano,
        hash: anexo.hash,
        key: anexo.key,
      })),
    };
  };

  const loadApplication = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await applications_api.getById(id);
      const mapped = mapApplicationObj(data);
      set_application(mapped);
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al cargar la solicitud');
    } finally {
      set_is_loading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    set_is_uploading_file(true);
    try {
      await attachments_api.upload(id, file);
      await loadApplication();
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al subir archivo');
    } finally {
      set_is_uploading_file(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!id) return;
    set_is_submitting(true);
    set_error(null);
    try {
      await applications_api.send(id);
      await loadApplication();
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al enviar');
    } finally {
      set_is_submitting(false);
    }
  };

  if (is_loading) return <LoadingSkeleton className="max-w-3xl mx-auto" />;

  if (!application)
    return (
      <EmptyState
        icon={AlertCircle}
        title={error || 'Solicitud no encontrada'}
        className="glass-card max-w-xl mx-auto"
      />
    );

  const is_rejected = application.status === 'RECHAZADO';
  const is_draft = application.status === 'BORRADOR';
  const payment = application.payments?.[0];
  const is_payment_paid = payment?.status === 'PAGADO';

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      <DetailPageHeader
        backTo="/architect/procedures"
        title={getProcedureTypeLabel(application.procedure_type) || 'Trámite de Ordenamiento'}
        subtitle={`ID: #${id?.slice(0, 8)}... • Creado ${formatDateTime(application.created_at)}`}
        status={application.status}
        contentClassName="text-left"
      />

      {/* Error */}
      {error && (
        <AlertBanner message={error} onDismiss={() => set_error(null)} className="text-left" />
      )}

      <DetailSection title="Progreso del Trámite" className="pb-12 mb-6">
        <ApplicationTimeline current_status={application.status} />
      </DetailSection>

      {/* Observaciones de Secretaría (cuando devuelven) */}
      {application.status === 'OBSERVADO' && application.secretary_decision?.observations && (
        <DetailSection
          title="Trámite Observado por Secretaría"
          icon={AlertCircle}
          className="border-amber-500/30 text-left"
        >
          <p className="text-blue-955 text-sm bg-amber-50 p-4 rounded-xl border border-amber-100">
            {application.secretary_decision.observations}
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Por favor, revisa las observaciones, corrige la información o sube los documentos
            faltantes.
          </p>
        </DetailSection>
      )}

      {(application.status === 'PENDIENTE_PAGO' ||
        application.status === 'PAGADO' ||
        application.status === 'APROBADO') &&
        application.payments?.length > 0 && (
          <DetailSection
            title="Información de Pago"
            icon={DollarSign}
            className={cn(
              'text-left',
              is_payment_paid ? 'border-success-light' : 'border-warning-light'
            )}
          >
            <div className="flex justify-end -mt-10 mb-4">
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold',
                  is_payment_paid
                    ? 'border border-success-light bg-success-light/20 text-success-dark'
                    : 'border border-warning-light bg-warning-light/20 text-warning-dark'
                )}
              >
                {is_payment_paid ? '✅ Pago Recibido' : '⏳ Pendiente de Pago'}
              </span>
            </div>
            <InfoGrid
              items={[
                {
                  label: 'Monto a pagar',
                  value: `$${Number(payment?.amount ?? 0).toFixed(2)}`,
                },
                { label: 'Concepto', value: payment?.concept },
              ]}
            />
            {payment?.status === 'PENDIENTE' && (
              <div className="mt-4 rounded-xl border border-primary-light/30 bg-primary-light/10 p-3">
                <p className="text-xs text-blue-800">
                  El propietario debe acercarse a las ventanillas de recaudación del GAD Municipal
                  con el número de trámite <strong>#{id?.slice(0, 8).toUpperCase()}</strong> para
                  cancelar el valor correspondiente.
                </p>
              </div>
            )}
          </DetailSection>
        )}

      {is_rejected && (
        <DetailSection
          title="Solicitud Rechazada"
          icon={XCircle}
          className="border-red-500/30 text-left"
        >
          <p className="text-blue-800 text-sm">
            {application.rejection_reason || application.observations || 'Sin motivo especificado.'}
          </p>
        </DetailSection>
      )}

      {/* Datos del Propietario */}
      {application.citizen && (
        <DetailSection title="Propietario del Predio (Cliente)" icon={User} className="text-left">
          <InfoGrid
            items={[
              {
                label: 'Nombre',
                value: `${application.citizen.first_name} ${application.citizen.last_name}`,
              },
              { label: 'Identificación (Cédula/RUC)', value: application.citizen.national_id },
              { label: 'Correo Electrónico', value: application.citizen.email },
              { label: 'Teléfono', value: application.citizen.phone },
            ]}
          />
        </DetailSection>
      )}

      <DetailSection title="Datos del Predio" icon={MapPin} className="text-left">
        <InfoGrid
          items={[
            { label: 'Dirección', value: application.property?.address },
            { label: 'Ubicación', value: application.property?.location },
            {
              label: 'Área',
              value: application.property?.area ? `${application.property.area} m²` : undefined,
            },
            { label: 'Tipo', value: application.procedure_type },
          ]}
        />
        {application.property?.description && (
          <p className="text-blue-800 text-sm mt-3 border-t border-surface-border pt-3">
            {application.property.description}
          </p>
        )}
      </DetailSection>

      {application.technician && (
        <DetailSection title="Técnico Asignado" icon={User} className="text-left">
          <p className="text-blue-955 font-medium">
            {application.technician.first_name} {application.technician.last_name}
          </p>
          <p className="text-slate-500 text-sm">{application.technician.email}</p>
        </DetailSection>
      )}

      {application.schedule && (
        <DetailSection title="Inspección Programada" icon={Calendar} className="text-left">
          <p className="text-blue-955 font-medium">{formatDateTime(application.schedule.date)}</p>
          {application.schedule.notes && (
            <p className="text-blue-800 text-sm mt-1">{application.schedule.notes}</p>
          )}
          <span
            className={cn(
              'badge mt-2',
              application.schedule.is_confirmed ? 'badge-aprobado' : 'badge-revision'
            )}
          >
            {application.schedule.is_confirmed ? 'Confirmada' : 'Pendiente de confirmación'}
          </span>
        </DetailSection>
      )}

      {id && <DocumentPanel requestId={id} allowedUpload />}

      {/* Acción: Enviar a revisión */}
      {is_draft && (
        <DetailSection title="Enviar a Revisión" className="border-primary/30 text-left">
          <p className="text-slate-500 text-sm mb-4">
            Al enviar, confirmas que los datos y anexos proporcionados son correctos, y la solicitud
            será asignada automáticamente a la Secretaría del GAD para revisión documental.
          </p>
          {(application.attachments?.length ?? 0) === 0 && (
            <p className="text-yellow-400 text-sm mb-3 flex items-center gap-2">
              <AlertCircle size={14} /> Debes adjuntar al menos un documento.
            </p>
          )}
          <button
            id="detalle-enviar"
            onClick={handleSubmitApplication}
            disabled={is_submitting || application.attachments?.length === 0}
            className="btn-primary w-full"
          >
            {is_submitting ? (
              <span>Enviando...</span>
            ) : (
              <>
                <Send size={18} /> Enviar a Revisión
              </>
            )}
          </button>
        </DetailSection>
      )}
    </div>
  );
}
