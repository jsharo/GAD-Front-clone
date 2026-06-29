export const PROCEDURE_TYPE_CODES = [
  'PERMISO_CONSTRUCCION',
  'LINEA_FABRICAS',
  'APROBACION_PLANOS',
] as const;

export type ProcedureTypeCode = (typeof PROCEDURE_TYPE_CODES)[number];

export const PROCEDURE_TYPE_LABELS: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'Permiso de Construcción',
  LINEA_FABRICAS: 'Línea de Fábricas',
  APROBACION_PLANOS: 'Aprobación de Planos',
};

export const PROCEDURE_TYPE_BADGE_CLASS: Record<string, string> = {
  PERMISO_CONSTRUCCION: 'border-primary-light bg-primary-light/10 text-primary-default',
  LINEA_FABRICAS: 'border-secondary-light bg-secondary-light/10 text-secondary-dark',
  APROBACION_PLANOS: 'border-success-light bg-success-light/20 text-success-dark',
};

const DEFAULT_BADGE_CLASS = 'border-primary-light bg-primary-light/10 text-primary-default';

export function getProcedureTypeLabel(type: string): string {
  return PROCEDURE_TYPE_LABELS[type] ?? type;
}

export function getProcedureTypeBadgeClass(type: string): string {
  return PROCEDURE_TYPE_BADGE_CLASS[type] ?? DEFAULT_BADGE_CLASS;
}
