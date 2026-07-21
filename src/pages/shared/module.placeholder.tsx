import { Clock3 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page.header';
import { EmptyState } from '@/components/ui/empty.state';

export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={title} icon={Clock3} />
      <EmptyState
        icon={Clock3}
        title="Module in development"
        description="Your session is active. This portal's features will be available soon."
        className="py-16"
      />
    </div>
  );
}
