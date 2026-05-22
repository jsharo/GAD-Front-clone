import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  try {
    if (!date) return '—'
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) return String(date)
    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parsed)
  } catch (e) {
    return String(date || '—')
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    if (!date) return '—'
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) return String(date)
    return new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed)
  } catch (e) {
    return String(date || '—')
  }
}

export function getEstadoBadgeClass(estado: string): string {
  const map: Record<string, string> = {
    BORRADOR: 'badge-borrador',
    EN_REVISION: 'badge-revision',
    INSPECCION: 'badge-inspeccion',
    APROBADO: 'badge-aprobado',
    NEGADO: 'badge-negado',
  }
  return map[estado] ?? 'badge-borrador'
}

export function getEstadoLabel(estado: string): string {
  const map: Record<string, string> = {
    BORRADOR: 'Borrador',
    EN_REVISION: 'En Revisión',
    INSPECCION: 'En Inspección',
    APROBADO: 'Aprobado',
    NEGADO: 'Negado',
  }
  return map[estado] ?? estado
}
