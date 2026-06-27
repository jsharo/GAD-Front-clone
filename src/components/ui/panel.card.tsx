import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelCardProps {
  title?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'neutral' | 'glass';
  className?: string;
  children: React.ReactNode;
}

export function PanelCard({
  title,
  icon: Icon,
  iconClassName = 'text-primary-default',
  actions,
  footer,
  variant = 'neutral',
  className,
  children,
}: PanelCardProps) {
  const hasHeader = Boolean(title || Icon || actions);

  return (
    <div
      className={cn(
        'overflow-hidden',
        variant === 'glass' ? 'glass-card' : 'rounded-2xl border border-neutral-200 bg-neutral-50',
        className
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            'flex items-center gap-3 border-b px-6 py-4',
            variant === 'glass' ? 'border-surface-border' : 'border-neutral-200',
            actions ? 'justify-between' : undefined
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <Icon
                size={variant === 'glass' ? 18 : 20}
                className={cn('flex-shrink-0', iconClassName)}
              />
            )}
            {title && (
              <h2
                className={cn(
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
          className={cn(
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
