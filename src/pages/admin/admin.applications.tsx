import { useEffect, useState, useCallback, useMemo } from 'react';
import { FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applications_api } from '@/lib/api.calls';
import { formatDateTime } from '@/lib/utils';
import { ApplicationFilterBar } from '@/components/logic/application.filter-bar';
import { DEFAULT_STATUS_OPTIONS, type FilterState } from '@/lib/constants/application-filters';
import { StatusBadge } from '@/components/ui/status.badge';
import { PageHeader } from '@/components/ui/page.header';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';

interface Application {
  id: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    national_id: string;
  } | null;
  procedure_type: string;
  status: string;
}

export function AdminApplications() {
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

  const fetchApplications = useCallback(async () => {
    try {
      set_is_loading(true);
      const params: Record<string, string | number> = { limit: 100 };
      if (filters.status) params.estado = filters.status;
      if (filters.procedureType) params.tipoTramite = filters.procedureType;
      const { data } = await applications_api.list(params);

      const mapped = (data.data || []).map((s: any) => ({
        id: s.id,
        created_at: s.createdAt,
        user: s.usuario
          ? {
              first_name: s.usuario.nombre,
              last_name: s.usuario.apellido,
              national_id: s.usuario.cedula,
            }
          : null,
        procedure_type: s.tipoTramite,
        status: s.estado,
      }));

      set_applications(mapped);
    } catch (e) {
      console.error('Error fetching applications:', e);
    } finally {
      set_is_loading(false);
    }
  }, [filters.status, filters.procedureType]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((s) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const userName = s.user ? `${s.user.first_name} ${s.user.last_name}`.toLowerCase() : '';
        if (
          !s.id.toLowerCase().includes(q) &&
          !userName.includes(q) &&
          !s.user?.national_id?.includes(q) &&
          !s.procedure_type?.toLowerCase().includes(q)
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
  }, [applications, filters.search, filters.dateFrom, filters.dateTo]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Todas las Solicitudes" icon={FileText} />

      <ApplicationFilterBar
        onFilterChange={handleFilterChange}
        statusOptions={DEFAULT_STATUS_OPTIONS}
      />

      <div className="glass-card p-6">
        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-surface-muted border-b border-surface-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Solicitante</th>
                <th className="px-6 py-4 font-semibold">Trámite</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <LoadingSkeleton count={3} variant="row" />
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={FileText}
                      title="No hay solicitudes registradas"
                      className="py-8"
                    />
                  </td>
                </tr>
              ) : (
                filteredApplications.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-blue-950 font-medium">
                      {s.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDateTime(s.created_at)}</td>
                    <td className="px-6 py-4">
                      {s.user ? (
                        <>
                          <p className="font-medium text-blue-955">
                            {s.user.first_name} {s.user.last_name}
                          </p>
                          <p className="text-xs text-slate-500">{s.user.national_id}</p>
                        </>
                      ) : (
                        <p className="text-slate-400">—</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.procedure_type || '—'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/applications/${s.id}`}
                        className="inline-flex items-center justify-center p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
