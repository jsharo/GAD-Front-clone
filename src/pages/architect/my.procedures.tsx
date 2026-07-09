import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, User } from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import { formatDateTime } from '@/lib/utils';
import { ApplicationTimeline } from '@/components/ui/application.timeline';
import { ApplicationFilterBar } from '@/components/logic/application.filter-bar';
import { DEFAULT_STATUS_OPTIONS, type FilterState } from '@/lib/constants/application-filters';
import { StatusBadge } from '@/components/ui/status.badge';
import { PageHeader } from '@/components/ui/page.header';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { PanelCard } from '@/components/ui/panel.card';

interface Application {
  id: string;
  status: string;
  procedure_type: string;
  property?: { address: string } | null;
  citizen?: { first_name: string; last_name: string; national_id?: string } | null;
  created_at: string;
  updated_at: string;
}

export function MyProcedures() {
  const [applications, set_applications] = useState<Application[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [filters, set_filters] = useState<FilterState>({
    search: '',
    procedureType: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleFilterChange = useCallback((next: FilterState) => {
    set_filters(next);
  }, []);

  useEffect(() => {
    set_is_loading(true);
    const params: Record<string, string> = {};
    if (filters.status) params.estado = filters.status;
    if (filters.procedureType) params.tipoTramite = filters.procedureType;
    applications_api
      .myApplications(params)
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
          updated_at: s.updatedAt,
        }));
        set_applications(mapped);
      })
      .catch(() => {
        set_applications([]);
      })
      .finally(() => set_is_loading(false));
  }, [filters.status, filters.procedureType]);

  const filtered_applications = useMemo(() => {
    return applications.filter((s) => {
      if (!filters.search) return true;
      const term = filters.search.toLowerCase();
      const citizen_name = s.citizen
        ? `${s.citizen.first_name} ${s.citizen.last_name}`.toLowerCase()
        : '';
      return (
        s.id.toLowerCase().includes(term) ||
        s.procedure_type?.toLowerCase().includes(term) ||
        citizen_name.includes(term) ||
        s.citizen?.national_id?.includes(term) ||
        s.property?.address?.toLowerCase().includes(term)
      );
    });
  }, [applications, filters.search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Trámites"
        description="Todos los trámites que has gestionado para tus clientes"
      />

      <ApplicationFilterBar
        onFilterChange={handleFilterChange}
        statusOptions={DEFAULT_STATUS_OPTIONS}
      />

      <PanelCard variant="glass">
        {is_loading ? (
          <LoadingSkeleton count={3} variant="block" className="p-6" />
        ) : filtered_applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Sin trámites encontrados"
            description={
              filters.search || filters.status
                ? 'Cambia los filtros para ver más resultados'
                : 'Inicia el primer trámite para un ciudadano'
            }
            action={
              <Link to="/architect/procedures/new" className="btn-primary inline-flex">
                Nuevo Trámite
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-surface-border">
            {filtered_applications.map((sol) => (
              <Link
                key={sol.id}
                to={`/architect/procedures/${sol.id}`}
                className="group block p-5 hover:bg-neutral-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary-light/20 text-secondary-dark">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-blue-955 font-bold text-sm">
                          {sol.procedure_type || 'Trámite'}
                        </p>
                        <StatusBadge status={sol.status} />
                      </div>
                      {sol.citizen && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                          <User size={11} />
                          <span>
                            {sol.citizen.first_name} {sol.citizen.last_name}
                          </span>
                          {sol.citizen.national_id && (
                            <span className="text-slate-400">• CI: {sol.citizen.national_id}</span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-400">
                        #{sol.id.slice(0, 8)} • {sol.property?.address || '—'} •{' '}
                        {formatDateTime(sol.updated_at)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="mt-1 text-slate-400 group-hover:text-primary-dark"
                  />
                </div>
                <div className="px-2 sm:px-14">
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
