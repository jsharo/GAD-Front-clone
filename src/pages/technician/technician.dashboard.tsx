import { useEffect, useState } from 'react';
import { Inbox, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { applications_api } from '@/lib/api.calls';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page.header';
import { StatCard, KpiGrid } from '@/components/ui/stat.card';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';

interface Application {
  id: string;
  procedure_type: string;
  property?: { address: string } | null;
  created_at: string;
  status: string;
}

export function TechnicianDashboard() {
  const { user } = useAuthStore();
  const [applications, set_applications] = useState<Application[]>([]);
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    applications_api
      .list({ limit: 100 })
      .then(({ data }) => {
        const mapped = (data.data || []).map((s: any) => ({
          id: s.id,
          procedure_type: s.tipoTramite,
          property: s.predio
            ? {
                address: s.predio.direccion,
              }
            : null,
          created_at: s.createdAt,
          status: s.estado,
        }));
        set_applications(mapped);
      })
      .catch(() => set_applications([]))
      .finally(() => set_is_loading(false));
  }, []);

  const assigned_applications = applications.filter((s) =>
    ['EN_REVISION_TECNICA', 'UNDER_REVIEW'].includes(s.status)
  );
  const inspection_applications = applications.filter((s) =>
    ['INSPECCION', 'INSPECTION'].includes(s.status)
  );
  const resolved_applications = applications.filter((s) =>
    [
      'APPROVED',
      'REJECTED',
      'PENDING_PAYMENT',
      'PAID',
      'APROBADO',
      'NEGADO',
      'PENDIENTE_PAGO',
      'PAGADO',
    ].includes(s.status)
  );

  const kpis = [
    {
      label: 'En Revisión (Nuevos)',
      value: assigned_applications.length,
      icon: Inbox,
      iconClassName: 'text-warning-dark',
      iconWrapperClassName: 'bg-warning-light/20',
    },
    {
      label: 'En Inspección',
      value: inspection_applications.length,
      icon: MapPin,
      iconClassName: 'text-primary-default',
      iconWrapperClassName: 'bg-primary-light/10',
    },
    {
      label: 'Resueltos',
      value: resolved_applications.length,
      icon: CheckCircle2,
      iconClassName: 'text-success-dark',
      iconWrapperClassName: 'bg-success-light/20',
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Bienvenido, Tec. ${user?.first_name}`}
        description="Gestiona los trámites asignados a tu zona."
      />

      <KpiGrid columns="1-3">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            iconClassName={kpi.iconClassName}
            iconWrapperClassName={kpi.iconWrapperClassName}
            isLoading={is_loading}
          />
        ))}
      </KpiGrid>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-4">
          <h2 className="font-heading font-semibold text-blue-955 flex items-center gap-2">
            <Clock size={18} className="text-primary-default" />
            Trámites Pendientes de Revisión
          </h2>
          <Link
            to="/technician/inbox"
            className="text-sm font-semibold text-primary-default hover:text-primary-dark transition-colors"
          >
            Ver todos →
          </Link>
        </div>

        <div className="divide-y divide-neutral-200">
          {is_loading ? (
            <LoadingSkeleton count={1} variant="row" className="py-4" />
          ) : assigned_applications.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Sin trámites pendientes"
              description="No tienes trámites pendientes de revisión en este momento."
              className="py-8"
            />
          ) : (
            assigned_applications.slice(0, 5).map((app) => (
              <Link
                to={`/technician/inbox/${app.id}`}
                key={app.id}
                className="flex items-center justify-between py-4 group"
              >
                <div>
                  <p className="font-semibold text-blue-955">{app.procedure_type || 'Trámite'}</p>
                  <p className="text-xs text-slate-500">
                    #{app.id.slice(0, 8).toUpperCase()} · {app.property?.address || 'Sin dirección'}
                  </p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-slate-400 group-hover:text-primary-dark transition-colors"
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
