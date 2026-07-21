import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { Cn } from '@/lib/utils';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertBannerProps {
  variant?: AlertVariant;
  message: string;
  OnDismiss?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: typeof AlertCircle; container: string; icon_class: string }
> = {
  error: {
    icon: AlertCircle,
    container: 'bg-red-50 text-red-600 border-red-200',
    icon_class: 'text-red-600',
  },
  success: {
    icon: CheckCircle2,
    container: 'bg-green-50 text-green-800 border-green-200',
    icon_class: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-amber-50 text-amber-800 border-amber-200',
    icon_class: 'text-amber-600',
  },
  info: {
    icon: Info,
    container: 'bg-primary-light/10 text-primary-default border-primary-light/30',
    icon_class: 'text-primary-default',
  },
};

export function AlertBanner({
  variant = 'error',
  message,
  OnDismiss,
  className,
}: AlertBannerProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={Cn(
        'flex items-start gap-3 rounded-xl border p-3 sm:p-4 text-sm',
        config.container,
        className
      )}
      role="alert"
    >
      <Icon size={16} className={Cn('flex-shrink-0 mt-0.5', config.icon_class)} />
      <span className="flex-1">{message}</span>
      {OnDismiss && (
        <button
          type="button"
          onClick={OnDismiss}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-black/5"
          aria-label="Dismiss alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
