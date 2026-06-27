import { FileText, CheckCircle2, Clock, MapPin, XCircle, FileCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'ENTRY', statuses: ['BORRADOR', 'DRAFT'], label: 'Ingresada', icon: FileText },
  {
    key: 'SECRETARY',
    statuses: ['PENDIENTE_SECRETARIA', 'PENDING_SECRETARY', 'OBSERVADO', 'OBSERVED'],
    label: 'Secretaría',
    icon: FileCheck2,
  },
  {
    key: 'TECHNICIAN',
    statuses: ['EN_REVISION', 'UNDER_REVIEW', 'INSPECCION', 'INSPECTION'],
    label: 'Técnico',
    icon: MapPin,
  },
  {
    key: 'END',
    statuses: ['APROBADO', 'APPROVED', 'NEGADO', 'REJECTED'],
    label: 'Resultado',
    icon: CheckCircle2,
  },
];

export function ApplicationTimeline({ current_status }: { current_status: string }) {
  const current_step_index = STEPS.findIndex((step) => step.statuses.includes(current_status));

  const is_rejected = current_status === 'NEGADO' || current_status === 'REJECTED';
  const is_observed = current_status === 'OBSERVADO' || current_status === 'OBSERVED';

  return (
    <div className="flex items-start w-full pt-2">
      {STEPS.map((step, index) => {
        const is_completed = current_step_index > index;
        const is_current = current_step_index === index;
        const CurrentIcon =
          is_current && is_rejected ? XCircle : is_current && is_observed ? Clock : step.icon;

        let bg_color = 'bg-white';
        let border_color = 'border-slate-200';
        let icon_color = 'text-slate-400';
        let label_color = 'text-slate-500';

        if (is_completed) {
          bg_color = 'bg-blue-500';
          border_color = 'border-blue-500';
          icon_color = 'text-white';
          label_color = 'text-blue-950';
        } else if (is_current) {
          if (is_rejected) {
            bg_color = 'bg-red-500';
            border_color = 'border-red-500';
            icon_color = 'text-white';
            label_color = 'text-red-600';
          } else if (is_observed) {
            bg_color = 'bg-amber-500';
            border_color = 'border-amber-500';
            icon_color = 'text-white';
            label_color = 'text-amber-600';
          } else {
            bg_color = 'bg-white';
            border_color = 'border-blue-500';
            icon_color = 'text-blue-500';
            label_color = 'text-blue-600 font-bold';
          }
        }

        return (
          <div key={step.key} className="flex flex-1 items-start last:flex-none">
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                  bg_color,
                  border_color
                )}
              >
                <CurrentIcon size={18} className={icon_color} />
              </div>
              <span
                className={cn('mt-1 text-[11px] sm:text-xs text-center font-medium', label_color)}
              >
                {step.label}
              </span>
              {is_current && (
                <span
                  className={cn(
                    'absolute -bottom-6 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold',
                    is_rejected
                      ? 'bg-error-light/20 text-error-dark border border-error-light'
                      : is_observed
                        ? 'bg-warning-light/20 text-warning-dark border border-warning-light'
                        : current_status === 'APROBADO' || current_status === 'APPROVED'
                          ? 'bg-success-light/20 text-success-dark border border-success-light'
                          : 'bg-primary-light/10 text-primary-default border border-primary-light/30'
                  )}
                >
                  {current_status.replace('_', ' ')}
                </span>
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mt-[18px] h-1 flex-1 rounded-full',
                  current_step_index > index && !is_rejected && !is_observed
                    ? 'bg-primary-default'
                    : 'bg-slate-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
