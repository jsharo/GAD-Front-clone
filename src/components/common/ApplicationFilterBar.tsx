import React, { useState, useEffect } from 'react'
import { Search, Calendar, RefreshCcw, SlidersHorizontal } from 'lucide-react'

export interface FilterState {
  search: string
  procedureType: string
  status: string
  dateFrom: string
  dateTo: string
}

export interface ApplicationFilterBarProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

export function ApplicationFilterBar({
  onFilterChange,
  initialFilters,
}: ApplicationFilterBarProps) {
  const [search, setSearch] = useState(initialFilters?.search ?? '')
  const [procedureType, setProcedureType] = useState(initialFilters?.procedureType ?? '')
  const [status, setStatus] = useState(initialFilters?.status ?? '')
  const [dateFrom, setDateFrom] = useState(initialFilters?.dateFrom ?? '')
  const [dateTo, setDateTo] = useState(initialFilters?.dateTo ?? '')

  // Emit filter changes whenever a filter state changes
  useEffect(() => {
    onFilterChange({
      search,
      procedureType,
      status,
      dateFrom,
      dateTo,
    })
  }, [search, procedureType, status, dateFrom, dateTo, onFilterChange])

  const handleClear = () => {
    setSearch('')
    setProcedureType('')
    setStatus('')
    setDateFrom('')
    setDateTo('')
  }

  const procedureTypes = [
    { value: 'LINEA_FABRICAS', label: 'Línea de Fábricas' },
    { value: 'APROBACION_PLANOS', label: 'Aprobación de Planos' },
    { value: 'PERMISO_CONSTRUCCION', label: 'Permiso de Construcción' },
  ]

  const statusOptions = [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'PENDING_SECRETARY', label: 'Pte. Secretaría' },
    { value: 'OBSERVED', label: 'Observado' },
    { value: 'PENDING_TECHNICIAN', label: 'Pte. Técnico' },
    { value: 'INSPECTION', label: 'En Inspección' },
    { value: 'APPROVED', label: 'Aprobado' },
    { value: 'REJECTED', label: 'Rechazado' },
  ]

  return (
    <div className="w-full bg-white/75 backdrop-blur-md border border-slate-200/50 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header and responsive grid */}
      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
        <SlidersHorizontal size={16} className="text-blue-600" />
        <span>Buscador y Filtros de Solicitudes</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Search text input */}
        <div className="lg:col-span-3 space-y-1 text-left">
          <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">Buscar</label>
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

        {/* Procedure Dropdown */}
        <div className="lg:col-span-2 space-y-1 text-left">
          <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">Trámite</label>
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

        {/* Status Dropdown */}
        <div className="lg:col-span-2 space-y-1 text-left">
          <label className="text-[10px] tracking-wider uppercase font-bold text-blue-600">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field py-2 text-xs rounded-xl cursor-pointer bg-white"
          >
            <option value="">Todos los estados</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
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

        {/* Date To */}
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

        {/* Actions (Reset) */}
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
  )
}
