import { FileText, CheckCircle2, Clock, MapPin, XCircle, FileCheck2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'ENTRY', statuses: ['BORRADOR', 'DRAFT'], label: 'Ingresada', icon: FileText },
  { key: 'SECRETARY', statuses: ['PENDIENTE_SECRETARIA', 'PENDING_SECRETARY', 'OBSERVADO', 'OBSERVED'], label: 'Secretaría', icon: FileCheck2 },
  { key: 'TECHNICIAN', statuses: ['EN_REVISION', 'UNDER_REVIEW', 'INSPECCION', 'INSPECTION'], label: 'Técnico', icon: MapPin },
  { key: 'END', statuses: ['APROBADO', 'APPROVED', 'NEGADO', 'REJECTED'], label: 'Resultado', icon: CheckCircle2 },
]

export function ApplicationTimeline({ current_status }: { current_status: string }) {
  const current_step_index = STEPS.findIndex(step => step.statuses.includes(current_status))
  
  const is_rejected = current_status === 'NEGADO' || current_status === 'REJECTED'
  const is_observed = current_status === 'OBSERVADO' || current_status === 'OBSERVED'
  
  return (
    <div className="flex justify-between items-start relative w-full pt-2">
      {/* Background Line */}
      <div className="absolute top-[18px] left-[10%] right-[10%] h-1 bg-slate-200 z-0 rounded-full" />
      
      {/* Progress Line */}
      {current_step_index > 0 && !is_rejected && !is_observed && (
        <div 
          className="absolute top-[18px] left-[10%] h-1 bg-blue-500 z-0 rounded-full transition-all duration-500" 
          style={{ width: `${(current_step_index / (STEPS.length - 1)) * 80}%` }}
        />
      )}
      
      {STEPS.map((step, index) => {
        const is_completed = current_step_index > index
        const is_current = current_step_index === index
        
        let bg_color = 'bg-white'
        let border_color = 'border-slate-200'
        let icon_color = 'text-slate-400'
        let label_color = 'text-slate-500'

        if (is_completed) {
          bg_color = 'bg-blue-500'
          border_color = 'border-blue-500'
          icon_color = 'text-white'
          label_color = 'text-blue-950'
        } else if (is_current) {
          if (is_rejected) {
            bg_color = 'bg-red-500'
            border_color = 'border-red-500'
            icon_color = 'text-white'
            label_color = 'text-red-600'
            step.icon = XCircle
          } else if (is_observed) {
            bg_color = 'bg-amber-500'
            border_color = 'border-amber-500'
            icon_color = 'text-white'
            label_color = 'text-amber-600'
            step.icon = Clock
          } else {
            bg_color = 'bg-white'
            border_color = 'border-blue-500'
            icon_color = 'text-blue-500'
            label_color = 'text-blue-600 font-bold'
          }
        }

        return (
          <div key={step.key} className="flex flex-col items-center gap-2 relative z-10 flex-1">
            <div className={cn(
              'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
              bg_color, border_color,
              is_current && !is_rejected && !is_observed ? 'shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' : ''
            )}>
              <step.icon size={18} className={icon_color} />
            </div>
            <span className={cn('text-[11px] sm:text-xs text-center font-medium mt-1', label_color)}>
              {step.label}
            </span>
            
            {/* Small current status bubble */}
            {is_current && (
              <span className={cn(
                'absolute -bottom-6 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap',
                is_rejected ? 'bg-red-100 text-red-600' :
                is_observed ? 'bg-amber-100 text-amber-600' :
                current_status === 'APROBADO' || current_status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              )}>
                {current_status.replace('_', ' ')}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
