import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  MapPin,
  XCircle,
  Upload,
  Send,
  AlertCircle,
  Eye,
  DollarSign,
} from 'lucide-react';
import { applications_api, attachments_api } from '@/lib/api.calls';
import { getStatusBadgeClass, getStatusLabel, formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import { ApplicationTimeline } from '@/components/application.timeline';

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

  const handleView = async (url: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob_url = window.URL.createObjectURL(
        new Blob([response.data], { type: response.headers['content-type'] as string })
      );
      window.open(blob_url, '_blank');
    } catch (e) {
      console.error(e);
      set_error('No se pudo acceder al documento. Verifica tu sesión.');
    }
  };

  if (is_loading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl shimmer" />
        ))}
      </div>
    );

  if (!application)
    return (
      <div className="glass-card p-12 text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-red-400">{error || 'Solicitud no encontrada'}</p>
      </div>
    );

  const is_rejected = application.status === 'RECHAZADO';
  const is_draft = application.status === 'BORRADOR';
  const payment = application.payments?.[0];
  const is_payment_paid = payment?.status === 'PAGADO';

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/architect/procedures" className="btn-secondary p-2 mt-1">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-xl font-bold text-blue-955">
              {application.procedure_type || 'Trámite de Ordenamiento'}
            </h1>
            <span className={getStatusBadgeClass(application.status)}>
              {getStatusLabel(application.status)}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            ID: #{id?.slice(0, 8)}... • Creado {formatDateTime(application.created_at)}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-left">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Timeline de progreso */}
      <div className="glass-card p-6 pb-12 mb-6">
        <h2 className="font-heading font-semibold text-blue-955 mb-6 text-sm text-left">
          Progreso del Trámite
        </h2>
        <ApplicationTimeline current_status={application.status} />
      </div>

      {/* Observaciones de Secretaría (cuando devuelven) */}
      {application.status === 'OBSERVADO' && application.secretary_decision?.observations && (
        <div className="glass-card p-6 border-amber-500/30 text-left">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle size={20} className="text-amber-500" />
            <h2 className="font-heading font-semibold text-amber-600">
              Trámite Observado por Secretaría
            </h2>
          </div>
          <p className="text-blue-955 text-sm bg-amber-50 p-4 rounded-xl border border-amber-100">
            {application.secretary_decision.observations}
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Por favor, revisa las observaciones, corrige la información o sube los documentos
            faltantes.
          </p>
        </div>
      )}

      {/* Información de Cobro */}
      {(application.status === 'PENDIENTE_PAGO' ||
        application.status === 'PAGADO' ||
        application.status === 'APROBADO') &&
        application.payments?.length > 0 && (
          <div
            className={cn(
              'glass-card border p-6 text-left',
              is_payment_paid ? 'border-success-light' : 'border-warning-light'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-blue-955 flex items-center gap-2">
                <DollarSign
                  size={18}
                  className={is_payment_paid ? 'text-success-dark' : 'text-warning-dark'}
                />
                Información de Pago
              </h2>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Monto a pagar</p>
                <p className="text-2xl font-bold text-blue-955">
                  ${Number(payment?.amount ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Concepto</p>
                <p className="text-sm font-medium text-blue-955">{payment?.concept}</p>
              </div>
            </div>
            {payment?.status === 'PENDIENTE' && (
              <div className="mt-4 rounded-xl border border-primary-light/30 bg-primary-light/10 p-3">
                <p className="text-xs text-blue-800">
                  El propietario debe acercarse a las ventanillas de recaudación del GAD Municipal
                  con el número de trámite <strong>#{id?.slice(0, 8).toUpperCase()}</strong> para
                  cancelar el valor correspondiente.
                </p>
              </div>
            )}
          </div>
        )}

      {/* Rechazado */}
      {is_rejected && (
        <div className="glass-card p-6 border-red-500/30 text-left">
          <div className="flex items-center gap-3 mb-3">
            <XCircle size={20} className="text-red-400" />
            <h2 className="font-heading font-semibold text-red-400">Solicitud Rechazada</h2>
          </div>
          <p className="text-blue-800 text-sm">
            {application.rejection_reason || application.observations || 'Sin motivo especificado.'}
          </p>
        </div>
      )}

      {/* Datos del Propietario */}
      {application.citizen && (
        <div className="glass-card p-6 text-left">
          <h2 className="font-heading font-semibold text-blue-955 mb-3 flex items-center gap-2">
            <User size={16} className="text-primary-400" /> Propietario del Predio (Cliente)
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Nombre</p>
              <p className="text-blue-955 font-medium mt-0.5">
                {application.citizen.first_name} {application.citizen.last_name}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Identificación (Cédula/RUC)</p>
              <p className="text-blue-955 font-medium mt-0.5">{application.citizen.national_id}</p>
            </div>
            <div>
              <p className="text-slate-500">Correo Electrónico</p>
              <p className="text-blue-955 font-medium mt-0.5">{application.citizen.email}</p>
            </div>
            <div>
              <p className="text-slate-500">Teléfono</p>
              <p className="text-blue-955 font-medium mt-0.5">{application.citizen.phone || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Datos del predio */}
      <div className="glass-card p-6 text-left">
        <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-primary-400" /> Datos del Predio
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Dirección', value: application.property?.address },
            { label: 'Ubicación', value: application.property?.location },
            {
              label: 'Área',
              value: application.property?.area ? `${application.property.area} m²` : '—',
            },
            { label: 'Tipo', value: application.procedure_type },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-500">{label}</p>
              <p className="text-blue-955 font-medium mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
        {application.property?.description && (
          <p className="text-blue-800 text-sm mt-3 border-t border-surface-border pt-3">
            {application.property.description}
          </p>
        )}
      </div>

      {/* Técnico asignado */}
      {application.technician && (
        <div className="glass-card p-6 text-left">
          <h2 className="font-heading font-semibold text-blue-955 mb-3 flex items-center gap-2">
            <User size={16} className="text-primary-400" /> Técnico Asignado
          </h2>
          <p className="text-blue-955 font-medium">
            {application.technician.first_name} {application.technician.last_name}
          </p>
          <p className="text-slate-500 text-sm">{application.technician.email}</p>
        </div>
      )}

      {/* Agenda */}
      {application.schedule && (
        <div className="glass-card p-6 text-left">
          <h2 className="font-heading font-semibold text-blue-955 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-primary-400" /> Inspección Programada
          </h2>
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
        </div>
      )}

      {/* Anexos */}
      <div className="glass-card p-6 text-left">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-blue-955 flex items-center gap-2">
            <FileText size={16} className="text-primary-400" /> Documentos (
            {application.attachments?.length ?? 0})
          </h2>
          {is_draft && (
            <label className="btn-secondary text-xs px-3 py-2 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleUploadAttachment}
                className="sr-only"
              />
              {is_uploading_file ? (
                <span>Subiendo...</span>
              ) : (
                <>
                  <Upload size={14} /> Agregar Documento
                </>
              )}
            </label>
          )}
        </div>

        {application.attachments?.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay documentos adjuntos.</p>
        ) : (
          <div className="space-y-2">
            {application.attachments?.map((anexo: any) => (
              <div
                key={anexo.id}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-surface-border"
              >
                <FileText size={16} className="text-primary-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-blue-955 text-sm font-medium truncate">{anexo.name}</p>
                  <p className="text-slate-500 text-xs">
                    {(anexo.size / 1024).toFixed(1)} KB • SHA-256: {anexo.hash?.slice(0, 12)}...
                  </p>
                </div>
                <button
                  onClick={() => handleView(`/api/v1/files/${encodeURIComponent(anexo.key)}`)}
                  className="text-primary-400 hover:text-primary-400"
                >
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acción: Enviar a revisión */}
      {is_draft && (
        <div className="glass-card p-6 border-primary/30 text-left">
          <h2 className="font-heading font-semibold text-blue-955 mb-2">Enviar a Revisión</h2>
          <p className="text-slate-500 text-sm">
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
        </div>
      )}
    </div>
  );
}
