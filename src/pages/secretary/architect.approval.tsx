import { useEffect, useState } from 'react';
import { users_api } from '@/lib/api.calls';
import {
  HardHat,
  Award,
  CheckCircle2,
  XCircle,
  Loader,
  Mail,
  Calendar,
  BadgeCheck,
} from 'lucide-react';
import { FormatDateTime } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page.header';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { PanelCard } from '@/components/ui/panel.card';
import { useToastStore } from '@/stores/toast.store';
import { GetApiError } from '@/lib/errors';

interface PendingArchitect {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  national_id: string;
  senescyt_code: string;
  created_at: string;
  updated_at: string;
}

export function ArchitectApproval() {
  const AddToast = useToastStore((state) => state.AddToast);
  const [architects, set_architects] = useState<PendingArchitect[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [action_loading, set_action_loading] = useState<string | null>(null);

  const FetchPending = () => {
    set_is_loading(true);
    users_api
      .PendingProfessionals()
      .then(({ data }) => {
        const list = (data.data ?? []).map((user: any) => ({
          id: user.id,
          email: user.email,
          first_name: user.name || '',
          last_name: user.lastname || '',
          national_id: user.cedula || '',
          senescyt_code: user.senescytCode || '',
          created_at: user.createdAt || '',
          updated_at: user.updatedAt || '',
        }));
        set_architects(list);
      })
      .catch(() => set_architects([]))
      .finally(() => set_is_loading(false));
  };

  useEffect(() => {
    FetchPending();
  }, []);

  const HandleReview = async (id: string, approved: boolean) => {
    set_action_loading(id);
    try {
      await users_api.ReviewProfessional(id, approved);
      AddToast({
        type: 'success',
        message: approved
          ? 'Arquitecto habilitado. Ya puede crear trámites.'
          : 'Solicitud rechazada. El arquitecto podrá reenviar sus datos.',
      });
      FetchPending();
    } catch (err) {
      AddToast({
        type: 'error',
        message: GetApiError(err, 'No se pudo procesar la verificación'),
      });
    } finally {
      set_action_loading(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Verificación de Arquitectos"
        description="Revisa nombre, apellidos, cédula y código SENESCYT. Confirma en SENESCYT y habilita la cuenta."
        icon={HardHat}
      />

      <PanelCard
        title="Solicitudes pendientes"
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
              title="Todo al día"
              description="No hay arquitectos pendientes de verificación."
              className="py-12"
            />
          ) : (
            architects.map((architect) => (
              <div
                key={architect.id}
                className="flex flex-col justify-between gap-6 p-6 hover:bg-neutral-100 md:flex-row md:items-center"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Award size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">
                        {architect.first_name} {architect.last_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                        <BadgeCheck size={13} />
                        Cédula:{' '}
                        <strong className="text-slate-700">{architect.national_id || '—'}</strong>
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                        <BadgeCheck size={13} />
                        SENESCYT:{' '}
                        <strong className="text-slate-700">{architect.senescyt_code}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400" />
                      <span>{architect.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Solicitud: {FormatDateTime(architect.updated_at)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 max-w-xl leading-relaxed">
                    Verifica este código en el portal SENESCYT. Si corresponde al profesional,
                    aprueba para habilitar trámites.
                  </p>
                </div>

                <div className="flex sm:flex-row md:flex-col gap-2 flex-shrink-0 justify-end">
                  <button
                    disabled={action_loading !== null}
                    onClick={() => void HandleReview(architect.id, true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary-dark bg-secondary-default px-6 py-2.5 text-xs font-bold text-neutral-50 hover:bg-primary-dark hover:border-primary-dark"
                  >
                    {action_loading === architect.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    <span>Aprobar y habilitar</span>
                  </button>
                  <button
                    disabled={action_loading !== null}
                    onClick={() => void HandleReview(architect.id, false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-6 py-2.5 text-xs font-bold text-error-default hover:bg-neutral-100"
                  >
                    <XCircle size={14} />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PanelCard>
    </div>
  );
}
