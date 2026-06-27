import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  MapPin,
  FileText,
  XCircle,
} from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate, cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status.badge';
import { ZoneBadge } from '@/components/ui/zone.badge';
import { PageHeader } from '@/components/ui/page.header';
import { StatCard, KpiGrid } from '@/components/ui/stat.card';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { PanelCard } from '@/components/ui/panel.card';

interface Application {
  id: string;
  procedure_type: string;
  status: string;
  created_at: string;
  attachments_count: number;
  citizen?: {
    first_name: string;
    last_name: string;
  } | null;
  property?: {
    location: string;
    address: string;
  } | null;
}

export function TechnicianInbox() {
  const { user } = useAuthStore();
  const [applications, set_applications] = useState<Application[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [filter, set_filter] = useState<string>('ALL');

  useEffect(() => {
    applications_api
      .list()
      .then(({ data }) => {
        const mapped = (data.data || []).map((s: any) => ({
          id: s.id,
          procedure_type: s.tipoTramite,
          status: s.estado,
          created_at: s.createdAt,
          attachments_count: s._count?.anexos || 0,
          citizen: s.ciudadano
            ? {
                first_name: s.ciudadano.nombre,
                last_name: s.ciudadano.apellido,
              }
            : null,
          property: s.predio
            ? {
                location: s.predio.ubicacion,
                address: s.predio.direccion,
              }
            : null,
        }));
        set_applications(mapped);
      })
      .catch(() => set_applications([]))
      .finally(() => set_is_loading(false));
  }, []);

  const filtered_applications =
    filter === 'ALL'
      ? applications
      : applications.filter((s) => {
          if (filter === 'UNDER_REVIEW')
            return ['UNDER_REVIEW', 'EN_REVISION', 'EN_REVISION_TECNICA'].includes(s.status);
          if (filter === 'INSPECTION') return ['INSPECTION', 'INSPECCION'].includes(s.status);
          if (filter === 'APPROVED') return ['APPROVED', 'APROBADO'].includes(s.status);
          if (filter === 'REJECTED') return ['REJECTED', 'NEGADO'].includes(s.status);
          return s.status === filter;
        });

  const counts = {
    under_review: applications.filter((s) =>
      ['EN_REVISION', 'EN_REVISION_TECNICA', 'UNDER_REVIEW'].includes(s.status)
    ).length,
    inspection: applications.filter((s) => ['INSPECCION', 'INSPECTION'].includes(s.status)).length,
    approved: applications.filter((s) => ['APROBADO', 'APPROVED'].includes(s.status)).length,
    rejected: applications.filter((s) => ['NEGADO', 'REJECTED'].includes(s.status)).length,
  };

  const FILTERS = [
    { key: 'ALL', label: `Todas (${applications.length})` },
    { key: 'UNDER_REVIEW', label: `Revisión (${counts.under_review})` },
    { key: 'INSPECTION', label: `Inspección (${counts.inspection})` },
    { key: 'APPROVED', label: `Aprobadas (${counts.approved})` },
    { key: 'REJECTED', label: `Negadas (${counts.rejected})` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandeja de Trabajo"
        description={
          user?.zone
            ? `Solicitudes asignadas de la zona ${user.zone === 'URBAN' ? 'Urbana' : 'Rural'}`
            : 'Solicitudes asignadas para revisión técnica'
        }
        actions={<ZoneBadge zone={user?.zone} />}
      />

      <KpiGrid>
        <StatCard
          label="En Revisión"
          value={counts.under_review}
          icon={Clock}
          iconClassName="text-warning-dark"
          iconWrapperClassName="bg-warning-light/20"
          isLoading={is_loading}
        />
        <StatCard
          label="En Inspección"
          value={counts.inspection}
          icon={MapPin}
          iconClassName="text-primary-default"
          iconWrapperClassName="bg-primary-light/10"
          isLoading={is_loading}
        />
        <StatCard
          label="Aprobadas"
          value={counts.approved}
          icon={CheckCircle2}
          iconClassName="text-success-dark"
          iconWrapperClassName="bg-success-light/20"
          isLoading={is_loading}
        />
        <StatCard
          label="Negadas"
          value={counts.rejected}
          icon={XCircle}
          iconClassName="text-error-dark"
          iconWrapperClassName="bg-error-light/20"
          isLoading={is_loading}
        />
      </KpiGrid>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => set_filter(f.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium border',
              filter === f.key
                ? 'border-primary-dark bg-primary-default text-neutral-50'
                : 'border-neutral-200 bg-neutral-50 text-blue-800 hover:bg-primary-dark hover:text-neutral-50 hover:border-primary-dark'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Applications List ─────────────────────────────── */}
      <PanelCard variant="glass">
        {is_loading ? (
          <LoadingSkeleton count={3} variant="row" className="p-6" />
        ) : filtered_applications.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sin solicitudes en esta categoría"
            description={
              user?.zone
                ? `Solo se muestran solicitudes de zona ${user.zone === 'URBAN' ? 'Urbana' : 'Rural'}`
                : undefined
            }
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {filtered_applications.map((app) => (
              <Link
                key={app.id}
                to={`/technician/inbox/${app.id}`}
                className="group flex items-center gap-4 p-4 hover:bg-neutral-100"
              >
                {/* Procedure type icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light/10">
                  <FileText size={18} className="text-primary-default" />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-blue-955 font-medium text-sm">
                      {app.procedure_type || 'Trámite'}
                    </p>
                    <StatusBadge status={app.status} />
                    {/* Zone badge of each application */}
                    <ZoneBadge zone={app.property?.location} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {app.citizen?.first_name} {app.citizen?.last_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {app.property?.address || app.property?.location || '—'}
                    </span>
                    <span>{formatDate(app.created_at)}</span>
                  </div>
                </div>

                {/* Attachments */}
                {app.attachments_count > 0 && (
                  <span className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
                    <FileText size={11} />
                    {app.attachments_count} doc{app.attachments_count > 1 ? 's' : ''}
                  </span>
                )}

                <ArrowRight
                  size={16}
                  className="flex-shrink-0 text-slate-500 group-hover:text-primary-dark"
                />
              </Link>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
