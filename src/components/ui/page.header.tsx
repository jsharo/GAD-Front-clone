import type { LucideIcon } from 'lucide-react';
import { Cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={Cn(
        'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4',
        className
      )}
    >
      <div>
        <h1
          className={Cn(
            'font-heading text-2xl font-bold text-blue-950',
            Icon && 'flex items-center gap-3'
          )}
        >
          {Icon && <Icon className="text-primary-default" size={24} />}
          {title}
        </h1>
        {description && <p className="text-blue-800 mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
