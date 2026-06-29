import { Building2, Trees } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZoneBadgeProps {
  zone?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function ZoneBadge({ zone, size = 'md', className }: ZoneBadgeProps) {
  if (!zone) return null;

  const isUrban = zone === 'URBAN' || zone === 'URBANO';
  const isSmall = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border font-medium',
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        isUrban
          ? 'border-primary-light bg-primary-light/10 text-primary-default'
          : 'border-success-light bg-success-light/20 text-success-dark',
        className
      )}
    >
      {isUrban ? <Building2 size={isSmall ? 10 : 13} /> : <Trees size={isSmall ? 10 : 13} />}
      {isUrban ? 'Urbano' : 'Rural'}
    </span>
  );
}
