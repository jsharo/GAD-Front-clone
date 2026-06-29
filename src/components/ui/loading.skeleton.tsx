import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'card' | 'row' | 'block';
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<LoadingSkeletonProps['variant']>, string> = {
  card: 'h-32 rounded-2xl shimmer',
  row: 'h-20 rounded-xl shimmer',
  block: 'h-24 rounded-xl shimmer',
};

export function LoadingSkeleton({ count = 3, variant = 'card', className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={VARIANT_CLASSES[variant]} />
      ))}
    </div>
  );
}
