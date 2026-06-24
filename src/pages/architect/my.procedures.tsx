import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Search, User } from 'lucide-react';
import api from '@/lib/api';
import { getStatusBadgeClass, getStatusLabel, formatDateTime } from '@/lib/utils';
import { ApplicationTimeline } from '@/components/application.timeline';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'PENDIENTE_SECRETARIA', label: 'En Secretaría' },
  { value: 'OBSERVADO', label: 'Observado' },
  { value: 'EN_REVISION_TECNICA', label: 'Revisión Técnica' },
  { value: 'PENDIENTE_PAGO', label: 'Pendiente Pago' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
];

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
  const [status_filter, set_status_filter] = useState('');
  const [search, set_search] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (status_filter) params.set('estado', status_filter);
    api
      .get(`/solicitudes/mis-solicitudes?${params}`)
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
  }, [status_filter]);

  const filtered_applications = applications.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-blue-955">Mis Trámites</h1>
        <p className="text-blue-800 mt-1 text-sm">
          Todos los trámites que has gestionado para tus clientes
        </p>
      </div>

      {/* Filtros */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => set_search(e.target.value)}
            placeholder="Buscar por ciudadano, cédula, dirección..."
            className="input-field pl-9 py-2"
          />
        </div>
        <select
          value={status_filter}
          onChange={(e) => {
            set_status_filter(e.target.value);
            set_is_loading(true);
          }}
          className="input-field py-2 sm:w-48"
        >
          {STATUS_OPTIONS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <div className="glass-card">
        {is_loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl shimmer" />
            ))}
          </div>
        ) : filtered_applications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="text-slate-400 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">Sin trámites encontrados</p>
            <p className="text-slate-500 text-sm mt-1">
              {search || status_filter
                ? 'Cambia los filtros para ver más resultados'
                : 'Inicia el primer trámite para un ciudadano'}
            </p>
            <Link to="/architect/procedures/new" className="btn-primary mt-4 inline-flex">
              Nuevo Trámite
            </Link>
          </div>
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
                        <span className={getStatusBadgeClass(sol.status)}>
                          {getStatusLabel(sol.status)}
                        </span>
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
      </div>
    </div>
  );
}
