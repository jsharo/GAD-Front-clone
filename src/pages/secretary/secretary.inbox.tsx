import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileCheck2, Eye, Filter, RefreshCw, Clock, XCircle } from 'lucide-react';
import { applications_api } from '@/lib/api.calls';

type StatusFilter = 'TODOS' | 'PENDIENTE_SECRETARIA' | 'OBSERVADO';

const TIPO_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
};

const TIPO_COLOR: Record<string, string> = {
  PERMISO_CONSTRUCCION: '#2563EB',
  LINEA_FABRICAS: '#D97706',
  APROBACION_PLANOS: '#2E8B57',
};

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
  const [filter, set_filter] = useState<StatusFilter>('TODOS');
  const [search, set_search] = useState('');

  const loadInbox = useCallback(async () => {
    set_is_loading(true);
    try {
      const params: any = {};
      if (filter !== 'TODOS') params.estado = filter;
      const { data } = await applications_api.list({ ...params, limit: 100 });

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
  }, [filter]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const filtered_applications = applications.filter((s) => {
    if (filter === 'TODOS') {
      if (!['PENDIENTE_SECRETARIA', 'OBSERVADO'].includes(s.status)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const name = `${s.citizen?.first_name ?? ''} ${s.citizen?.last_name ?? ''}`.toLowerCase();
      if (
        !name.includes(q) &&
        !s.id?.toLowerCase().includes(q) &&
        !s.citizen?.national_id?.includes(q)
      )
        return false;
    }
    return true;
  });

  const pending_count = applications.filter((s) => s.status === 'PENDIENTE_SECRETARIA').length;
  const observed_count = applications.filter((s) => s.status === 'OBSERVADO').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-955">Bandeja de Trámites</h1>
          <p className="text-sm text-slate-500">
            Verificación documental — firma y completitud de expedientes
          </p>
        </div>
        <button
          onClick={loadInbox}
          disabled={is_loading}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-primary-dark hover:text-neutral-50 hover:border-primary-dark"
          title="Actualizar"
        >
          <RefreshCw size={16} className={is_loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Pendientes',
            count: pending_count,
            colorClass: 'text-warning-dark',
            bgClass: 'bg-warning-light/20',
            icon: <Clock size={16} />,
          },
          {
            label: 'Observados',
            count: observed_count,
            colorClass: 'text-error-dark',
            bgClass: 'bg-error-light/20',
            icon: <XCircle size={16} />,
          },
          {
            label: 'Total activos',
            count: pending_count + observed_count,
            colorClass: 'text-primary-default',
            bgClass: 'bg-primary-light/10',
            icon: <FileCheck2 size={16} />,
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`rounded-xl p-2 ${stat.bgClass} ${stat.colorClass}`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-extrabold text-blue-955">{stat.count}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ciudadano, cédula o ID..."
            value={search}
            onChange={(e) => set_search(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-slate-800"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          {(['TODOS', 'PENDIENTE_SECRETARIA', 'OBSERVADO'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => set_filter(f)}
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold ${
                filter === f
                  ? 'border-secondary-dark bg-secondary-light/20 text-secondary-dark'
                  : 'border-neutral-200 bg-neutral-50 text-slate-500 hover:border-primary-dark hover:bg-primary-dark hover:text-neutral-50'
              }`}
            >
              {f === 'TODOS' ? 'Todos' : f === 'PENDIENTE_SECRETARIA' ? 'Pendientes' : 'Observados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
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
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Cargando bandeja...</p>
                  </td>
                </tr>
              ) : filtered_applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <FileCheck2 size={40} className="mx-auto mb-3 text-neutral-300" />
                    <p className="text-slate-400">No hay solicitudes que coincidan</p>
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
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          sol.procedure_type === 'PERMISO_CONSTRUCCION'
                            ? 'bg-primary-light/10 text-primary-default'
                            : sol.procedure_type === 'LINEA_FABRICAS'
                              ? 'bg-secondary-light/20 text-secondary-dark'
                              : sol.procedure_type === 'APROBACION_PLANOS'
                                ? 'bg-success-light/20 text-success-dark'
                                : 'bg-neutral-200 text-slate-600'
                        }`}
                      >
                        {TIPO_LABEL[sol.procedure_type] ?? sol.procedure_type}
                      </span>
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
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          sol.status === 'PENDIENTE_SECRETARIA'
                            ? 'border-warning-light bg-warning-light/20 text-warning-dark'
                            : 'border-error-light bg-error-light/20 text-error-dark'
                        }`}
                      >
                        {sol.status === 'PENDIENTE_SECRETARIA' ? '⏳ Pendiente' : '↩ Observado'}
                      </span>
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
      </div>
    </div>
  );
}
