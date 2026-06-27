import { cn } from '@/lib/utils';
import { getProcedureTypeBadgeClass, getProcedureTypeLabel } from '@/lib/constants/procedure-types';

interface ProcedureTypeBadgeProps {
  type: string;
  className?: string;
}

export function ProcedureTypeBadge({ type, className }: ProcedureTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
        getProcedureTypeBadgeClass(type),
        className
      )}
    >
      {getProcedureTypeLabel(type)}
    </span>
  );
}
