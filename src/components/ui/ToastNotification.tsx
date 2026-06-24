import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type ToastItem } from '@/stores/toast.store';

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function ToastCard({ item }: { item: ToastItem }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const { id, type, message, duration = 4000 } = item;

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  const configs = {
    success: {
      icon: CheckCircle2,
      color: 'text-success-dark',
      accentBg: 'bg-success-default',
      bg: 'bg-success-light/20 border-success-light',
    },
    error: {
      icon: XCircle,
      color: 'text-error-dark',
      accentBg: 'bg-error-default',
      bg: 'bg-error-light/20 border-error-light',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning-dark',
      accentBg: 'bg-warning-default',
      bg: 'bg-warning-light/20 border-warning-light',
    },
    info: {
      icon: Info,
      color: 'text-primary-default',
      accentBg: 'bg-primary-default',
      bg: 'bg-primary-light/10 border-primary-light/30',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto relative w-full flex items-start gap-3 rounded-2xl border p-4 ${config.bg}`}
    >
      <div className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${config.accentBg}`} />
      <div className={`flex-shrink-0 mt-0.5 ${config.color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-slate-800 text-xs font-semibold leading-relaxed break-words">
          {message}
        </p>
      </div>
      <button
        onClick={() => removeToast(id)}
        className="flex-shrink-0 cursor-pointer rounded-lg p-0.5 text-slate-400 hover:bg-neutral-100 hover:text-slate-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}
