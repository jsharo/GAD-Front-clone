import React, { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type ToastItem } from '@/stores/toast.store'

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink-width {
          animation: shrinkWidth linear forwards;
        }
      ` }} />
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  )
}

function ToastCard({ item }: { item: ToastItem }) {
  const removeToast = useToastStore((state) => state.removeToast)
  const { id, type, message, duration = 4000 } = item

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id)
    }, duration)
    return () => clearTimeout(timer)
  }, [id, duration, removeToast])

  const configs = {
    success: {
      icon: CheckCircle2,
      color: 'text-green-600',
      accentBg: 'bg-green-600',
      bg: 'bg-green-50/95 border-green-200',
    },
    error: {
      icon: XCircle,
      color: 'text-red-600',
      accentBg: 'bg-red-600',
      bg: 'bg-red-50/95 border-red-200',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      accentBg: 'bg-amber-600',
      bg: 'bg-amber-50/95 border-amber-300',
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      accentBg: 'bg-blue-600',
      bg: 'bg-blue-50/95 border-blue-200',
    },
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div
      className={`pointer-events-auto relative w-full flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in ${config.bg}`}
    >
      <div className={`flex-shrink-0 mt-0.5 ${config.color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-slate-800 text-xs font-semibold leading-relaxed break-words">{message}</p>
      </div>
      <button
        onClick={() => removeToast(id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100/50 transition-all cursor-pointer"
      >
        <X size={14} />
      </button>

      {/* Progress Bar Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden bg-slate-200/20">
        <div
          className={`h-full ${config.accentBg} animate-shrink-width`}
          style={{
            animationDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  )
}
