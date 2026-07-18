import React from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  ClipboardList,
  MapPin,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  type LucideIcon,
} from 'lucide-react';
import { NormalizeApplicationStatus } from '@/lib/status';

export type ApplicationStatus =
  | 'DRAFT'
  | 'PENDING_SECRETARY'
  | 'OBSERVED'
  | 'PENDING_TECHNICIAN'
  | 'INSPECTION'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'APPROVED'
  | 'REJECTED';

interface StatusConfig {
  label: string;
  bg_class: string;
  text_class: string;
  border_class: string;
  icon: LucideIcon;
}

const STATUS_MAP: Record<ApplicationStatus, StatusConfig> = {
  DRAFT: {
    label: 'Borrador',
    bg_class: 'bg-slate-100/70',
    text_class: 'text-slate-700',
    border_class: 'border-slate-300/60',
    icon: FileText,
  },
  PENDING_SECRETARY: {
    label: 'Pte. Secretaría',
    bg_class: 'bg-amber-50/70 backdrop-blur-md',
    text_class: 'text-amber-800',
    border_class: 'border-amber-300/50',
    icon: Clock,
  },
  OBSERVED: {
    label: 'Observado',
    bg_class: 'bg-yellow-50/70 backdrop-blur-md',
    text_class: 'text-yellow-850',
    border_class: 'border-yellow-350/60',
    icon: AlertTriangle,
  },
  PENDING_TECHNICIAN: {
    label: 'Pte. Técnico',
    bg_class: 'bg-blue-50/70 backdrop-blur-md',
    text_class: 'text-blue-800',
    border_class: 'border-blue-300/50',
    icon: ClipboardList,
  },
  INSPECTION: {
    label: 'En Inspección',
    bg_class: 'bg-purple-50/70 backdrop-blur-md',
    text_class: 'text-purple-800',
    border_class: 'border-purple-300/50',
    icon: MapPin,
  },
  PENDING_PAYMENT: {
    label: 'Pendiente de Pago',
    bg_class: 'bg-orange-50/70 backdrop-blur-md',
    text_class: 'text-orange-800',
    border_class: 'border-orange-300/50',
    icon: CreditCard,
  },
  PAID: {
    label: 'Pagado',
    bg_class: 'bg-teal-50/70 backdrop-blur-md',
    text_class: 'text-teal-800',
    border_class: 'border-teal-300/50',
    icon: Banknote,
  },
  APPROVED: {
    label: 'Aprobado',
    bg_class: 'bg-green-50/70 backdrop-blur-md',
    text_class: 'text-green-800',
    border_class: 'border-green-350/50',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rechazado',
    bg_class: 'bg-red-50/70 backdrop-blur-md',
    text_class: 'text-red-800',
    border_class: 'border-red-300/50',
    icon: XCircle,
  },
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalized = NormalizeApplicationStatus(status);
  const config = STATUS_MAP[normalized] || STATUS_MAP.DRAFT;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${config.bg_class} ${config.text_class} ${config.border_class} ${className}`}
    >
      <Icon size={12} className="flex-shrink-0 animate-pulse" />
      <span>{config.label}</span>
    </span>
  );
}
