import { Clock3 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page.header';
import { EmptyState } from '@/components/ui/empty.state';

export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title={title} icon={Clock3} />
      <EmptyState
        icon={Clock3}
        title="Módulo en preparación"
        description="Su sesión está activa. Las funciones de este portal estarán disponibles próximamente."
        className="py-16"
      />
    </div>
  );
}
