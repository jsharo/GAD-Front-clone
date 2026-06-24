import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Camera,
  Upload,
  Trash2,
  Image,
  MessageSquare,
  ZoomIn,
  X as XIcon,
} from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import { getStatusBadgeClass, getStatusLabel, formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Photo Lightbox Viewer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
    >
      <button className="absolute right-4 top-4 rounded-full bg-black/30 p-2 text-white">
        <XIcon size={22} />
      </button>
      <img
        src={src}
        alt="Foto inspección"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

interface Attachment {
  id: string;
  key: string;
  name: string;
  size: number;
  hash: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Citizen Document Row Component (view + download)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AttachmentRow({ attachment }: { attachment: Attachment }) {
  const api_base = '/api/v1';
  const url = `${api_base}/files/${encodeURIComponent(attachment.key)}`;

  const handleView = async () => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] as string })
      );
      window.open(blobUrl, '_blank');
    } catch (e) {
      console.error(e);
      alert('Error al cargar documento');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] as string })
      );
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Error al descargar documento');
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary-light/20 bg-primary-light/5 p-3">
      <FileText size={16} className="shrink-0 text-primary-default" />
      <div className="flex-1 min-w-0">
        <p className="text-blue-955 text-sm font-medium truncate">{attachment.name}</p>
        <p className="mt-0.5 text-[0.7rem] text-slate-500">
          {(attachment.size / 1024).toFixed(1)} KB • SHA-256: {attachment.hash?.slice(0, 16)}…
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleView}
          title="Ver documento"
          className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
        >
          <Eye size={16} />
        </button>
        <button
          onClick={handleDownload}
          title="Descargar documento"
          className="rounded-lg p-2 text-sky-600 hover:bg-sky-50"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}

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
  citizen_documents: Attachment[];
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN INSPECTION PAGE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function InspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const file_ref = useRef<HTMLInputElement>(null);

  const [application, set_application] = useState<InspectionApplication | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  // Technical inspection report states
  const [selected_photos, set_selected_photos] = useState<File[]>([]);
  const [previews, set_previews] = useState<string[]>([]);
  const [report_comments, set_report_comments] = useState('');
  const [is_uploading_report, set_is_uploading_report] = useState(false);
  const [report_submitted, set_report_submitted] = useState(false);

  // Resolution states
  const [resolution, set_resolution] = useState<'APROBADO' | 'NEGADO' | null>(null);
  const [observations, set_observations] = useState('');
  const [rejection_reason, set_rejection_reason] = useState('');
  const [is_resolving, set_is_resolving] = useState(false);

  // Lightbox src
  const [lightbox_src, set_lightbox_src] = useState<string | null>(null);

  const api_base = '/api/v1';

  const loadApplication = useCallback(async () => {
    if (!id) return;
    set_is_loading(true);
    try {
      const { data } = await applications_api.getById(id);
      const mapped = mapInspectionApplication(data);
      set_application(mapped);
      // Preload report comments if it already has one
      if (mapped.report_comments) {
        set_report_comments(mapped.report_comments);
        set_report_submitted(true);
      }
    } catch {
      set_error('No se pudo cargar la solicitud');
    } finally {
      set_is_loading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  // Photos selection management
  const onPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    set_selected_photos((prev) => {
      const updated = [...prev, ...files].slice(0, 20);
      updated.forEach((f, i) => {
        if (!previews[i]) {
          const reader = new FileReader();
          reader.onload = () =>
            set_previews((p) => {
              const cp = [...p];
              cp[i] = reader.result as string;
              return cp;
            });
          reader.readAsDataURL(f);
        }
      });
      return updated;
    });
    e.target.value = '';
  };

  const deletePhoto = (idx: number) => {
    set_selected_photos((p) => p.filter((_, i) => i !== idx));
    set_previews((p) => p.filter((_, i) => i !== idx));
  };

  const handleUploadReport = async () => {
    if (!id || !report_comments.trim()) {
      set_error('Escribe los comentarios del reporte de inspección');
      return;
    }
    set_is_uploading_report(true);
    set_error(null);
    try {
      await applications_api.uploadReport(id, report_comments, selected_photos);
      set_report_submitted(true);
      await loadApplication();
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al subir el reporte');
    } finally {
      set_is_uploading_report(false);
    }
  };

  const handleResolve = async () => {
    if (!id || !resolution) return;
    if (!observations.trim()) {
      set_error('Escribe las observaciones técnicas');
      return;
    }
    set_is_resolving(true);
    set_error(null);
    try {
      await applications_api.resolve(id, {
        resolucion: resolution,
        observaciones: observations,
        motivoRechazo: resolution === 'NEGADO' ? rejection_reason : undefined,
      });
      navigate('/technician/inbox');
    } catch (e: any) {
      set_error(e.response?.data?.message || 'Error al resolver');
    } finally {
      set_is_resolving(false);
    }
  };

  if (is_loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl shimmer" />
        ))}
      </div>
    );
  }

  if (!application) {
    return (
      <div className="glass-card p-12 text-center max-w-xl mx-auto">
        <AlertCircle size={40} className="mx-auto mb-4 text-error-default" />
        <p className="text-error-default">{error || 'Solicitud no encontrada'}</p>
      </div>
    );
  }

  const is_resolved = ['APROBADO', 'NEGADO', 'APPROVED', 'REJECTED'].includes(application.status);
  const can_upload_report = [
    'EN_REVISION',
    'EN_REVISION_TECNICA',
    'UNDER_REVIEW',
    'INSPECCION',
    'INSPECTION',
  ].includes(application.status);
  const can_resolve = can_upload_report;
  const is_urban =
    application.property?.location === 'URBANO' || application.property?.location === 'URBAN';

  return (
    <div className="animate-fade-in space-y-5 max-w-3xl mx-auto pb-10">
      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <Link to="/technician/inbox" className="btn-secondary p-2 mt-1 flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-blue-955">
              {application.procedure_type || 'Trámite Territorial'}
            </h1>
            <span className={getStatusBadgeClass(application.status)}>
              {getStatusLabel(application.status)}
            </span>
            <span
              className={
                is_urban
                  ? 'badge border border-primary-light bg-primary-light/10 text-primary-default'
                  : 'badge border border-success-light bg-success-light/20 text-success-dark'
              }
            >
              {is_urban ? '🏙️ Urbano' : '🌿 Rural'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            #{id?.slice(0, 8).toUpperCase()} • {formatDateTime(application.created_at)}
          </p>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-error-light bg-error-light/10 p-4 text-sm text-red-400">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Citizen Requester ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2 text-sm">
          <User size={15} className="text-primary-600" /> Ciudadano Solicitante
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            {
              l: 'Nombre',
              v: `${application.citizen?.first_name} ${application.citizen?.last_name}`,
            },
            { l: 'Cédula', v: application.citizen?.national_id || '—' },
            { l: 'Email', v: application.citizen?.email },
            { l: 'Teléfono', v: application.citizen?.phone || '—' },
          ].map(({ l, v }) => (
            <div key={l}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
                {l}
              </p>
              <p className="text-blue-955 font-medium mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Property Data ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2 text-sm">
          <MapPin size={15} className="text-primary-600" /> Datos del Predio
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { l: 'Tipo de Trámite', v: application.procedure_type },
            { l: 'Zona', v: application.property?.location },
            { l: 'Dirección', v: application.property?.address },
            { l: 'Área', v: application.property?.area ? `${application.property.area} m²` : '—' },
          ].map(({ l, v }) => (
            <div key={l}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
                {l}
              </p>
              <p className="text-blue-955 font-medium mt-0.5">{v || '—'}</p>
            </div>
          ))}
        </div>
        {application.property?.description && (
          <p className="mt-3 border-t border-primary-light/20 pt-3 text-sm text-secondary-dark">
            {application.property.description}
          </p>
        )}
      </div>

      {/* ── Citizen Documents ── */}
      <div className="glass-card p-5">
        <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2 text-sm">
          <FileText size={15} className="text-primary-600" />
          Documentos del Ciudadano ({application.citizen_documents.length})
        </h2>
        {application.citizen_documents.length === 0 ? (
          <p className="text-sm text-slate-500">Sin documentos adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {application.citizen_documents.map((a: Attachment) => (
              <AttachmentRow key={a.id} attachment={a} />
            ))}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TECHNICAL INSPECTION REPORT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-card border border-sky-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-blue-955 flex items-center gap-2 text-sm">
            <Camera size={15} className="text-sky-600" />
            Reporte de Inspección Técnica
          </h2>
          {report_submitted && (
            <span className="badge border border-success-light bg-success-light/20 text-success-dark">
              <CheckCircle2 size={11} /> Registrado
            </span>
          )}
        </div>

        {/* Existing photos */}
        {application.existing_photos.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-700/70">
              Fotos del sitio ({application.existing_photos.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {application.existing_photos.map((foto: any) => {
                const url = `${api_base}/files/${encodeURIComponent(foto.key)}`;
                const handleDownloadFoto = async () => {
                  try {
                    const response = await api.get(url, { responseType: 'blob' });
                    const blobUrl = window.URL.createObjectURL(
                      new Blob([response.data], {
                        type: response.headers['content-type'] as string,
                      })
                    );
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = foto.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (e) {
                    console.error(e);
                  }
                };
                const handleViewFoto = async () => {
                  try {
                    const response = await api.get(url, { responseType: 'blob' });
                    const blobUrl = window.URL.createObjectURL(
                      new Blob([response.data], {
                        type: response.headers['content-type'] as string,
                      })
                    );
                    set_lightbox_src(blobUrl);
                  } catch (e) {
                    console.error(e);
                  }
                };

                return (
                  <div
                    key={foto.id}
                    className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer border border-sky-100 bg-sky-50/20"
                    onClick={handleViewFoto}
                  >
                    <img
                      src={url}
                      alt={foto.name}
                      className="h-full w-full object-cover opacity-60 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100">
                      <ZoomIn size={20} className="text-white" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadFoto();
                      }}
                      className="absolute right-1 top-1 rounded-lg bg-black/60 p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Download size={12} className="text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Saved report comments */}
        {application.report_comments && (
          <div className="mb-4 p-4 rounded-xl border border-sky-100 bg-sky-50/30">
            <p className="mb-1.5 text-[0.7rem] font-bold uppercase text-sky-700/70">
              📋 Observaciones registradas
            </p>
            <p className="text-sm leading-6 text-blue-955">{application.report_comments}</p>
            {application.report_date && (
              <p className="mt-2 text-[0.7rem] text-sky-700/50">
                Registrado: {formatDateTime(application.report_date)}
              </p>
            )}
          </div>
        )}

        {/* Upload/update report form */}
        {can_upload_report && (
          <div className="space-y-4">
            <div>
              <label className="input-label flex items-center gap-2">
                <MessageSquare size={12} />
                Observaciones de la inspección *
              </label>
              <textarea
                value={report_comments}
                onChange={(e) => set_report_comments(e.target.value)}
                className="input-field resize-none"
                rows={4}
                placeholder="Describe los hallazgos en el sitio, condiciones del predio, cumplimiento de normativa, etc."
              />
            </div>

            {/* Photos selection */}
            <div>
              <label className="input-label flex items-center gap-2">
                <Camera size={12} />
                Fotos del sitio ({selected_photos.length}/20)
              </label>
              <input
                ref={file_ref}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={onPhotosChange}
                className="hidden"
              />

              {/* New photos previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                  {previews.map((p, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden group border border-sky-100"
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => deletePhoto(i)}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={11} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {selected_photos.length < 20 && (
                    <button
                      onClick={() => file_ref.current?.click()}
                      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-sky-200 text-sky-400 hover:border-sky-400 hover:bg-sky-50/50"
                    >
                      <Upload size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* Initial Drop Zone */}
              {previews.length === 0 && (
                <button
                  onClick={() => file_ref.current?.click()}
                  className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-sky-200 py-8 text-sky-400 hover:border-sky-400 hover:bg-sky-50/50"
                >
                  <Image size={28} />
                  <div className="text-center">
                    <p className="font-medium text-sm text-sky-600">Subir fotos del sitio</p>
                    <p className="mt-0.5 text-xs">JPEG, PNG, WebP • Máx. 10MB por foto</p>
                  </div>
                </button>
              )}
            </div>

            {/* Save Report button */}
            <button
              onClick={handleUploadReport}
              disabled={is_uploading_report || !report_comments.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {is_uploading_report ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Upload size={18} />{' '}
                  {report_submitted ? 'Actualizar reporte' : 'Guardar reporte de inspección'}
                </>
              )}
            </button>

            {!report_submitted && (
              <p className="text-center text-xs text-slate-500">
                💡 Al guardar, la solicitud avanza automáticamente a estado{' '}
                <strong className="text-sky-600">En Inspección</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── RESOLUTION FORM ── */}
      {can_resolve && (
        <div className="glass-card border border-primary-light/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-blue-955 text-sm">Resolución Final</h2>
            {!report_submitted && (
              <span className="badge border border-amber-200 bg-amber-50 text-amber-600 text-[10px]">
                ⚠ Guarda el reporte primero
              </span>
            )}
          </div>

          <div>
            <label className="input-label">Conclusiones técnicas *</label>
            <textarea
              value={observations}
              onChange={(e) => set_observations(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Conclusión técnica final basada en la inspección realizada..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => set_resolution('APROBADO')}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl border font-medium text-sm',
                resolution === 'APROBADO'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-slate-100 text-slate-600 hover:bg-slate-50'
              )}
            >
              <CheckCircle2 size={18} /> Aprobar solicitud
            </button>
            <button
              onClick={() => set_resolution('NEGADO')}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl border font-medium text-sm',
                resolution === 'NEGADO'
                  ? 'border-red-600 bg-red-50 text-red-750'
                  : 'border-slate-100 text-slate-600 hover:bg-slate-50'
              )}
            >
              <XCircle size={18} /> Negar solicitud
            </button>
          </div>

          {resolution === 'NEGADO' && (
            <div>
              <label className="input-label">Motivo de rechazo *</label>
              <textarea
                value={rejection_reason}
                onChange={(e) => set_rejection_reason(e.target.value)}
                className="input-field resize-none"
                rows={2}
                placeholder="Especifica el incumplimiento o motivo de negativa..."
              />
            </div>
          )}

          <button
            onClick={handleResolve}
            disabled={is_resolving || !resolution || !observations.trim() || !report_submitted}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed',
              resolution === 'APROBADO'
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-red-600 hover:bg-red-500'
            )}
          >
            {is_resolving ? (
              <span>Resolviendo...</span>
            ) : (
              <>
                Confirmar y{' '}
                {resolution === 'APROBADO'
                  ? 'Aprobar'
                  : resolution === 'NEGADO'
                    ? 'Negar'
                    : 'Resolver'}{' '}
                solicitud
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Read-only Resolution Summary ── */}
      {is_resolved && (
        <div
          className={
            application.status === 'APROBADO' || application.status === 'APPROVED'
              ? 'glass-card border border-success-default p-5'
              : 'glass-card border border-error-default p-5'
          }
        >
          <div className="flex items-center gap-3 mb-3">
            {application.status === 'APROBADO' || application.status === 'APPROVED' ? (
              <CheckCircle2 size={24} className="text-success-dark" />
            ) : (
              <XCircle size={24} className="text-error-default" />
            )}
            <h2 className="font-heading font-bold text-blue-955">
              Solicitud{' '}
              {application.status === 'APROBADO' || application.status === 'APPROVED'
                ? 'Aprobada ✅'
                : 'Negada ❌'}
            </h2>
          </div>
          {application.observations && (
            <p className="text-sm text-slate-600">{application.observations}</p>
          )}
          {application.rejection_reason && (
            <p className="text-sm mt-2 text-red-600">Motivo: {application.rejection_reason}</p>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox_src && <Lightbox src={lightbox_src} onClose={() => set_lightbox_src(null)} />}
    </div>
  );
}
