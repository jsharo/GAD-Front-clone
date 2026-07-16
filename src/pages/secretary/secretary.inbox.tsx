import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, Eye, RefreshCw, Clock, XCircle } from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import { ApplicationFilterBar } from '@/components/logic/application.filter-bar';
import type { FilterState } from '@/lib/constants/application-filters';
import { StatusBadge } from '@/components/ui/status.badge';
import { PageHeader } from '@/components/ui/page.header';
import { StatCard, KpiGrid } from '@/components/ui/stat.card';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { PanelCard } from '@/components/ui/panel.card';
import { ProcedureTypeBadge } from '@/components/ui/procedure-type.badge';

const SECRETARY_STATUS_OPTIONS = [
  { value: '', label: 'Todos (activos)' },
  { value: 'PENDING_SECRETARY', label: 'Pendientes' },
  { value: 'OBSERVED', label: 'Observados' },
];

interface Application {
  id: string;
  status: string;
  procedure_type: string;
  created_at: string;
  citizen?: {
    first_name: string;
    last_name: string;
    national_id?: string;
  } | null;
  property?: {
    address: string;
  } | null;
  attachments: Array<{ id: string }>;
}

export function SecretaryInbox() {
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

  const loadInbox = useCallback(async () => {
    set_is_loading(true);
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (filters.status) params.estado = filters.status;
      if (filters.procedureType) params.tipoTramite = filters.procedureType;
      const { data } = await applications_api.list(params);

      const mapped = (data.data || []).map((s: any) => ({
        id: s.id,
        status: s.estado,
        procedure_type: s.tipoTramite,
        created_at: s.createdAt,
        citizen: s.ciudadano
          ? {
              first_name: s.ciudadano.nombre,
              last_name: s.ciudadano.apellido,
              national_id: s.ciudadano.cedula,
            }
          : null,
        property: s.predio
          ? {
              address: s.predio.direccion,
            }
          : null,
        attachments: (s.anexos || []).map((a: any) => ({
          id: a.id,
        })),
      }));

      set_applications(mapped);
    } catch (e) {
      console.error('Error loading inbox', e);
    } finally {
      set_is_loading(false);
    }
  }, [filters.status, filters.procedureType]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const filtered_applications = applications.filter((s) => {
    if (!filters.status && !['PENDING_SECRETARY', 'OBSERVED'].includes(s.status)) {
      return false;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const name = `${s.citizen?.first_name ?? ''} ${s.citizen?.last_name ?? ''}`.toLowerCase();
      if (
        !name.includes(q) &&
        !s.id?.toLowerCase().includes(q) &&
        !s.citizen?.national_id?.includes(q)
      ) {
        return false;
      }
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (new Date(s.created_at) < from) return false;
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(s.created_at) > to) return false;
    }

    return true;
  });

  const pending_count = applications.filter((s) => s.status === 'PENDING_SECRETARY').length;
  const observed_count = applications.filter((s) => s.status === 'OBSERVED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bandeja de Trámites"
        description="Verificación documental — firma y completitud de expedientes"
        actions={
          <button
            onClick={loadInbox}
            disabled={is_loading}
            className="rounded-xl border border-neutral-200 p-2.5 text-slate-500 hover:bg-primary-dark hover:text-neutral-50 hover:border-primary-dark"
            title="Actualizar"
          >
            <RefreshCw size={16} className={is_loading ? 'animate-spin' : ''} />
          </button>
        }
      />

      <KpiGrid columns="3">
        <StatCard
          label="Pendientes"
          value={pending_count}
          icon={Clock}
          iconClassName="text-warning-dark"
          iconWrapperClassName="bg-warning-light/20"
          isLoading={is_loading}
        />
        <StatCard
          label="Observados"
          value={observed_count}
          icon={XCircle}
          iconClassName="text-error-dark"
          iconWrapperClassName="bg-error-light/20"
          isLoading={is_loading}
        />
        <StatCard
          label="Total activos"
          value={pending_count + observed_count}
          icon={FileCheck2}
          iconClassName="text-primary-default"
          iconWrapperClassName="bg-primary-light/10"
          isLoading={is_loading}
        />
      </KpiGrid>

      <ApplicationFilterBar
        onFilterChange={handleFilterChange}
        statusOptions={SECRETARY_STATUS_OPTIONS}
        showProcedureFilter
        showDateFilters
      />

      <PanelCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-100">
                {[
                  'Expediente',
                  'Ciudadano',
                  'Tipo de Trámite',
                  'Archivos',
                  'Estado',
                  'Acciones',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <LoadingSkeleton count={3} variant="row" />
                  </td>
                </tr>
              ) : filtered_applications.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={FileCheck2}
                      title="No hay solicitudes que coincidan"
                      className="py-12"
                    />
                  </td>
                </tr>
              ) : (
                filtered_applications.map((sol) => (
                  <tr key={sol.id} className="hover:bg-neutral-100">
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-955 text-sm font-mono">
                        #{sol.id?.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[0.7rem] text-slate-400">
                        {sol.created_at
                          ? new Date(sol.created_at).toLocaleDateString('es-EC')
                          : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-blue-955 text-sm text-left">
                        {sol.citizen?.first_name} {sol.citizen?.last_name}
                      </p>
                      <p className="text-left text-[0.75rem] text-slate-500">
                        CI: {sol.citizen?.national_id || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <ProcedureTypeBadge type={sol.procedure_type} />
                      <p className="mt-1 text-[0.7rem] text-slate-400">
                        {sol.property?.address ?? '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileCheck2 size={14} className="text-slate-500" />
                        <span className="text-sm font-semibold text-blue-955">
                          {sol.attachments?.length ?? 0} archivos
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={sol.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/secretary/inbox/${sol.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-secondary-light bg-secondary-light/20 px-3 py-2 text-xs font-semibold text-secondary-dark hover:border-primary-dark hover:bg-primary-dark hover:text-neutral-50"
                      >
                        <Eye size={14} /> Revisar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
