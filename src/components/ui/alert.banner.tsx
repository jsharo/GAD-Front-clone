import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertBannerProps {
  variant?: AlertVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: typeof AlertCircle; container: string; iconClass: string }
> = {
  error: {
    icon: AlertCircle,
    container: 'bg-red-50 text-red-600 border-red-200',
    iconClass: 'text-red-600',
  },
  success: {
    icon: CheckCircle2,
    container: 'bg-green-50 text-green-800 border-green-200',
    iconClass: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-amber-50 text-amber-800 border-amber-200',
    iconClass: 'text-amber-600',
  },
  info: {
    icon: Info,
    container: 'bg-primary-light/10 text-primary-default border-primary-light/30',
    iconClass: 'text-primary-default',
  },
};

export function AlertBanner({
  variant = 'error',
  message,
  onDismiss,
  className,
}: AlertBannerProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3 sm:p-4 text-sm',
        config.container,
        className
      )}
      role="alert"
    >
      <Icon size={16} className={cn('flex-shrink-0 mt-0.5', config.iconClass)} />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-black/5"
          aria-label="Cerrar alerta"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
