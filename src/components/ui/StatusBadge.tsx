import React from 'react'
import {
  FileText,
  Clock,
  AlertTriangle,
  ClipboardList,
  MapPin,
  CheckCircle,
  XCircle,
  type LucideIcon
} from 'lucide-react'

export type ApplicationStatus =
  | 'DRAFT'
  | 'PENDING_SECRETARY'
  | 'OBSERVED'
  | 'PENDING_TECHNICIAN'
  | 'INSPECTION'
  | 'APPROVED'
  | 'REJECTED'

interface StatusConfig {
  label: string
  bgClass: string
  textClass: string
  borderClass: string
  icon: LucideIcon
}

const STATUS_MAP: Record<ApplicationStatus, StatusConfig> = {
  DRAFT: {
    label: 'Borrador',
    bgClass: 'bg-slate-100/70',
    textClass: 'text-slate-700',
    borderClass: 'border-slate-300/60',
    icon: FileText,
  },
  PENDING_SECRETARY: {
    label: 'Pte. Secretaría',
    bgClass: 'bg-amber-50/70 backdrop-blur-md',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-300/50',
    icon: Clock,
  },
  OBSERVED: {
    label: 'Observado',
    bgClass: 'bg-yellow-50/70 backdrop-blur-md',
    textClass: 'text-yellow-850',
    borderClass: 'border-yellow-350/60',
    icon: AlertTriangle,
  },
  PENDING_TECHNICIAN: {
    label: 'Pte. Técnico',
    bgClass: 'bg-blue-50/70 backdrop-blur-md',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-300/50',
    icon: ClipboardList,
  },
  INSPECTION: {
    label: 'En Inspección',
    bgClass: 'bg-purple-50/70 backdrop-blur-md',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-300/50',
    icon: MapPin,
  },
  APPROVED: {
    label: 'Aprobado',
    bgClass: 'bg-green-50/70 backdrop-blur-md',
    textClass: 'text-green-800',
    borderClass: 'border-green-350/50',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rechazado',
    bgClass: 'bg-red-50/70 backdrop-blur-md',
    textClass: 'text-red-800',
    borderClass: 'border-red-300/50',
    icon: XCircle,
  },
}

export interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.DRAFT
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${config.bgClass} ${config.textClass} ${config.borderClass} ${className}`}
    >
      <Icon size={12} className="flex-shrink-0 animate-pulse" />
      <span>{config.label}</span>
    </span>
  )
}
