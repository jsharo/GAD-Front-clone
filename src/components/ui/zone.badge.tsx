import { Building2, Trees } from 'lucide-react';
import { Cn } from '@/lib/utils';

interface ZoneBadgeProps {
  zone?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function ZoneBadge({ zone, size = 'md', className }: ZoneBadgeProps) {
  if (!zone) return null;

  const is_urban = zone === 'URBAN' || zone === 'URBAN';
  const is_small = size === 'sm';

  return (
    <span
      className={Cn(
        'inline-flex items-center gap-1 rounded-lg border font-medium',
        is_small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        is_urban
          ? 'border-primary-light bg-primary-light/10 text-primary-default'
          : 'border-success-light bg-success-light/20 text-success-dark',
        className
      )}
    >
      {is_urban ? <Building2 size={is_small ? 10 : 13} /> : <Trees size={is_small ? 10 : 13} />}
      {is_urban ? 'Urbano' : 'Rural'}
    </span>
  );
}
