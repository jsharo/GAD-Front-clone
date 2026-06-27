import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
  iconSize?: number;
}

export function SearchInput({
  className,
  containerClassName,
  iconSize = 18,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search
        size={iconSize}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input type="search" className={cn('input-field pl-10', className)} {...props} />
    </div>
  );
}
