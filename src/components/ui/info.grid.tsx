import { Cn } from '@/lib/utils';

export interface InfoGridItem {
  label: string;
  value?: string | null;
}

interface InfoGridProps {
  items: InfoGridItem[];
  columns?: 2 | 3;
  className?: string;
}

export function InfoGrid({ items, columns = 2, className }: InfoGridProps) {
  return (
    <div
      className={Cn(
        'grid gap-3 text-sm',
        columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2',
        className
      )}
    >
      {items.map(({ label, value }) => (
        <div key={label}>
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="text-blue-955 font-medium mt-0.5">{value || '—'}</p>
        </div>
      ))}
    </div>
  );
}
