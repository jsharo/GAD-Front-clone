import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function FormatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function FormatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function GetStatusBadgeClass(status: string): string {
  const status_map: Record<string, string> = {
    DRAFT: 'badge-draft',
    UNDER_REVIEW: 'badge-review',
    INSPECTION: 'badge-inspection',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
    OBSERVED: 'badge-observed',
    PENDING_SECRETARY: 'badge-pending-secretary',
    PENDING_PAYMENT: 'badge-pending-payment',
    PAID: 'badge-paid',
    // Spanish mapping fallback
    BORRADOR: 'badge-draft',
    EN_REVISION: 'badge-review',
    INSPECCION: 'badge-inspection',
    APROBADO: 'badge-approved',
    NEGADO: 'badge-rejected',
    OBSERVADO: 'badge-observed',
    PENDIENTE_SECRETARIA: 'badge-pending-secretary',
    PENDIENTE_PAGO: 'badge-pending-payment',
    PAGADO: 'badge-paid',
  };
  return status_map[status] ?? 'badge-draft';
}

export function GetStatusLabel(status: string): string {
  const label_map: Record<string, string> = {
    DRAFT: 'Draft',
    UNDER_REVIEW: 'Under Review',
    INSPECTION: 'Under Inspection',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    OBSERVED: 'Flagged',
    PENDING_SECRETARY: 'Pending Secretary',
    PENDING_PAYMENT: 'Pending Payment',
    PAID: 'Paid',
    // Spanish mapping fallback
    BORRADOR: 'Draft',
    EN_REVISION: 'Under Review',
    INSPECCION: 'Under Inspection',
    APROBADO: 'Approved',
    NEGADO: 'Rejected',
    OBSERVADO: 'Flagged',
    PENDIENTE_SECRETARIA: 'Pending Secretary',
    PENDIENTE_PAGO: 'Pending Payment',
    PAGADO: 'Paid',
  };
  return label_map[status] ?? status;
}
