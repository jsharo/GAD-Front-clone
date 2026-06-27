import { useState, useEffect } from 'react';
import { Search, Calendar, RefreshCcw, SlidersHorizontal } from 'lucide-react';
import {
  DEFAULT_PROCEDURE_TYPES,
  DEFAULT_STATUS_OPTIONS,
  type FilterOption,
  type FilterState,
} from '@/lib/constants/application-filters';

export interface ApplicationFilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  statusOptions?: FilterOption[];
  procedureTypes?: FilterOption[];
  showProcedureFilter?: boolean;
  showDateFilters?: boolean;
}

export function ApplicationFilterBar({
  onFilterChange,
  initialFilters,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  procedureTypes = DEFAULT_PROCEDURE_TYPES,
  showProcedureFilter = true,
  showDateFilters = true,
}: ApplicationFilterBarProps) {
  const [search, setSearch] = useState(initialFilters?.search ?? '');
  const [procedureType, setProcedureType] = useState(initialFilters?.procedureType ?? '');
  const [status, setStatus] = useState(initialFilters?.status ?? '');
  const [dateFrom, setDateFrom] = useState(initialFilters?.dateFrom ?? '');
  const [dateTo, setDateTo] = useState(initialFilters?.dateTo ?? '');

  useEffect(() => {
    onFilterChange({
      search,
      procedureType,
      status,
      dateFrom,
      dateTo,
    });
  }, [search, procedureType, status, dateFrom, dateTo, onFilterChange]);

  const handleClear = () => {
    setSearch('');
    setProcedureType('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="w-full bg-white/75 backdrop-blur-md border border-slate-200/50 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
        <SlidersHorizontal size={16} className="text-blue-600" />
        <span>Buscador y Filtros de Solicitudes</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-3 space-y-1 text-left">
          <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">
            Buscar
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cédula, N° trámite, dirección..."
              className="input-field py-2 px-9 text-xs rounded-xl"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
        </div>

        {showProcedureFilter && (
          <div className="lg:col-span-2 space-y-1 text-left">
            <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">
              Trámite
            </label>
            <select
              value={procedureType}
              onChange={(e) => setProcedureType(e.target.value)}
              className="input-field py-2 text-xs rounded-xl cursor-pointer bg-white"
            >
              <option value="">Todos los trámites</option>
              {procedureTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          className={`space-y-1 text-left ${showProcedureFilter ? 'lg:col-span-2' : 'lg:col-span-3'}`}
        >
          <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field py-2 text-xs rounded-xl cursor-pointer bg-white"
          >
            {statusOptions.map((s) => (
              <option key={s.value || 'all'} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {showDateFilters && (
          <>
            <div className="lg:col-span-2 space-y-1 text-left">
              <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600 flex items-center gap-1">
                <Calendar size={10} /> Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field py-1.5 px-2 text-xs rounded-xl"
              />
            </div>

            <div className="lg:col-span-2 space-y-1 text-left">
              <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600 flex items-center gap-1">
                <Calendar size={10} /> Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field py-1.5 px-2 text-xs rounded-xl"
              />
            </div>
          </>
        )}

        <div className="lg:col-span-1 flex items-center justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all font-semibold text-xs active:scale-95 cursor-pointer"
            title="Limpiar Filtros"
          >
            <RefreshCcw size={12} />
            <span className="lg:hidden">Limpiar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
