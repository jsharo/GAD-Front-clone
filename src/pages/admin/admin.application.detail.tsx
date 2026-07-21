import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Calendar, User, MapPin, XCircle, AlertCircle } from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
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

interface ApplicationDetail {
  id: string;
  created_at: string;
  status: string;
  procedure_type: string;
  rejection_reason: string | null;
  observations: string | null;
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

export function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [application, set_application] = useState<ApplicationDetail | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  const LoadApplication = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await applications_api.GetById(id);
      set_application(data as ApplicationDetail);
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error loading application');
    } finally {
      set_is_loading(false);
    }
  }, [id]);

  useEffect(() => {
    LoadApplication();
  }, [LoadApplication]);

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

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      <DetailPageHeader
        back_to="/admin/applications"
        title={GetProcedureTypeLabel(application.procedure_type) || 'Zoning Procedure'}
        subtitle={`ID: #${id?.slice(0, 8)}... • Created ${FormatDateTime(application.created_at)}`}
        status={application.status}
      />

      {/* Error */}
      {error && <AlertBanner message={error} OnDismiss={() => set_error(null)} />}

      {!is_rejected && (
        <DetailSection title="Application Progress">
          <ApplicationTimeline current_status={application.status} />
        </DetailSection>
      )}

      {is_rejected && (
        <DetailSection title="Application Rejected" icon={XCircle} className="border-red-500/30">
          <p className="text-blue-800 text-sm">
            {application.rejection_reason || application.observations || 'No reason specified.'}
          </p>
        </DetailSection>
      )}

      <DetailSection title="Property Details" icon={MapPin}>
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
        <DetailSection title="Assigned Technician" icon={User}>
          <p className="text-blue-955 font-medium">
            {application.technician.first_name} {application.technician.last_name}
          </p>
          <p className="text-slate-500 text-sm">{application.technician.email}</p>
        </DetailSection>
      )}

      {application.schedule && (
        <DetailSection title="Scheduled Inspection" icon={Calendar}>
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

      {id && <DocumentPanel request_id={id} allowed_upload allowed_ipfs />}
    </div>
  );
}
