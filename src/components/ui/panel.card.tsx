import type { LucideIcon } from 'lucide-react';
import { Cn } from '@/lib/utils';

interface PanelCardProps {
  title?: string;
  icon?: LucideIcon;
  icon_class_name?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'neutral' | 'glass';
  className?: string;
  children: React.ReactNode;
}

export function PanelCard({
  title,
  icon: Icon,
  icon_class_name = 'text-primary-default',
  actions,
  footer,
  variant = 'neutral',
  className,
  children,
}: PanelCardProps) {
  const has_header = Boolean(title || Icon || actions);

  return (
    <div
      className={Cn(
        'overflow-hidden',
        variant === 'glass' ? 'glass-card' : 'rounded-2xl border border-neutral-200 bg-neutral-50',
        className
      )}
    >
      {has_header && (
        <div
          className={Cn(
            'flex items-center gap-3 border-b px-6 py-4',
            variant === 'glass' ? 'border-surface-border' : 'border-neutral-200',
            actions ? 'justify-between' : undefined
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <Icon
                size={variant === 'glass' ? 18 : 20}
                className={Cn('flex-shrink-0', icon_class_name)}
              />
            )}
            {title && (
              <h2
                className={Cn(
                  'truncate text-blue-955',
                  variant === 'glass' ? 'font-heading font-semibold' : 'font-bold'
                )}
              >
                {title}
              </h2>
            )}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}
      {children}
      {footer && (
        <div
          className={Cn(
            'border-t px-6 py-3 text-center',
            variant === 'glass' ? 'border-surface-border' : 'border-neutral-200'
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
