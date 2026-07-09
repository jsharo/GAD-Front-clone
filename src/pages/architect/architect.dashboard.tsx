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

interface Application {
  id: string;
  status: string;
  procedure_type: string;
  property?: { address: string } | null;
  citizen?: { first_name: string; last_name: string; national_id?: string } | null;
  created_at: string;
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

export function ArchitectDashboard() {
  const { user } = useAuthStore();
  const [applications, set_applications] = useState<Application[]>([]);
  const [is_loading, set_is_loading] = useState(true);

  const is_enabled = user?.is_enabled === true;
  const needs_profile_completion = !user?.national_id || !user?.first_name?.trim();

  useEffect(() => {
    applications_api
      .myApplications()
      .then(({ data }) => {
        const mapped = (data.data || []).map((s: any) => ({
          id: s.id,
          status: s.estado,
          procedure_type: s.tipoTramite,
          property: s.predio
            ? {
                address: s.predio.direccion,
              }
            : null,
          citizen: s.ciudadano
            ? {
                first_name: s.ciudadano.nombre,
                last_name: s.ciudadano.apellido,
                national_id: s.ciudadano.cedula,
              }
            : null,
          created_at: s.createdAt,
        }));
        set_applications(mapped);
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
      iconClass: 'text-primary-default',
      iconWrapperClass: 'bg-primary-light/10',
    },
    {
      label: 'En Proceso',
      value: applications.filter((s) => !['APROBADO', 'RECHAZADO', 'BORRADOR'].includes(s.status))
        .length,
      icon: Clock,
      iconClass: 'text-warning-dark',
      iconWrapperClass: 'bg-warning-light/20',
    },
    {
      label: 'Aprobados',
      value: applications.filter((s) => s.status === 'APROBADO').length,
      icon: CheckCircle2,
      iconClass: 'text-success-dark',
      iconWrapperClass: 'bg-success-light/20',
    },
    {
      label: 'Rechazados',
      value: applications.filter((s) => s.status === 'RECHAZADO').length,
      icon: XCircle,
      iconClass: 'text-error-dark',
      iconWrapperClass: 'bg-error-light/20',
    },
  ];

  return (
    <div className="space-y-6">
      {!is_enabled && needs_profile_completion && <CompleteProfileModal allowClose={false} />}

      {!is_enabled && !needs_profile_completion && <PendingEnablementBanner />}

      <PageHeader
        title={`Bienvenido, ${user?.first_name || 'Arquitecto'} 👷`}
        description={
          is_enabled
            ? 'Gestiona los trámites de tus clientes desde aquí.'
            : 'Tu cuenta está siendo verificada por el GAD Municipal.'
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
            iconClassName={stat.iconClass}
            iconWrapperClassName={stat.iconWrapperClass}
          />
        ))}
      </KpiGrid>

      {/* Información profesional */}
      {user?.title && (
        <DetailSection title="Mi perfil profesional" icon={HardHat}>
          <InfoGrid
            columns={3}
            items={[
              { label: 'Título', value: user.title },
              { label: 'N° Registro SENESCYT', value: user.registration_number },
              {
                label: 'Estado',
                value: is_enabled ? '✅ Habilitado por el GAD' : '⏳ Pendiente de habilitación',
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
            {applications.slice(0, 5).map((sol) => (
              <Link
                key={sol.id}
                to={`/architect/procedures/${sol.id}`}
                className="group block p-5 hover:bg-neutral-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light/10 text-primary-default">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-blue-955 font-bold text-sm">
                        {sol.procedure_type || 'Trámite'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <User size={11} className="text-slate-400" />
                        <p className="text-slate-500 text-xs">
                          {sol.citizen
                            ? `${sol.citizen.first_name} ${sol.citizen.last_name}`
                            : `ID: #${sol.id.slice(0, 8)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-primary-dark" />
                </div>
                <div className="pt-1 px-2 sm:px-8">
                  <ApplicationTimeline current_status={sol.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
