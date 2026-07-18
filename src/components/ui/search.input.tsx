import { Search } from 'lucide-react';
import { Cn } from '@/lib/utils';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  container_class_name?: string;
  icon_size?: number;
}

export function SearchInput({
  className,
  container_class_name,
  icon_size = 18,
  ...props
}: SearchInputProps) {
  return (
    <div className={Cn('relative', container_class_name)}>
      <Search
        size={icon_size}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input type="search" className={Cn('input-field pl-10', className)} {...props} />
    </div>
  );
}
