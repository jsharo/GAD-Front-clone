import { useState, useEffect } from 'react';

import { Search, Calendar, RefreshCcw, SlidersHorizontal } from 'lucide-react';

import {
  DEFAULT_PROCEDURE_TYPES,
  DEFAULT_STATUS_OPTIONS,
  type FilterOption,
  type FilterState,
} from '@/lib/constants/application.filters';

export interface ApplicationFilterBarProps {
  OnFilterChange: (filters: FilterState) => void;

  initial_filters?: Partial<FilterState>;

  status_options?: FilterOption[];

  procedure_types?: FilterOption[];

  show_procedure_filter?: boolean;

  show_date_filters?: boolean;
}

export function ApplicationFilterBar({
  OnFilterChange,

  initial_filters,

  status_options = DEFAULT_STATUS_OPTIONS,

  procedure_types = DEFAULT_PROCEDURE_TYPES,

  show_procedure_filter = true,

  show_date_filters = true,
}: ApplicationFilterBarProps) {
  const [search, set_search] = useState(initial_filters?.search ?? '');

  const [procedure_type, set_procedure_type] = useState(initial_filters?.procedure_type ?? '');

  const [status, set_status] = useState(initial_filters?.status ?? '');

  const [date_from, set_date_from] = useState(initial_filters?.date_from ?? '');

  const [date_to, set_date_to] = useState(initial_filters?.date_to ?? '');

  useEffect(() => {
    OnFilterChange({
      search,

      procedure_type,

      status,

      date_from,

      date_to,
    });
  }, [search, procedure_type, status, date_from, date_to, OnFilterChange]);

  const HandleClear = () => {
    set_search('');

    set_procedure_type('');

    set_status('');

    set_date_from('');

    set_date_to('');
  };

  return (
    <div className="w-full bg-white/75 backdrop-blur-md border border-slate-200/50 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
        <SlidersHorizontal size={16} className="text-blue-600" />

        <span>Application Search & Filters</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-3 space-y-1 text-left">
          <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">
            Search
          </label>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => set_search(e.target.value)}
              placeholder="National ID, application no., address..."
              className="input-field py-2 px-9 text-xs rounded-xl"
            />

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
        </div>

        {show_procedure_filter && (
          <div className="lg:col-span-2 space-y-1 text-left">
            <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">
              Procedure
            </label>

            <select
              value={procedure_type}
              onChange={(e) => set_procedure_type(e.target.value)}
              className="input-field py-2 text-xs rounded-xl cursor-pointer bg-white"
            >
              <option value="">All procedures</option>

              {procedure_types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          className={`space-y-1 text-left ${show_procedure_filter ? 'lg:col-span-2' : 'lg:col-span-3'}`}
        >
          <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => set_status(e.target.value)}
            className="input-field py-2 text-xs rounded-xl cursor-pointer bg-white"
          >
            {status_options.map((s) => (
              <option key={s.value || 'all'} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {show_date_filters && (
          <>
            <div className="lg:col-span-2 space-y-1 text-left">
              <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600 flex items-center gap-1">
                <Calendar size={10} /> From
              </label>

              <input
                type="date"
                value={date_from}
                onChange={(e) => set_date_from(e.target.value)}
                className="input-field py-1.5 px-2 text-xs rounded-xl"
              />
            </div>

            <div className="lg:col-span-2 space-y-1 text-left">
              <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600 flex items-center gap-1">
                <Calendar size={10} /> To
              </label>

              <input
                type="date"
                value={date_to}
                onChange={(e) => set_date_to(e.target.value)}
                className="input-field py-1.5 px-2 text-xs rounded-xl"
              />
            </div>
          </>
        )}

        <div className="lg:col-span-1 flex items-center justify-end">
          <button
            type="button"
            onClick={HandleClear}
            className="btn-secondary w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all font-semibold text-xs active:scale-95 cursor-pointer"
            title="Clear filters"
          >
            <RefreshCcw size={12} />

            <span className="lg:hidden">Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}
