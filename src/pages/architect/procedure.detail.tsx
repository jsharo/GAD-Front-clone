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
import { FormatDateTime, Cn } from '@/lib/utils';
import { GetProcedureTypeLabel } from '@/lib/constants/procedure.types';
import { ApplicationTimeline } from '@/components/ui/application.timeline';
import { AttachmentRow } from '@/components/logic/attachment.row';
import { DocumentPanel } from '@/components/documents/document.panel';
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

  const LoadApplication = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await applications_api.GetById(id);
      set_application(data as ApplicationDetail);
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error loading the application');
    } finally {
      set_is_loading(false);
    }
  }, [id]);

  useEffect(() => {
    LoadApplication();
  }, [LoadApplication]);

  const HandleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    set_is_uploading_file(true);
    try {
      await attachments_api.Upload(id, file);
      await LoadApplication();
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error uploading file');
    } finally {
      set_is_uploading_file(false);
    }
  };

  const HandleSubmitApplication = async () => {
    if (!id) return;
    set_is_submitting(true);
    set_error(null);
    try {
      await applications_api.Send(id);
      await LoadApplication();
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error submitting');
    } finally {
      set_is_submitting(false);
    }
  };

  if (is_loading) return <LoadingSkeleton className="max-w-3xl mx-auto" />;

  if (!application)
    return (
      <EmptyState
        icon={AlertCircle}
        title={error || 'Application not found'}
        className="glass-card max-w-xl mx-auto"
      />
    );

  const is_rejected = application.status === 'REJECTED';
  const is_draft = application.status === 'DRAFT';
  const payment = application.payments?.[0];
  const is_payment_paid = payment?.status === 'PAID' || payment?.status === 'PAID';

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      <DetailPageHeader
        back_to="/architect/procedures"
        title={GetProcedureTypeLabel(application.procedure_type) || 'Planning Procedure'}
        subtitle={`ID: #${id?.slice(0, 8)}... • Created ${FormatDateTime(application.created_at)}`}
        status={application.status}
        content_class_name="text-left"
      />

      {/* Error */}
      {error && (
        <AlertBanner message={error} OnDismiss={() => set_error(null)} className="text-left" />
      )}

      <DetailSection title="Procedure Progress" className="pb-12 mb-6">
        <ApplicationTimeline current_status={application.status} />
      </DetailSection>

      {/* Observaciones de Secretaría (cuando devuelven) */}
      {application.status === 'OBSERVED' && application.secretary_decision?.observations && (
        <DetailSection
          title="Procedure Observed by Secretariat"
          icon={AlertCircle}
          className="border-amber-500/30 text-left"
        >
          <p className="text-blue-955 text-sm bg-amber-50 p-4 rounded-xl border border-amber-100">
            {application.secretary_decision.observations}
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Please review the observations, correct the information, or upload the missing
            documents.
          </p>
        </DetailSection>
      )}

      {(application.status === 'PENDING_PAYMENT' ||
        application.status === 'PAID' ||
        application.status === 'APPROVED') &&
        application.payments?.length > 0 && (
          <DetailSection
            title="Payment Information"
            icon={DollarSign}
            className={Cn(
              'text-left',
              is_payment_paid ? 'border-success-light' : 'border-warning-light'
            )}
          >
            <div className="flex justify-end -mt-10 mb-4">
              <span
                className={Cn(
                  'px-3 py-1 rounded-full text-xs font-bold',
                  is_payment_paid
                    ? 'border border-success-light bg-success-light/20 text-success-dark'
                    : 'border border-warning-light bg-warning-light/20 text-warning-dark'
                )}
              >
                {is_payment_paid ? '✅ Payment Received' : '⏳ Payment Pending'}
              </span>
            </div>
            <InfoGrid
              items={[
                {
                  label: 'Amount due',
                  value: `$${Number(payment?.amount ?? 0).toFixed(2)}`,
                },
                { label: 'Concept', value: payment?.concept },
              ]}
            />
            {(payment?.status === 'PENDING' || payment?.status === 'PENDIENTE') && (
              <div className="mt-4 rounded-xl border border-primary-light/30 bg-primary-light/10 p-3">
                <p className="text-xs text-blue-800">
                  The owner must visit the GAD Municipal revenue windows with procedure number{' '}
                  <strong>#{id?.slice(0, 8).toUpperCase()}</strong> to pay the corresponding amount.
                </p>
              </div>
            )}
          </DetailSection>
        )}

      {is_rejected && (
        <DetailSection
          title="Application Rejected"
          icon={XCircle}
          className="border-red-500/30 text-left"
        >
          <p className="text-blue-800 text-sm">
            {application.rejection_reason || application.observations || 'No reason specified.'}
          </p>
        </DetailSection>
      )}

      {/* Datos del Propietario */}
      {application.citizen && (
        <DetailSection title="Property Owner (Client)" icon={User} className="text-left">
          <InfoGrid
            items={[
              {
                label: 'Name',
                value: `${application.citizen.first_name} ${application.citizen.last_name}`,
              },
              { label: 'Identification (National ID/RUC)', value: application.citizen.national_id },
              { label: 'Email', value: application.citizen.email },
              { label: 'Phone', value: application.citizen.phone },
            ]}
          />
        </DetailSection>
      )}

      <DetailSection title="Property Details" icon={MapPin} className="text-left">
        <InfoGrid
          items={[
            { label: 'Address', value: application.property?.address },
            { label: 'Location', value: application.property?.location },
            {
              label: 'Area',
              value: application.property?.area ? `${application.property.area} m²` : undefined,
            },
            { label: 'Type', value: application.procedure_type },
          ]}
        />
        {application.property?.description && (
          <p className="text-blue-800 text-sm mt-3 border-t border-surface-border pt-3">
            {application.property.description}
          </p>
        )}
      </DetailSection>

      {application.technician && (
        <DetailSection title="Assigned Technician" icon={User} className="text-left">
          <p className="text-blue-955 font-medium">
            {application.technician.first_name} {application.technician.last_name}
          </p>
          <p className="text-slate-500 text-sm">{application.technician.email}</p>
        </DetailSection>
      )}

      {application.schedule && (
        <DetailSection title="Scheduled Inspection" icon={Calendar} className="text-left">
          <p className="text-blue-955 font-medium">{FormatDateTime(application.schedule.date)}</p>
          {application.schedule.notes && (
            <p className="text-blue-800 text-sm mt-1">{application.schedule.notes}</p>
          )}
          <span
            className={Cn(
              'badge mt-2',
              application.schedule.is_confirmed ? 'badge-approved' : 'badge-review'
            )}
          >
            {application.schedule.is_confirmed ? 'Confirmed' : 'Pending confirmation'}
          </span>
        </DetailSection>
      )}

      {id && <DocumentPanel request_id={id} allowed_upload />}

      {/* Acción: Enviar a revisión */}
      {is_draft && (
        <DetailSection title="Submit for Review" className="border-primary/30 text-left">
          <p className="text-slate-500 text-sm mb-4">
            By submitting, you confirm that the data and attachments provided are correct, and the
            application will be automatically assigned to the GAD Secretariat for document review.
          </p>
          {(application.attachments?.length ?? 0) === 0 && (
            <p className="text-yellow-400 text-sm mb-3 flex items-center gap-2">
              <AlertCircle size={14} /> You must attach at least one document.
            </p>
          )}
          <button
            id="detail-submit"
            onClick={HandleSubmitApplication}
            disabled={is_submitting || application.attachments?.length === 0}
            className="btn-primary w-full"
          >
            {is_submitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <Send size={18} /> Submit for Review
              </>
            )}
          </button>
        </DetailSection>
      )}
    </div>
  );
}
