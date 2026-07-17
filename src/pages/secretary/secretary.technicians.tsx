import { useEffect, useMemo, useState } from 'react';
import { MapPin, Save, Users } from 'lucide-react';
import { users_api } from '@/lib/api.calls';
import { MapUser, type User } from '@/stores/auth.store';
import { PageHeader } from '@/components/ui/page.header';
import { StatCard, KpiGrid } from '@/components/ui/stat.card';
import { AlertBanner } from '@/components/ui/alert.banner';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { EmptyState } from '@/components/ui/empty.state';
import { SearchInput } from '@/components/ui/search.input';
import { PanelCard } from '@/components/ui/panel.card';

export function SecretaryTechnicians() {
  const [technicians, set_technicians] = useState<User[]>([]);
  const [zones, set_zones] = useState<Record<string, '' | 'URBAN' | 'RURAL'>>({});
  const [search, set_search] = useState('');
  const [is_loading, set_is_loading] = useState(true);
  const [saving_id, set_saving_id] = useState<string | null>(null);
  const [error, set_error] = useState<string | null>(null);

  const LoadTechnicians = async () => {
    set_is_loading(true);
    set_error(null);
    try {
      const { data } = await users_api.Technicians();
      const list = (data ?? []).map(MapUser).filter((u): u is User => u !== null);
      set_technicians(list);
      set_zones(Object.fromEntries(list.map((t: User) => [t.id, t.zone ?? ''])));
    } catch (e: any) {
      set_error(e.response?.data?.message || 'No se pudieron cargar los técnicos');
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    LoadTechnicians();
  }, []);

  const filtered_technicians = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return technicians;
    return technicians.filter(
      (t) =>
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.phone ?? '').includes(q)
    );
  }, [search, technicians]);

  const SaveZone = async (technician: User) => {
    set_saving_id(technician.id);
    set_error(null);
    try {
      const zone = zones[technician.id] || null;
      const { data } = await users_api.UpdateTechnicianZone(technician.id, zone);
      const updated = MapUser(data);
      if (updated) {
        set_technicians((prev) => prev.map((t) => (t.id === technician.id ? updated : t)));
        set_zones((prev) => ({ ...prev, [technician.id]: updated.zone ?? '' }));
      }
    } catch (e: any) {
      set_error(e.response?.data?.message || 'No se pudo guardar la zona');
    } finally {
      set_saving_id(null);
    }
  };

  const counts = {
    all: technicians.length,
    urban: technicians.filter((t) => t.zone === 'URBAN').length,
    rural: technicians.filter((t) => t.zone === 'RURAL').length,
    no_zone: technicians.filter((t) => !t.zone).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asignación de Técnicos"
        description="Secretaría define qué zona atiende cada técnico."
        icon={Users}
      />

      <KpiGrid>
        {[
          {
            label: 'Técnicos',
            value: counts.all,
            icon: Users,
            icon_class_name: 'text-primary-default',
            icon_wrapper_class_name: 'bg-primary-light/10',
          },
          {
            label: 'Urbano',
            value: counts.urban,
            icon: MapPin,
            icon_class_name: 'text-primary-dark',
            icon_wrapper_class_name: 'bg-primary-light/10',
          },
          {
            label: 'Rural',
            value: counts.rural,
            icon: MapPin,
            icon_class_name: 'text-success-dark',
            icon_wrapper_class_name: 'bg-success-light/20',
          },
          {
            label: 'Sin zona',
            value: counts.no_zone,
            icon: Users,
            icon_class_name: 'text-secondary-dark',
            icon_wrapper_class_name: 'bg-secondary-light/20',
          },
        ].map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            icon_class_name={stat.icon_class_name}
            icon_wrapper_class_name={stat.icon_wrapper_class_name}
            is_loading={is_loading}
          />
        ))}
      </KpiGrid>

      {error && <AlertBanner message={error} OnDismiss={() => set_error(null)} />}

      <PanelCard className="p-6">
        <SearchInput
          container_class_name="mb-5"
          icon_size={16}
          value={search}
          onChange={(e) => set_search(e.target.value)}
          placeholder="Buscar técnico por nombre, correo o teléfono..."
        />

        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-neutral-200 bg-neutral-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Técnico</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Zona asignada</th>
                <th className="px-6 py-4 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {is_loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4">
                    <LoadingSkeleton count={2} variant="row" />
                  </td>
                </tr>
              ) : filtered_technicians.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon={Users}
                      title="No se encontraron técnicos"
                      description="Prueba con otro término de búsqueda."
                      className="py-8"
                    />
                  </td>
                </tr>
              ) : (
                filtered_technicians.map((technician) => (
                  <tr
                    key={technician.id}
                    className="border-b border-neutral-200 hover:bg-neutral-100"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-blue-950">
                        {technician.first_name} {technician.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{technician.email}</p>
                      <p className="text-xs text-slate-400">{technician.phone || 'Sin teléfono'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${technician.is_active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}
                      >
                        {technician.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        <select
                          className="input-field min-w-40"
                          value={zones[technician.id] ?? ''}
                          onChange={(e) =>
                            set_zones((prev) => ({
                              ...prev,
                              [technician.id]: e.target.value as '' | 'URBAN' | 'RURAL',
                            }))
                          }
                        >
                          <option value="">Todas las zonas</option>
                          <option value="URBAN">Urbano</option>
                          <option value="RURAL">Rural</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => SaveZone(technician)}
                        disabled={
                          saving_id === technician.id ||
                          (zones[technician.id] ?? '') === (technician.zone ?? '')
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={14} />
                        {saving_id === technician.id ? 'Guardando...' : 'Guardar'}
                      </button>
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
