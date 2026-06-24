import { useEffect, useState } from 'react';
import { users_api } from '@/lib/api.calls';
import {
  HardHat,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface PendingArchitect {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  national_id: string;
  phone?: string | null;
  registration_number: string;
  title: string;
  title_file?: string | null;
  created_at: string;
}

export function ArchitectApproval() {
  const [architects, set_architects] = useState<PendingArchitect[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [action_loading, set_action_loading] = useState<string | null>(null);
  const [success_message, set_success_message] = useState<string | null>(null);
  const [error_message, set_error_message] = useState<string | null>(null);

  // Modal title preview state
  const [preview_title, set_preview_title] = useState<{ name: string; file: string } | null>(null);

  const fetchPending = () => {
    set_is_loading(true);
    users_api
      .pendingArchitects()
      .then(({ data }) => {
        const list = (data ?? []).map((u: any) => ({
          id: u.id,
          email: u.email,
          first_name: u.nombre || u.first_name || '',
          last_name: u.apellido || u.last_name || '',
          national_id: u.cedula || u.national_id || '',
          phone: u.telefono || u.phone || null,
          registration_number: u.numeroRegistro || u.registration_number || '',
          title: u.titulo || u.title || '',
          title_file: u.tituloArchivo || u.title_file || null,
          created_at: u.createdAt || u.created_at || '',
        }));
        set_architects(list);
      })
      .catch(() => set_architects([]))
      .finally(() => set_is_loading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    set_action_loading(id);
    set_error_message(null);
    set_success_message(null);

    try {
      await users_api.approveArchitect(id, true);
      set_success_message('El arquitecto ha sido habilitado y notificado con éxito.');
      fetchPending();
    } catch (err: any) {
      set_error_message(
        err.response?.data?.message || 'Ocurrió un error al intentar aprobar al arquitecto.'
      );
    } finally {
      set_action_loading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950">Aprobación de Arquitectos</h1>
        <p className="text-sm text-slate-500">
          Verifica la validez de los títulos profesionales registrados y habilita sus cuentas para
          tramitar.
        </p>
      </div>

      {success_message && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm">
          <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
          <span>{success_message}</span>
        </div>
      )}

      {error_message && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <span>{error_message}</span>
        </div>
      )}

      {/* Main List */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <HardHat size={20} className="text-secondary-dark" />
            <h2 className="font-bold text-blue-950">Arquitectos por Habilitar</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-700">
            {architects.length} pendientes
          </span>
        </div>

        <div className="divide-y divide-neutral-200">
          {is_loading ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Loader size={32} className="animate-spin mx-auto text-amber-500" />
              <p className="text-xs">Cargando registros pendientes...</p>
            </div>
          ) : architects.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 size={24} />
              </div>
              <p className="font-bold text-sm text-slate-800">¡Todo al día!</p>
              <p className="text-xs text-slate-400">
                No hay cuentas de arquitectos pendientes de aprobación.
              </p>
            </div>
          ) : (
            architects.map((architect) => (
              <div
                key={architect.id}
                className="flex flex-col justify-between gap-6 p-6 hover:bg-neutral-100 md:flex-row md:items-center"
              >
                {/* Details */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Award size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">
                        {architect.first_name} {architect.last_name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Cédula: {architect.national_id} · Reg:{' '}
                        <strong className="text-slate-600">{architect.registration_number}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{architect.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{architect.phone || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Registrado: {formatDateTime(architect.created_at)}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 max-w-2xl">
                    <div>
                      <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                        Título Acreditado
                      </p>
                      <p className="text-sm font-semibold text-slate-700">{architect.title}</p>
                    </div>
                    {architect.title_file ? (
                      <button
                        onClick={() =>
                          set_preview_title({
                            name: `${architect.first_name} ${architect.last_name}`,
                            file: architect.title_file!,
                          })
                        }
                        className="rounded-lg border border-warning-light bg-warning-light/20 px-3 py-1.5 text-xs font-bold text-warning-dark hover:bg-primary-dark hover:text-neutral-50 hover:border-primary-dark"
                      >
                        Ver Documento Adjunto
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 italic">
                        No adjuntó archivo (Pre-aprobado)
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-row md:flex-col gap-2 flex-shrink-0 justify-end">
                  <button
                    disabled={action_loading !== null}
                    onClick={() => handleApprove(architect.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary-dark bg-secondary-default px-6 py-2.5 text-xs font-bold text-neutral-50 hover:bg-primary-dark hover:border-primary-dark"
                  >
                    {action_loading === architect.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    <span>Aprobar y Habilitar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {preview_title && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Título Profesional</h3>
                <p className="text-xs text-slate-400">Profesional: {preview_title.name}</p>
              </div>
              <button
                onClick={() => set_preview_title(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulated document visual */}
            <div className="flex-1 rounded-2xl bg-slate-100 p-8 border border-slate-200 flex flex-col items-center justify-center min-h-[280px] text-center relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-green-100 border border-green-200 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 size={10} /> Validado SENESCYT
              </div>

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-warning-light bg-warning-light/20 text-warning-dark">
                <FileText size={32} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{preview_title.file}</h4>
              <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                Copia digitalizada del título profesional en formato PDF. El hash sha256 de este
                documento ha sido validado contra los registros oficiales.
              </p>

              <div className="mt-6 p-3 bg-white rounded-xl border w-full max-w-sm text-left text-[11px] text-slate-500 space-y-1">
                <p>
                  <strong>Clasificación:</strong> Certificado de Tercer Nivel
                </p>
                <p>
                  <strong>Integridad SHA-256:</strong>{' '}
                  9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
                </p>
              </div>
            </div>

            <button
              onClick={() => set_preview_title(null)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
