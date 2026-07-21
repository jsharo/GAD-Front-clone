import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, User, MapPin, CheckCircle2, XCircle, AlertCircle, ZoomIn } from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import { FormatDateTime, Cn } from '@/lib/utils';
import { GetProcedureTypeLabel } from '@/lib/constants/procedure.types';
import { FetchFileBlob, GetFileUrl } from '@/lib/files';
import { InspectionReporter } from '@/components/logic/inspection.reporter';
import { AttachmentRow } from '@/components/logic/attachment.row';
import { DocumentPanel } from '@/components/documents/document.panel';
import { ImageLightbox } from '@/components/logic/image.lightbox';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { AlertBanner } from '@/components/ui/alert.banner';
import { DetailSection } from '@/components/ui/detail.section';
import { InfoGrid } from '@/components/ui/info.grid';
import { ZoneBadge } from '@/components/ui/zone.badge';
import { DetailPageHeader } from '@/components/ui/detail.page.header';
import { useToastStore } from '@/stores/toast.store';

interface InspectionApplication {
  id: string;
  procedure_type: string;
  status: string;
  created_at: string;
  report_comments?: string | null;
  report_date?: string | null;
  observations?: string | null;
  rejection_reason?: string | null;
  citizen?: {
    first_name: string;
    last_name: string;
    national_id: string;
    email: string;
    phone?: string | null;
  } | null;
  property?: {
    location: string;
    address: string;
    area?: number | null;
    description?: string | null;
  } | null;
  citizen_documents: Array<{
    id: string;
    key: string;
    name: string;
    size: number;
    hash: string;
  }>;
  existing_photos: Array<{
    id: string;
    key: string;
    name: string;
    size: number;
  }>;
}

const MapInspectionApplication = (data: any): InspectionApplication => {
  const citizen_docs =
    data.citizen_documents ??
    (data.attachments || []).filter((a: any) => a.type !== 'INSPECTION_PHOTO');
  const inspection_pics =
    data.inspection_photos ??
    (data.attachments || []).filter((a: any) => a.type === 'INSPECTION_PHOTO');

  return {
    id: data.id,
    procedure_type: data.procedure_type || '',
    status: data.status || '',
    created_at: data.created_at || '',
    report_comments: data.report_comments || data.schedule?.notes || null,
    report_date: data.report_date || data.schedule?.date || null,
    observations: data.observations || null,
    rejection_reason: data.rejection_reason || null,
    citizen: data.citizen
      ? {
          first_name: data.citizen.first_name || '',
          last_name: data.citizen.last_name || '',
          national_id: data.citizen.national_id || '',
          email: data.citizen.email || '',
          phone: data.citizen.phone || null,
        }
      : null,
    property: data.property
      ? {
          location: data.property.location || '',
          address: data.property.address || '',
          area: data.property.area || null,
          description: data.property.description || null,
        }
      : null,
    citizen_documents: citizen_docs.map((attachment: any) => ({
      id: attachment.id,
      key: attachment.key,
      name: attachment.name || '',
      size: attachment.size || 0,
      hash: attachment.hash || '',
    })),
    existing_photos: inspection_pics.map((attachment: any) => ({
      id: attachment.id,
      key: attachment.key,
      name: attachment.name || '',
      size: attachment.size || 0,
    })),
  };
};

export function InspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const AddToast = useToastStore((state) => state.AddToast);

  const [application, set_application] = useState<InspectionApplication | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);
  const [lightbox_src, set_lightbox_src] = useState<string | null>(null);

  const LoadApplication = useCallback(async () => {
    if (!id) return;
    set_is_loading(true);
    try {
      const { data } = await applications_api.GetById(id);
      set_application(MapInspectionApplication(data));
    } catch {
      set_error('Could not load the application');
    } finally {
      set_is_loading(false);
    }
  }, [id]);

  useEffect(() => {
    LoadApplication();
  }, [LoadApplication]);

  const HandleSubmitReport = async (report_data: {
    status: 'APPROVED' | 'REJECTED';
    dimensions_verified: number;
    front_setback: boolean;
    back_setback: boolean;
    left_setback: boolean;
    right_setback: boolean;
    observations: string;
    gps_latitude?: string;
    gps_longitude?: string;
    attachments: string[];
    signature_hash: string;
    files?: File[];
  }) => {
    if (!id || !application) return;

    set_is_submitting(true);
    set_error(null);

    const report_text = [
      `Verified area: ${report_data.dimensions_verified} m²`,
      `Setbacks — Front: ${report_data.front_setback ? 'OK' : 'NO'}, Rear: ${report_data.back_setback ? 'OK' : 'NO'}, Left: ${report_data.left_setback ? 'OK' : 'NO'}, Right: ${report_data.right_setback ? 'OK' : 'NO'}`,
      report_data.gps_latitude
        ? `GPS: ${report_data.gps_latitude}, ${report_data.gps_longitude}`
        : null,
      `Digital signature: ${report_data.signature_hash}`,
      report_data.observations,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (!application.report_comments) {
        await applications_api.UploadReport(id, report_text, report_data.files ?? []);
      }

      await applications_api.Resolve(id, {
        approved: report_data.status === 'APPROVED',
        comments: report_text,
        rejection_reason: report_data.status === 'REJECTED' ? report_data.observations : undefined,
      });

      AddToast({
        type: 'success',
        message:
          report_data.status === 'APPROVED'
            ? 'Inspection approved and signed successfully'
            : 'Inspection rejected and recorded',
      });
      navigate('/technician/inbox');
    } catch (e: any) {
      const message = e.response?.data?.message || 'Error submitting inspection';
      set_error(message);
      AddToast({ type: 'error', message });
    } finally {
      set_is_submitting(false);
    }
  };

  const OpenPhotoLightbox = async (key: string) => {
    try {
      const blob_url = await FetchFileBlob(GetFileUrl(key));
      set_lightbox_src(blob_url);
    } catch (e) {
      console.error(e);
      set_error('Could not load the photo');
    }
  };

  if (is_loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <LoadingSkeleton count={3} variant="card" />
      </div>
    );
  }

  if (!application) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={error || 'Application not found'}
        className="glass-card max-w-xl mx-auto"
      />
    );
  }

  const is_resolved = ['APPROVED', 'REJECTED', 'APPROVED', 'REJECTED'].includes(application.status);
  const can_inspect = [
    'UNDER_REVIEW',
    'PENDING_TECHNICIAN',
    'UNDER_REVIEW',
    'INSPECTION',
    'INSPECTION',
  ].includes(application.status);

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">
      <DetailPageHeader
        back_to="/technician/inbox"
        title={GetProcedureTypeLabel(application.procedure_type) || 'Territorial Procedure'}
        subtitle={`#${id?.slice(0, 8).toUpperCase()} • ${FormatDateTime(application.created_at)}`}
        status={application.status}
        badges={<ZoneBadge zone={application.property?.location} />}
      />

      {error && <AlertBanner message={error} OnDismiss={() => set_error(null)} />}

      <DetailSection title="Applicant Citizen" icon={User}>
        <InfoGrid
          items={[
            {
              label: 'Name',
              value: `${application.citizen?.first_name} ${application.citizen?.last_name}`,
            },
            { label: 'National ID', value: application.citizen?.national_id },
            { label: 'Email', value: application.citizen?.email },
            { label: 'Phone', value: application.citizen?.phone },
          ]}
        />
      </DetailSection>

      <DetailSection title="Property Details" icon={MapPin}>
        <InfoGrid
          items={[
            { label: 'Procedure Type', value: GetProcedureTypeLabel(application.procedure_type) },
            { label: 'Zone', value: application.property?.location },
            { label: 'Address', value: application.property?.address },
            {
              label: 'Area',
              value: application.property?.area ? `${application.property.area} m²` : undefined,
            },
          ]}
        />
        {application.property?.description && (
          <p className="mt-3 border-t border-neutral-200 pt-3 text-sm text-secondary-dark">
            {application.property.description}
          </p>
        )}
      </DetailSection>

      {id && <DocumentPanel request_id={id} allowed_upload />}

      {application.existing_photos.length > 0 && (
        <DetailSection
          title={`Site photos (${application.existing_photos.length})`}
          className="border-sky-200"
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {application.existing_photos.map((foto) => (
              <div
                key={foto.id}
                className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer border border-sky-100 bg-sky-50/20"
                onClick={() => OpenPhotoLightbox(foto.key)}
              >
                <img
                  src={GetFileUrl(foto.key)}
                  alt={foto.name}
                  className="h-full w-full object-cover opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100">
                  <ZoomIn size={20} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {application.report_comments && (
        <DetailSection title="Previously registered report" className="border-sky-200">
          <p className="text-sm leading-6 text-blue-955">{application.report_comments}</p>
          {application.report_date && (
            <p className="mt-2 text-[0.7rem] text-sky-700/50">
              Registered: {FormatDateTime(application.report_date)}
            </p>
          )}
        </DetailSection>
      )}

      {can_inspect && !is_resolved && (
        <div className={Cn(is_submitting && 'opacity-60 pointer-events-none')}>
          <InspectionReporter OnSubmitReport={HandleSubmitReport} />
        </div>
      )}

      {is_resolved && (
        <DetailSection
          title={
            application.status === 'APPROVED' || application.status === 'APPROVED'
              ? 'Application Approved ✅'
              : 'Application Denied ❌'
          }
          className={
            application.status === 'APPROVED' || application.status === 'APPROVED'
              ? 'border-success-default'
              : 'border-error-default'
          }
        >
          <div className="flex items-center gap-3 mb-3">
            {application.status === 'APPROVED' || application.status === 'APPROVED' ? (
              <CheckCircle2 size={24} className="text-success-dark" />
            ) : (
              <XCircle size={24} className="text-error-default" />
            )}
          </div>
          {application.observations && (
            <p className="text-sm text-slate-600">{application.observations}</p>
          )}
          {application.rejection_reason && (
            <p className="text-sm mt-2 text-red-600">Reason: {application.rejection_reason}</p>
          )}
        </DetailSection>
      )}

      {lightbox_src && <ImageLightbox src={lightbox_src} OnClose={() => set_lightbox_src(null)} />}
    </div>
  );
}
