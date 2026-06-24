import { useEffect, useState } from 'react';
import { FileCheck2, Clock, CheckCircle2, XCircle, Inbox, TrendingUp } from 'lucide-react';
import { applications_api } from '@/lib/api.calls';
import { Link } from 'react-router-dom';
import { formatDateTime } from '@/lib/utils';

const TIPO_LABEL: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
};

interface Application {
  id: string;
  status: string;
  procedure_type: string;
  created_at: string;
  citizen?: {
    first_name: string;
    last_name: string;
  } | null;
}

export function SecretaryDashboard() {
  const [applications, set_applications] = useState<Application[]>([]);
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    applications_api
      .list({ limit: 100 })
      .then(({ data }) => {
        const mapped = (data.data || []).map((s: any) => ({
          id: s.id,
          status: s.estado,
          procedure_type: s.tipoTramite,
          created_at: s.createdAt,
          citizen: s.ciudadano
            ? {
                first_name: s.ciudadano.nombre,
                last_name: s.ciudadano.apellido,
              }
            : null,
        }));
        set_applications(mapped);
      })
      .catch(() => set_applications([]))
      .finally(() => set_is_loading(false));
  }, []);

  const pending_applications = applications.filter((s) => s.status === 'PENDIENTE_SECRETARIA');
  const observed_applications = applications.filter((s) => s.status === 'OBSERVADO');
  const total = applications.length;

  const stats = [
    {
      label: 'Pendientes de Revisión',
      value: pending_applications.length,
      icon: Clock,
      iconClass: 'text-warning-dark',
      iconWrapperClass: 'bg-warning-light/20',
    },
    {
      label: 'En Proceso',
      value: applications.filter((s) => ['EN_REVISION_TECNICA', 'INSPECCION'].includes(s.status))
        .length,
      icon: CheckCircle2,
      iconClass: 'text-success-dark',
      iconWrapperClass: 'bg-success-light/20',
    },
    {
      label: 'Devueltas con Obs.',
      value: observed_applications.length,
      icon: XCircle,
      iconClass: 'text-error-dark',
      iconWrapperClass: 'bg-error-light/20',
    },
    {
      label: 'Total Histórico',
      value: total,
      icon: TrendingUp,
      iconClass: 'text-secondary-dark',
      iconWrapperClass: 'bg-secondary-light/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-blue-955">Panel de Secretaría</h1>
        <p className="text-sm text-slate-500">
          Revisión documental — verificación de firma y completitud
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconWrapperClass}`}
              >
                <s.icon size={18} className={s.iconClass} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800">{s.value}</p>
            <p className="mt-1 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Flujo de etapas — orientación visual */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="font-bold text-blue-955 mb-4 text-left">Etapas del Proceso</h2>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            {
              label: 'Ciudadano\nSube docs',
              active: false,
              activeClass: 'bg-primary-default text-neutral-50',
              textClass: 'text-primary-default',
            },
            {
              label: 'Secretaría\nRevisa',
              active: true,
              activeClass: 'bg-secondary-default text-neutral-50',
              textClass: 'text-secondary-dark',
            },
            {
              label: 'Técnico\nEvalúa',
              active: false,
              activeClass: 'bg-success-default text-neutral-50',
              textClass: 'text-success-dark',
            },
            {
              label: 'Aprobado',
              active: false,
              activeClass: 'bg-success-default text-neutral-50',
              textClass: 'text-success-dark',
            },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${step.active ? step.activeClass : 'bg-neutral-200 text-neutral-400'}`}
                >
                  {i + 1}
                </div>
                <p
                  className={`mt-2 max-w-[72px] whitespace-pre-line text-center text-xs font-semibold leading-tight ${step.active ? step.textClass : 'text-neutral-400'}`}
                >
                  {step.label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className="mx-1 h-0.5 w-8 flex-shrink-0 bg-neutral-200 sm:w-16" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Solicitudes recientes */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4">
          <Inbox size={18} className="text-secondary-dark" />
          <h2 className="font-bold text-blue-955">Solicitudes Pendientes de Revisión</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {is_loading ? (
            <div className="p-6 space-y-4">
              <div className="h-12 rounded-xl shimmer" />
              <div className="h-12 rounded-xl shimmer" />
            </div>
          ) : pending_applications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay solicitudes pendientes de revisión
            </div>
          ) : (
            pending_applications.slice(0, 5).map((sol) => (
              <Link
                to={`/secretary/inbox/${sol.id}`}
                key={sol.id}
                className="block cursor-pointer px-6 py-4 hover:bg-neutral-100"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-secondary-light bg-secondary-light/20 text-left text-secondary-dark">
                    <FileCheck2 size={16} className="text-secondary-dark" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-blue-955 text-sm">
                      {sol.citizen?.first_name} {sol.citizen?.last_name}
                    </p>
                    <p className="text-[0.75rem] text-slate-500">
                      #{sol.id.slice(0, 8)} · {TIPO_LABEL[sol.procedure_type] || 'Trámite'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-warning-light/20 px-3 py-1 text-xs font-semibold text-warning-dark">
                    {sol.status.replace('_', ' ')}
                  </span>
                  <span className="text-[0.7rem] text-slate-400">
                    {formatDateTime(sol.created_at)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="border-t border-neutral-200 px-6 py-3 text-center">
          <Link
            to="/secretary/inbox"
            className="text-sm font-semibold text-secondary-dark hover:text-primary-dark"
          >
            Ver bandeja completa →
          </Link>
        </div>
      </div>
    </div>
  );
}
