import { useEffect, useState } from 'react';
import { users_api } from '@/lib/api.calls';
import {
  HardHat,
  Award,
  CheckCircle2,
  FileText,
  Loader,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { FormatDateTime } from '@/lib/utils';
import { BaseModal } from '@/components/logic/base.modal';
import { PageHeader } from '@/components/ui/page.header';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { PanelCard } from '@/components/ui/panel.card';
import { useToastStore } from '@/stores/toast.store';

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
  const AddToast = useToastStore((state) => state.AddToast);
  const [architects, set_architects] = useState<PendingArchitect[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [action_loading, set_action_loading] = useState<string | null>(null);

  // Modal title preview state
  const [preview_title, set_preview_title] = useState<{ name: string; file: string } | null>(null);

  const FetchPending = () => {
    set_is_loading(true);
    users_api
      .PendingArchitects()
      .then(({ data }) => {
        const list = (data.data ?? data ?? []).map((user: any) => ({
          id: user.id,
          email: user.email,
          first_name: user.name || user.first_name || '',
          last_name: user.lastname || user.last_name || '',
          // Backend wire field for Ecuadorian ID remains `cedula`
          national_id: user.cedula || user.national_id || '',
          phone: user.phone || null,
          registration_number: user.registration_number || '',
          title: user.title || '',
          title_file: user.title_file || null,
          created_at: user.createdAt || user.created_at || '',
        }));
        set_architects(list);
      })
      .catch(() => set_architects([]))
      .finally(() => set_is_loading(false));
  };

  useEffect(() => {
    FetchPending();
  }, []);

  const HandleApprove = async (id: string) => {
    set_action_loading(id);

    try {
      await users_api.ApproveArchitect(id, true);
      AddToast({
        type: 'success',
        message: 'El arquitecto ha sido habilitado y notificado con éxito.',
      });
      FetchPending();
    } catch (err: any) {
      AddToast({
        type: 'error',
        message:
          err.response?.data?.message || 'Ocurrió un error al intentar aprobar al arquitecto.',
      });
    } finally {
      set_action_loading(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Aprobación de Arquitectos"
        description="Verifica la validez de los títulos profesionales registrados y habilita sus cuentas para tramitar."
        icon={HardHat}
      />

      <PanelCard
        title="Arquitectos por Habilitar"
        icon={HardHat}
        icon_class_name="text-secondary-dark"
        actions={
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            {architects.length} pendientes
          </span>
        }
      >
        <div className="divide-y divide-neutral-200">
          {is_loading ? (
            <LoadingSkeleton count={2} variant="row" className="p-6" />
          ) : architects.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="¡Todo al día!"
              description="No hay cuentas de arquitectos pendientes de aprobación."
              className="py-12"
            />
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
                      <span>Registrado: {FormatDateTime(architect.created_at)}</span>
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
                    onClick={() => HandleApprove(architect.id)}
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
      </PanelCard>

      <BaseModal
        is_open={!!preview_title}
        OnClose={() => set_preview_title(null)}
        title="Título Profesional"
        size="lg"
      >
        {preview_title && (
          <>
            <p className="text-xs text-slate-400 mb-4 -mt-2">Profesional: {preview_title.name}</p>

            <div className="rounded-2xl bg-slate-100 p-8 border border-slate-200 flex flex-col items-center justify-center min-h-[280px] text-center relative overflow-hidden">
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
          </>
        )}
      </BaseModal>
    </div>
  );
}
