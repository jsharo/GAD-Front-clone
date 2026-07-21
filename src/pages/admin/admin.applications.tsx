import { useEffect, useState, useCallback, useMemo } from 'react';
import { FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applications_api } from '@/lib/api.calls';
import { FormatDateTime } from '@/lib/utils';
import { ApplicationFilterBar } from '@/components/logic/application.filter.bar';
import { DEFAULT_STATUS_OPTIONS, type FilterState } from '@/lib/constants/application.filters';
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
    procedure_type: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const HandleFilterChange = useCallback((next: FilterState) => {
    set_filters(next);
  }, []);

  const FetchApplications = useCallback(async () => {
    try {
      set_is_loading(true);
      const params: Record<string, string | number> = { limit: 100 };
      if (filters.status) params.status = filters.status;
      if (filters.procedure_type) params.request_type = filters.procedure_type;
      const { data } = await applications_api.List(params);
      set_applications(data.data || []);
    } catch (e) {
      console.error('Error fetching applications:', e);
    } finally {
      set_is_loading(false);
    }
  }, [filters.status, filters.procedure_type]);

  useEffect(() => {
    FetchApplications();
  }, [FetchApplications]);

  const filtered_applications = useMemo(() => {
    return applications.filter((s) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const user_name = s.user ? `${s.user.first_name} ${s.user.last_name}`.toLowerCase() : '';
        if (
          !s.id.toLowerCase().includes(q) &&
          !user_name.includes(q) &&
          !s.user?.national_id?.includes(q) &&
          !s.procedure_type?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (filters.date_from) {
        const from = new Date(filters.date_from);
        if (new Date(s.created_at) < from) return false;
      }

      if (filters.date_to) {
        const to = new Date(filters.date_to);
        to.setHours(23, 59, 59, 999);
        if (new Date(s.created_at) > to) return false;
      }

      return true;
    });
  }, [applications, filters.search, filters.date_from, filters.date_to]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="All Applications" icon={FileText} />

      <ApplicationFilterBar
        OnFilterChange={HandleFilterChange}
        status_options={DEFAULT_STATUS_OPTIONS}
      />

      <div className="glass-card p-6">
        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-surface-muted border-b border-surface-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Applicant</th>
                <th className="px-6 py-4 font-semibold">Procedure</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
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
                      icon={FileText}
                      title="No applications registered"
                      className="py-8"
                    />
                  </td>
                </tr>
              ) : (
                filtered_applications.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-surface-border hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-blue-950 font-medium">
                      {s.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{FormatDateTime(s.created_at)}</td>
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
                        title="View details"
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
