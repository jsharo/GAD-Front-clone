import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  HardHat,
  User,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { applications_api } from '@/lib/api.calls';
import { ApplicationTimeline } from '@/components/ui/application.timeline';
import { CompleteProfileModal } from '@/components/logic/complete.profile.modal';
import { PageHeader } from '@/components/ui/page.header';
import { StatCard, KpiGrid } from '@/components/ui/stat.card';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { DetailSection } from '@/components/ui/detail.section';
import { PanelCard } from '@/components/ui/panel.card';
import { InfoGrid } from '@/components/ui/info.grid';
import { ProfileModalDismissKey } from '@/lib/senescyt';

interface Application {
  id: string;
  status: string;
  procedure_type: string;
  property?: { address: string } | null;
  citizen?: { first_name: string; last_name: string; national_id?: string } | null;
  created_at: string;
}

function CompleteProfileBanner({
  OnOpen,
  is_rejected,
}: {
  OnOpen: () => void;
  is_rejected?: boolean;
}) {
  return (
    <div
      className={`mb-6 rounded-2xl border p-6 ${
        is_rejected
          ? 'border-error-light/50 bg-error-light/5'
          : 'border-primary-light/40 bg-primary-light/5'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
              is_rejected
                ? 'bg-error-light/15 text-error-dark'
                : 'bg-primary-light/15 text-primary-default'
            }`}
          >
            {is_rejected ? <XCircle size={24} /> : <HardHat size={24} />}
          </div>
          <div>
            <h2 className="font-heading font-bold text-blue-955 text-lg">
              {is_rejected
                ? 'Solicitud rechazada por Secretaría'
                : 'Completa tu perfil profesional'}
            </h2>
            <p className="text-slate-600 mt-1 text-sm leading-relaxed">
              {is_rejected
                ? 'El código o los datos no pudieron verificarse (código incorrecto o título no encontrado). Corrige la información y vuelve a enviarlos.'
                : 'Para poder crear trámites debes enviar tus nombres, apellidos, cédula y código SENESCYT a Secretaría.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={OnOpen}
          className="btn-primary flex-shrink-0 self-start sm:self-center"
        >
          {is_rejected ? 'Corregir y reenviar' : 'Completar perfil'}
        </button>
      </div>
    </div>
  );
}

function PendingEnablementBanner() {
  return (
    <div className="mb-6 rounded-2xl border border-warning-light bg-warning-light/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-warning-light/20 text-warning-dark">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="font-heading font-bold text-blue-955 text-lg">
            Cuenta pendiente de habilitación
          </h2>
          <p className="text-slate-600 mt-1 text-sm leading-relaxed">
            Tu registro fue recibido correctamente. La Secretaría del GAD Municipal de Cañar
            validará tu título profesional y número de registro SENESCYT antes de que puedas iniciar
            trámites. Este proceso toma entre 1 y 2 días laborables.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 rounded-full border border-warning-light bg-warning-light/20 px-3 py-1.5 text-xs font-semibold text-warning-dark">
              <AlertCircle size={12} /> Revisión en proceso
            </div>
            <p className="text-slate-500 text-xs self-center">
              Contacto: secretaria@gad-canar.gob.ec
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WasProfileModalDismissed(user_id?: string): boolean {
  if (!user_id || typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(ProfileModalDismissKey(user_id)) === '1';
}

export function ArchitectDashboard() {
  const { user } = useAuthStore();
  const [applications, set_applications] = useState<Application[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [profile_modal_open, set_profile_modal_open] = useState(() => {
    const status = user?.professional_status ?? 'UNVERIFIED';
    const needs = user?.is_enabled !== true && (status === 'UNVERIFIED' || status === 'REJECTED');
    if (!needs) return false;
    return !WasProfileModalDismissed(user?.id);
  });

  const is_enabled = user?.is_enabled === true;
  const professional_status = user?.professional_status ?? 'UNVERIFIED';
  const needs_profile_completion =
    !is_enabled && (professional_status === 'UNVERIFIED' || professional_status === 'REJECTED');
  const is_pending_review = professional_status === 'PENDING';
  const is_rejected = professional_status === 'REJECTED';

  const DismissProfileModal = () => {
    if (user?.id) {
      sessionStorage.setItem(ProfileModalDismissKey(user.id), '1');
    }
    set_profile_modal_open(false);
  };

  const OpenProfileModal = () => {
    if (user?.id) {
      sessionStorage.removeItem(ProfileModalDismissKey(user.id));
    }
    set_profile_modal_open(true);
  };

  const HandleProfileSuccess = () => {
    if (user?.id) {
      sessionStorage.removeItem(ProfileModalDismissKey(user.id));
    }
    set_profile_modal_open(false);
  };

  useEffect(() => {
    applications_api
      .MyApplications()
      .then(({ data }) => {
        set_applications(data.data || []);
      })
      .catch(() => {
        set_applications([]);
      })
      .finally(() => set_is_loading(false));
  }, []);

  const stats = [
    {
      label: 'Total Trámites',
      value: applications.length,
      icon: FileText,
      icon_class: 'text-primary-default',
      icon_wrapper_class: 'bg-primary-light/10',
    },
    {
      label: 'En Proceso',
      value: applications.filter((s) => !['APPROVED', 'REJECTED', 'DRAFT'].includes(s.status))
        .length,
      icon: Clock,
      icon_class: 'text-warning-dark',
      icon_wrapper_class: 'bg-warning-light/20',
    },
    {
      label: 'Aprobados',
      value: applications.filter((s) => s.status === 'APPROVED').length,
      icon: CheckCircle2,
      icon_class: 'text-success-dark',
      icon_wrapper_class: 'bg-success-light/20',
    },
    {
      label: 'Rechazados',
      value: applications.filter((s) => s.status === 'REJECTED').length,
      icon: XCircle,
      icon_class: 'text-error-dark',
      icon_wrapper_class: 'bg-error-light/20',
    },
  ];

  return (
    <div className="space-y-6">
      {needs_profile_completion && profile_modal_open && (
        <CompleteProfileModal
          allow_close
          OnClose={DismissProfileModal}
          OnSuccess={HandleProfileSuccess}
        />
      )}

      {needs_profile_completion && !profile_modal_open && (
        <CompleteProfileBanner OnOpen={OpenProfileModal} is_rejected={is_rejected} />
      )}

      {!is_enabled && is_pending_review && <PendingEnablementBanner />}

      <PageHeader
        title={`Bienvenido, ${user?.first_name || 'Arquitecto'}`}
        description={
          is_enabled
            ? 'Gestiona los trámites de tus clientes desde aquí.'
            : is_pending_review
              ? 'Tu solicitud de habilitación está en revisión por Secretaría.'
              : 'Completa tu perfil profesional para solicitar la habilitación.'
        }
        actions={
          is_enabled ? (
            <Link to="/architect/procedures/new" className="btn-primary">
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Nuevo Trámite</span>
            </Link>
          ) : undefined
        }
      />

      <KpiGrid>
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            icon_class_name={stat.icon_class}
            icon_wrapper_class_name={stat.icon_wrapper_class}
          />
        ))}
      </KpiGrid>

      {/* Información profesional */}
      {(user?.registration_number || user?.first_name) && (
        <DetailSection title="Mi perfil profesional" icon={HardHat}>
          <InfoGrid
            columns={3}
            items={[
              {
                label: 'Nombre',
                value: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || '—',
              },
              { label: 'Código SENESCYT', value: user?.registration_number || '—' },
              {
                label: 'Estado',
                value: is_enabled
                  ? 'Habilitado por el GAD'
                  : is_pending_review
                    ? 'Pendiente de habilitación'
                    : 'Perfil incompleto',
              },
            ]}
          />
        </DetailSection>
      )}

      <PanelCard
        variant="glass"
        title="Trámites Recientes"
        actions={
          <Link
            to="/architect/procedures"
            className="text-sm flex items-center gap-1 font-bold text-primary-default hover:text-primary-dark"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        }
      >
        {is_loading ? (
          <LoadingSkeleton count={3} variant="block" className="p-6" />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Sin trámites aún"
            description="Inicia el primer trámite para un ciudadano"
            action={
              is_enabled ? (
                <Link to="/architect/procedures/new" className="btn-primary inline-flex">
                  <PlusCircle size={16} />
                  Nuevo Trámite
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {applications.slice(0, 5).map((application) => (
              <Link
                key={application.id}
                to={`/architect/procedures/${application.id}`}
                className="group block p-5 hover:bg-neutral-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light/10 text-primary-default">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-blue-955 font-bold text-sm">
                        {application.procedure_type || 'Trámite'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <User size={11} className="text-slate-400" />
                        <p className="text-slate-500 text-xs">
                          {application.citizen
                            ? `${application.citizen.first_name} ${application.citizen.last_name}`
                            : `ID: #${application.id.slice(0, 8)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-primary-dark" />
                </div>
                <div className="pt-1 px-2 sm:px-8">
                  <ApplicationTimeline current_status={application.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
