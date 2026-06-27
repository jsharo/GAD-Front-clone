export interface FilterState {
  search: string;
  procedureType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export const DEFAULT_PROCEDURE_TYPES: FilterOption[] = [
  { value: 'LINEA_FABRICAS', label: 'Línea de Fábricas' },
  { value: 'APROBACION_PLANOS', label: 'Aprobación de Planos' },
  { value: 'PERMISO_CONSTRUCCION', label: 'Permiso de Construcción' },
];

export const DEFAULT_STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'PENDIENTE_SECRETARIA', label: 'Pte. Secretaría' },
  { value: 'OBSERVADO', label: 'Observado' },
  { value: 'EN_REVISION_TECNICA', label: 'Revisión Técnica' },
  { value: 'INSPECCION', label: 'En Inspección' },
  { value: 'PENDIENTE_PAGO', label: 'Pendiente de Pago' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'APROBADO', label: 'Aprobado' },
  { value: 'RECHAZADO', label: 'Rechazado' },
];
