import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status.badge';
import { ProcedureTypeBadge } from '@/components/ui/procedure.type.badge';

interface DetailPageHeaderProps {
  back_to: string;
  title: string;
  subtitle?: React.ReactNode;
  status?: string;
  procedure_type?: string;
  show_procedure_type_badge?: boolean;
  badges?: React.ReactNode;
  className?: string;
  content_class_name?: string;
}

export function DetailPageHeader({
  back_to,
  title,
  subtitle,
  status,
  procedure_type,
  show_procedure_type_badge = false,
  badges,
  className,
  content_class_name,
}: DetailPageHeaderProps) {
  return (
    <div className={Cn('flex items-start gap-4', className)}>
      <Link to={back_to} className="btn-secondary p-2 mt-1 flex-shrink-0">
        <ArrowLeft size={18} />
      </Link>
      <div className={Cn('flex-1 min-w-0', content_class_name)}>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading text-xl font-bold text-blue-955">{title}</h1>
          {show_procedure_type_badge && procedure_type && (
            <ProcedureTypeBadge type={procedure_type} />
          )}
          {status && <StatusBadge status={status} />}
          {badges}
        </div>
        {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
      </div>
    </div>
  );
}
