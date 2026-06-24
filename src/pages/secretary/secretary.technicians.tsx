import { useEffect, useMemo, useState } from 'react';
import { MapPin, Save, Search, Users } from 'lucide-react';
import { users_api } from '@/lib/api.calls';
import { mapUser, type User } from '@/stores/auth.store';

export function SecretaryTechnicians() {
  const [technicians, set_technicians] = useState<User[]>([]);
  const [zones, set_zones] = useState<Record<string, '' | 'URBAN' | 'RURAL'>>({});
  const [search, set_search] = useState('');
  const [is_loading, set_is_loading] = useState(true);
  const [saving_id, set_saving_id] = useState<string | null>(null);
  const [error, set_error] = useState<string | null>(null);

  const loadTechnicians = async () => {
    set_is_loading(true);
    set_error(null);
    try {
      const { data } = await users_api.technicians();
      const list = (data ?? []).map(mapUser).filter((u): u is User => u !== null);
      set_technicians(list);
      set_zones(Object.fromEntries(list.map((t: User) => [t.id, t.zone ?? ''])));
    } catch (e: any) {
      set_error(e.response?.data?.message || 'No se pudieron cargar los técnicos');
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
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

  const saveZone = async (technician: User) => {
    set_saving_id(technician.id);
    set_error(null);
    try {
      const zone = zones[technician.id] || null;
      const { data } = await users_api.updateTechnicianZone(technician.id, zone);
      const updated = mapUser(data);
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
      <div>
        <h1 className="text-2xl font-extrabold text-blue-950">Asignación de Técnicos</h1>
        <p className="text-slate-500 text-sm mt-1">
          Secretaría define qué zona atiende cada técnico.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Técnicos',
            value: counts.all,
            colorClass: 'text-primary-default',
            bgClass: 'bg-primary-light/10',
          },
          {
            label: 'Urbano',
            value: counts.urban,
            colorClass: 'text-primary-dark',
            bgClass: 'bg-primary-light/10',
          },
          {
            label: 'Rural',
            value: counts.rural,
            colorClass: 'text-success-dark',
            bgClass: 'bg-success-light/20',
          },
          {
            label: 'Sin zona',
            value: counts.no_zone,
            colorClass: 'text-secondary-dark',
            bgClass: 'bg-secondary-light/20',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgClass} ${stat.colorClass}`}
            >
              <Users size={18} />
            </div>
            <p className="text-3xl font-black text-blue-950">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => set_search(e.target.value)}
            className="input-field pl-10"
            placeholder="Buscar técnico por nombre, correo o teléfono..."
          />
        </div>

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
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Cargando técnicos...
                  </td>
                </tr>
              ) : filtered_technicians.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron técnicos
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
                        onClick={() => saveZone(technician)}
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
      </div>
    </div>
  );
}
