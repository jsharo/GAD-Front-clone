export interface FilterState {
  search: string;
  procedure_type: string;
  status: string;
  date_from: string;
  date_to: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export const DEFAULT_PROCEDURE_TYPES: FilterOption[] = [
  { value: 'BUILDING_LINE', label: 'Línea de Fábricas' },
  { value: 'PLAN_APPROVAL', label: 'Aprobación de Planos' },
  { value: 'CONSTRUCTION_PERMIT', label: 'Permiso de Construcción' },
];

export const DEFAULT_STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PENDING_SECRETARY', label: 'Pte. Secretaría' },
  { value: 'OBSERVED', label: 'Observado' },
  { value: 'PENDING_TECHNICIAN', label: 'Revisión Técnica' },
  { value: 'INSPECTION', label: 'En Inspección' },
  { value: 'PENDING_PAYMENT', label: 'Pendiente de Pago' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
];
