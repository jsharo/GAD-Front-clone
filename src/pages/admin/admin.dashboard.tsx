import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle2, Activity, Shield, AlertTriangle } from 'lucide-react';
import { users_api } from '@/lib/api.calls';
import { PageHeader } from '@/components/ui/page.header';
import { StatCard, KpiGrid } from '@/components/ui/stat.card';
import { DetailSection } from '@/components/ui/detail.section';

interface Stats {
  usuarios: { total: number; tecnicos: number; ciudadanos: number };
  solicitudes: Record<string, number>;
}

export function AdminDashboard() {
  const [stats, set_stats] = useState<Stats | null>(null);
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    users_api
      .dashboardStats()
      .then(({ data }) => set_stats(data))
      .catch(() => {})
      .finally(() => set_is_loading(false));
  }, []);

  const kpis = [
    {
      label: 'Total Usuarios',
      value: stats?.usuarios.total ?? '—',
      icon: Users,
      color: 'text-primary-default',
      bg: 'bg-primary-light/10',
    },
    {
      label: 'Técnicos Activos',
      value: stats?.usuarios.tecnicos ?? '—',
      icon: Shield,
      color: 'text-secondary-dark',
      bg: 'bg-secondary-light/20',
    },
    {
      label: 'Sol. Aprobadas',
      value: stats?.solicitudes['APROBADO'] ?? '—',
      icon: CheckCircle2,
      color: 'text-success-dark',
      bg: 'bg-success-light/20',
    },
    {
      label: 'Sol. Pendientes',
      value: (stats?.solicitudes['EN_REVISION'] ?? 0) + (stats?.solicitudes['INSPECCION'] ?? 0),
      icon: Activity,
      color: 'text-warning-dark',
      bg: 'bg-warning-light/20',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Control"
        description="Monitoreo del sistema y gestión de usuarios del GAD Cañar."
      />

      <KpiGrid>
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            iconClassName={kpi.color}
            iconWrapperClassName={kpi.bg}
            isLoading={is_loading}
          />
        ))}
      </KpiGrid>

      {/* Estado de solicitudes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailSection title="Estado de Solicitudes" icon={FileText}>
          {[
            { key: 'BORRADOR', label: 'Borrador (Ciudadano)', color: 'bg-neutral-400' },
            {
              key: 'PENDIENTE_SECRETARIA',
              label: 'Revisión Secretaría',
              color: 'bg-secondary-default',
            },
            { key: 'OBSERVADO', label: 'Observado (Devuelto)', color: 'bg-error-default' },
            { key: 'EN_REVISION', label: 'Revisión Técnica', color: 'bg-warning-default' },
            { key: 'INSPECCION', label: 'En Inspección', color: 'bg-primary-default' },
            { key: 'PENDIENTE_PAGO', label: 'Pendiente de Pago', color: 'bg-warning-dark' },
            { key: 'PAGADO', label: 'Pagado', color: 'bg-success-default' },
            { key: 'APROBADO', label: 'Completado / Aprobado', color: 'bg-success-dark' },
            { key: 'NEGADO', label: 'Negado', color: 'bg-error-dark' },
          ].map(({ key, label, color }) => {
            const total = Object.values(stats?.solicitudes ?? {}).reduce((a, b) => a + b, 0) || 1;
            const count = stats?.solicitudes[key] ?? 0;
            const filled_segments = Math.max(0, Math.min(10, Math.round((count / total) * 10)));
            return (
              <div key={key} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-800">{label}</span>
                  <span className="text-blue-950 font-semibold">{count}</span>
                </div>
                <div className="grid h-2 grid-cols-10 gap-1">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className={`rounded-full ${index < filled_segments ? color : 'bg-neutral-200'}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </DetailSection>

        <DetailSection title="Estado del Sistema" icon={AlertTriangle}>
          {[
            { label: 'API Backend', status: 'Operativo', ok: true },
            { label: 'Base de Datos', status: 'Operativo', ok: true },
            { label: 'Almacenamiento MinIO', status: 'Operativo', ok: true },
            { label: 'Servidor Email', status: 'Operativo', ok: true },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between py-3 border-b border-surface-border last:border-0"
            >
              <span className="text-blue-800 text-sm">{s.label}</span>
              <span
                className={`text-xs font-semibold flex items-center gap-1.5 ${s.ok ? 'text-success-400' : 'text-red-400'}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${s.ok ? 'bg-success-400' : 'bg-red-400'}`}
                />
                {s.status}
              </span>
            </div>
          ))}
        </DetailSection>
      </div>
    </div>
  );
}
