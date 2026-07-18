export const PROCEDURE_TYPE_CODES = [
  'CONSTRUCTION_PERMIT',

  'BUILDING_LINE',

  'PLAN_APPROVAL',
] as const;

export type ProcedureTypeCode = (typeof PROCEDURE_TYPE_CODES)[number];

export const PROCEDURE_TYPE_LABELS: Record<string, string> = {
  CONSTRUCTION_PERMIT: 'Permiso de Construcción',

  BUILDING_LINE: 'Línea de Fábricas',

  PLAN_APPROVAL: 'Aprobación de Planos',

  // Legacy Spanish codes (compat)

  PERMISO_CONSTRUCCION: 'Permiso de Construcción',

  LINEA_FABRICAS: 'Línea de Fábricas',

  APROBACION_PLANOS: 'Aprobación de Planos',
};

export const PROCEDURE_TYPE_BADGE_CLASS: Record<string, string> = {
  CONSTRUCTION_PERMIT: 'border-primary-light bg-primary-light/10 text-primary-default',

  BUILDING_LINE: 'border-secondary-light bg-secondary-light/10 text-secondary-dark',

  PLAN_APPROVAL: 'border-success-light bg-success-light/20 text-success-dark',

  PERMISO_CONSTRUCCION: 'border-primary-light bg-primary-light/10 text-primary-default',

  LINEA_FABRICAS: 'border-secondary-light bg-secondary-light/10 text-secondary-dark',

  APROBACION_PLANOS: 'border-success-light bg-success-light/20 text-success-dark',
};

const DEFAULT_BADGE_CLASS = 'border-primary-light bg-primary-light/10 text-primary-default';

export function GetProcedureTypeLabel(type: string): string {
  return PROCEDURE_TYPE_LABELS[type] ?? type;
}

export function GetProcedureTypeBadgeClass(type: string): string {
  return PROCEDURE_TYPE_BADGE_CLASS[type] ?? DEFAULT_BADGE_CLASS;
}
