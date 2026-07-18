import { Cn } from '@/lib/utils';
import { GetProcedureTypeBadgeClass, GetProcedureTypeLabel } from '@/lib/constants/procedure.types';

interface ProcedureTypeBadgeProps {
  type: string;
  className?: string;
}

export function ProcedureTypeBadge({ type, className }: ProcedureTypeBadgeProps) {
  return (
    <span
      className={Cn(
        'inline-flex rounded-full border px-3 py-1 text-xs font-semibold',
        GetProcedureTypeBadgeClass(type),
        className
      )}
    >
      {GetProcedureTypeLabel(type)}
    </span>
  );
}
