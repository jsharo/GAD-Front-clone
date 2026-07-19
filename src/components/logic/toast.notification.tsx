import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore, type ToastItem } from '@/stores/toast.store';

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[9999] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col items-center gap-3">
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function ToastCard({ item }: { item: ToastItem }) {
  const RemoveToast = useToastStore((state) => state.RemoveToast);
  const { id, type, message, duration = 4000 } = item;

  useEffect(() => {
    const timer = setTimeout(() => {
      RemoveToast(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, RemoveToast]);

  const configs = {
    success: {
      icon: CheckCircle2,
      color: 'text-success-dark',
      bg: 'bg-white border-success-light shadow-lg',
    },
    error: {
      icon: XCircle,
      color: 'text-error-dark',
      bg: 'bg-white border-error-light shadow-lg',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning-dark',
      bg: 'bg-white border-warning-light shadow-lg',
    },
    info: {
      icon: Info,
      color: 'text-primary-default',
      bg: 'bg-white border-primary-light/40 shadow-lg',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      className={`w-full flex items-start gap-3 rounded-2xl border p-4 ${config.bg}`}
      role="status"
    >
      <div className={`flex-shrink-0 mt-0.5 ${config.color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 text-xs font-semibold leading-relaxed break-words text-center sm:text-left">
          {message}
        </p>
      </div>
    </div>
  );
}
