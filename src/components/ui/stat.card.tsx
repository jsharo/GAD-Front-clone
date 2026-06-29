import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  iconWrapperClassName?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName = 'text-primary-default',
  iconWrapperClassName = 'bg-primary-light/10',
  isLoading = false,
  className,
}: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      {isLoading ? (
        <div className="h-10 w-10 rounded-xl shimmer" />
      ) : (
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconWrapperClassName
          )}
        >
          <Icon size={20} className={iconClassName} />
        </div>
      )}
      <div>
        {isLoading ? (
          <>
            <div className="mb-2 h-7 w-16 rounded-lg shimmer" />
            <div className="h-3 w-24 rounded-lg shimmer" />
          </>
        ) : (
          <>
            <p className="text-2xl font-heading font-bold text-blue-950">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}

interface KpiGridProps {
  children: React.ReactNode;
  columns?: '2-4' | '3' | '1-3';
  className?: string;
}

export function KpiGrid({ children, columns = '2-4', className }: KpiGridProps) {
  const gridClass =
    columns === '3'
      ? 'grid grid-cols-3 gap-4'
      : columns === '1-3'
        ? 'grid grid-cols-1 md:grid-cols-3 gap-4'
        : 'grid grid-cols-2 lg:grid-cols-4 gap-4';

  return <div className={cn(gridClass, className)}>{children}</div>;
}
