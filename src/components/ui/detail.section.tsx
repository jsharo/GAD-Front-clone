import type { LucideIcon } from 'lucide-react';
import { Cn } from '@/lib/utils';

interface DetailSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({ title, icon: Icon, children, className }: DetailSectionProps) {
  return (
    <div className={Cn('glass-card p-5 sm:p-6', className)}>
      <h2 className="font-heading font-semibold text-blue-955 mb-4 flex items-center gap-2 text-sm">
        {Icon && <Icon size={16} className="text-primary-default" />}
        {title}
      </h2>
      {children}
    </div>
  );
}
