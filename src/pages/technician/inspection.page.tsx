import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, User, MapPin, CheckCircle2, XCircle, AlertCircle, ZoomIn } from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import { formatDateTime, cn } from '@/lib/utils';
import { getProcedureTypeLabel } from '@/lib/constants/procedure-types';
import { fetchFileBlob, getFileUrl } from '@/lib/files';
import { InspectionReporter } from '@/components/logic/inspection.reporter';
import { AttachmentRow } from '@/components/logic/attachment.row';
import { ImageLightbox } from '@/components/logic/image.lightbox';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { AlertBanner } from '@/components/ui/alert.banner';
import { DetailSection } from '@/components/ui/detail.section';
import { InfoGrid } from '@/components/ui/info.grid';
import { ZoneBadge } from '@/components/ui/zone.badge';
import { DetailPageHeader } from '@/components/ui/detail-page.header';
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

const mapInspectionApplication = (data: any): InspectionApplication => {
  const citizen_docs =
    data.documentosCiudadano ?? data.anexos?.filter((a: any) => a.tipo !== 'INSPECCION_FOTO') ?? [];
  const inspection_pics =
    data.fotosInspeccion ?? data.anexos?.filter((a: any) => a.tipo === 'INSPECCION_FOTO') ?? [];

  return {
    id: data.id,
    procedure_type: data.tipoTramite || '',
    status: data.estado || '',
    created_at: data.createdAt || '',
    report_comments: data.reporteComentarios || null,
    report_date: data.reporteFecha || null,
    observations: data.observaciones || null,
    rejection_reason: data.motivoRechazo || null,
    citizen: data.ciudadano
      ? {
          first_name: data.ciudadano.nombre || '',
          last_name: data.ciudadano.apellido || '',
          national_id: data.ciudadano.cedula || '',
          email: data.ciudadano.email || '',
          phone: data.ciudadano.telefono || null,
        }
      : null,
    property: data.predio
      ? {
          location: data.predio.ubicacion || '',
          address: data.predio.direccion || '',
          area: data.predio.area || null,
          description: data.predio.descripcion || null,
        }
      : null,
    citizen_documents: citizen_docs.map((a: any) => ({
      id: a.id,
      key: a.key,
      name: a.nombre || a.name || '',
      size: a.tamano || a.size || 0,
      hash: a.hash || '',
    })),
    existing_photos: inspection_pics.map((a: any) => ({
      id: a.id,
      key: a.key,
      name: a.nombre || a.name || '',
      size: a.tamano || a.size || 0,
    })),
  };
};

export function InspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const [application, set_application] = useState<InspectionApplication | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);
  const [lightbox_src, set_lightbox_src] = useState<string | null>(null);

  const loadApplication = useCallback(async () => {
    if (!id) return;
    set_is_loading(true);
    try {
      const { data } = await applications_api.getById(id);
      set_application(mapInspectionApplication(data));
    } catch {
      set_error('No se pudo cargar la solicitud');
    } finally {
      set_is_loading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleSubmitReport = async (reportData: {
    status: 'APPROVED' | 'REJECTED';
    dimensionsVerified: number;
    frontSetback: boolean;
    backSetback: boolean;
    leftSetback: boolean;
    rightSetback: boolean;
    observations: string;
    gpsLatitude?: string;
    gpsLongitude?: string;
    attachments: string[];
    signatureHash: string;
    files?: File[];
  }) => {
    if (!id || !application) return;

    set_is_submitting(true);
    set_error(null);

    const reportText = [
      `Área verificada: ${reportData.dimensionsVerified} m²`,
      `Retiros — Frontal: ${reportData.frontSetback ? 'OK' : 'NO'}, Posterior: ${reportData.backSetback ? 'OK' : 'NO'}, Lat. Izq: ${reportData.leftSetback ? 'OK' : 'NO'}, Lat. Der: ${reportData.rightSetback ? 'OK' : 'NO'}`,
      reportData.gpsLatitude ? `GPS: ${reportData.gpsLatitude}, ${reportData.gpsLongitude}` : null,
      `Firma digital: ${reportData.signatureHash}`,
      reportData.observations,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (!application.report_comments) {
        await applications_api.uploadReport(id, reportText, reportData.files ?? []);
      }

      await applications_api.resolve(id, {
        resolucion: reportData.status === 'APPROVED' ? 'APROBADO' : 'NEGADO',
        observaciones: reportData.observations,
        motivoRechazo: reportData.status === 'REJECTED' ? reportData.observations : undefined,
      });

      addToast({
        type: 'success',
        message:
          reportData.status === 'APPROVED'
            ? 'Inspección aprobada y firmada correctamente'
            : 'Inspección rechazada y registrada',
      });
      navigate('/technician/inbox');
    } catch (e: any) {
      const message = e.response?.data?.message || 'Error al enviar la inspección';
      set_error(message);
      addToast({ type: 'error', message });
    } finally {
      set_is_submitting(false);
    }
  };

  const openPhotoLightbox = async (key: string) => {
    try {
      const blobUrl = await fetchFileBlob(getFileUrl(key));
      set_lightbox_src(blobUrl);
    } catch (e) {
      console.error(e);
      set_error('No se pudo cargar la foto');
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
        title={error || 'Solicitud no encontrada'}
        className="glass-card max-w-xl mx-auto"
      />
    );
  }

  const is_resolved = ['APROBADO', 'NEGADO', 'APPROVED', 'REJECTED'].includes(application.status);
  const can_inspect = [
    'EN_REVISION',
    'EN_REVISION_TECNICA',
    'UNDER_REVIEW',
    'INSPECCION',
    'INSPECTION',
  ].includes(application.status);

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">
      <DetailPageHeader
        backTo="/technician/inbox"
        title={getProcedureTypeLabel(application.procedure_type) || 'Trámite Territorial'}
        subtitle={`#${id?.slice(0, 8).toUpperCase()} • ${formatDateTime(application.created_at)}`}
        status={application.status}
        badges={<ZoneBadge zone={application.property?.location} />}
      />

      {error && <AlertBanner message={error} onDismiss={() => set_error(null)} />}

      <DetailSection title="Ciudadano Solicitante" icon={User}>
        <InfoGrid
          items={[
            {
              label: 'Nombre',
              value: `${application.citizen?.first_name} ${application.citizen?.last_name}`,
            },
            { label: 'Cédula', value: application.citizen?.national_id },
            { label: 'Email', value: application.citizen?.email },
            { label: 'Teléfono', value: application.citizen?.phone },
          ]}
        />
      </DetailSection>

      <DetailSection title="Datos del Predio" icon={MapPin}>
        <InfoGrid
          items={[
            { label: 'Tipo de Trámite', value: getProcedureTypeLabel(application.procedure_type) },
            { label: 'Zona', value: application.property?.location },
            { label: 'Dirección', value: application.property?.address },
            {
              label: 'Área',
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

      <DetailSection
        title={`Documentos del Ciudadano (${application.citizen_documents.length})`}
        icon={FileText}
      >
        {application.citizen_documents.length === 0 ? (
          <p className="text-sm text-slate-500">Sin documentos adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {application.citizen_documents.map((doc) => (
              <AttachmentRow key={doc.id} attachment={doc} onError={set_error} />
            ))}
          </div>
        )}
      </DetailSection>

      {application.existing_photos.length > 0 && (
        <DetailSection
          title={`Fotos del sitio (${application.existing_photos.length})`}
          className="border-sky-200"
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {application.existing_photos.map((foto) => (
              <div
                key={foto.id}
                className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer border border-sky-100 bg-sky-50/20"
                onClick={() => openPhotoLightbox(foto.key)}
              >
                <img
                  src={getFileUrl(foto.key)}
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
        <DetailSection title="Reporte registrado previamente" className="border-sky-200">
          <p className="text-sm leading-6 text-blue-955">{application.report_comments}</p>
          {application.report_date && (
            <p className="mt-2 text-[0.7rem] text-sky-700/50">
              Registrado: {formatDateTime(application.report_date)}
            </p>
          )}
        </DetailSection>
      )}

      {can_inspect && !is_resolved && (
        <div className={cn(is_submitting && 'opacity-60 pointer-events-none')}>
          <InspectionReporter onSubmitReport={handleSubmitReport} />
        </div>
      )}

      {is_resolved && (
        <DetailSection
          title={
            application.status === 'APROBADO' || application.status === 'APPROVED'
              ? 'Solicitud Aprobada ✅'
              : 'Solicitud Negada ❌'
          }
          className={
            application.status === 'APROBADO' || application.status === 'APPROVED'
              ? 'border-success-default'
              : 'border-error-default'
          }
        >
          <div className="flex items-center gap-3 mb-3">
            {application.status === 'APROBADO' || application.status === 'APPROVED' ? (
              <CheckCircle2 size={24} className="text-success-dark" />
            ) : (
              <XCircle size={24} className="text-error-default" />
            )}
          </div>
          {application.observations && (
            <p className="text-sm text-slate-600">{application.observations}</p>
          )}
          {application.rejection_reason && (
            <p className="text-sm mt-2 text-red-600">Motivo: {application.rejection_reason}</p>
          )}
        </DetailSection>
      )}

      {lightbox_src && <ImageLightbox src={lightbox_src} onClose={() => set_lightbox_src(null)} />}
    </div>
  );
}
