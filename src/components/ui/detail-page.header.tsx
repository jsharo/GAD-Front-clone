import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status.badge';
import { ProcedureTypeBadge } from '@/components/ui/procedure-type.badge';

interface DetailPageHeaderProps {
  backTo: string;
  title: string;
  subtitle?: React.ReactNode;
  status?: string;
  procedureType?: string;
  showProcedureTypeBadge?: boolean;
  badges?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DetailPageHeader({
  backTo,
  title,
  subtitle,
  status,
  procedureType,
  showProcedureTypeBadge = false,
  badges,
  className,
  contentClassName,
}: DetailPageHeaderProps) {
  return (
    <div className={cn('flex items-start gap-4', className)}>
      <Link to={backTo} className="btn-secondary p-2 mt-1 flex-shrink-0">
        <ArrowLeft size={18} />
      </Link>
      <div className={cn('flex-1 min-w-0', contentClassName)}>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading text-xl font-bold text-blue-955">{title}</h1>
          {showProcedureTypeBadge && procedureType && <ProcedureTypeBadge type={procedureType} />}
          {status && <StatusBadge status={status} />}
          {badges}
        </div>
        {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
      </div>
    </div>
  );
}
