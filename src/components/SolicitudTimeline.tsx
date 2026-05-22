import { FileText, CheckCircle2, Clock, MapPin, DollarSign, XCircle, FileCheck2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Definimos el flujo feliz esperado
const STEPS = [
  { key: 'INGRESO', estados: ['BORRADOR'], label: 'Ingresada', icon: FileText },
  { key: 'SECRETARIA', estados: ['PENDIENTE_SECRETARIA', 'OBSERVADO'], label: 'Secretaría', icon: FileCheck2 },
  { key: 'TECNICO', estados: ['EN_REVISION', 'INSPECCION'], label: 'Técnico', icon: MapPin },
  { key: 'PAGO', estados: ['PENDIENTE_PAGO', 'PAGADO'], label: 'Financiero', icon: DollarSign },
  { key: 'FIN', estados: ['APROBADO', 'NEGADO'], label: 'Resultado', icon: CheckCircle2 },
]

export function SolicitudTimeline({ estadoActual }: { estadoActual: string }) {
  // Encontrar en qué paso (index) está el estado actual
  const currentStepIndex = STEPS.findIndex(step => step.estados.includes(estadoActual))
  
  // Si por alguna razón el estado no está, o es NEGADO
  const esNegado = estadoActual === 'NEGADO'
  const esObservado = estadoActual === 'OBSERVADO'
  
  return (
    <div className="flex justify-between items-start relative w-full pt-2">
      {/* Línea de fondo */}
      <div className="absolute top-[18px] left-[10%] right-[10%] h-1 bg-slate-200 z-0 rounded-full" />
      
      {/* Progreso */}
      {currentStepIndex > 0 && !esNegado && !esObservado && (
        <div 
          className="absolute top-[18px] left-[10%] h-1 bg-blue-500 z-0 rounded-full transition-all duration-500" 
          style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 80}%` }}
        />
      )}
      
      {STEPS.map((step, index) => {
        const isCompleted = currentStepIndex > index
        const isCurrent = currentStepIndex === index
        
        let bgColor = 'bg-white'
        let borderColor = 'border-slate-200'
        let iconColor = 'text-slate-400'
        let labelColor = 'text-slate-500'

        if (isCompleted) {
          bgColor = 'bg-blue-500'
          borderColor = 'border-blue-500'
          iconColor = 'text-white'
          labelColor = 'text-blue-950'
        } else if (isCurrent) {
          if (esNegado) {
            bgColor = 'bg-red-500'
            borderColor = 'border-red-500'
            iconColor = 'text-white'
            labelColor = 'text-red-600'
            step.icon = XCircle
          } else if (esObservado) {
            bgColor = 'bg-amber-500'
            borderColor = 'border-amber-500'
            iconColor = 'text-white'
            labelColor = 'text-amber-600'
            step.icon = Clock
          } else {
            bgColor = 'bg-white'
            borderColor = 'border-blue-500'
            iconColor = 'text-blue-500'
            labelColor = 'text-blue-600 font-bold'
          }
        }

        return (
          <div key={step.key} className="flex flex-col items-center gap-2 relative z-10 flex-1">
            <div className={cn(
              'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
              bgColor, borderColor,
              isCurrent && !esNegado && !esObservado ? 'shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' : ''
            )}>
              <step.icon size={18} className={iconColor} />
            </div>
            <span className={cn('text-[11px] sm:text-xs text-center font-medium mt-1', labelColor)}>
              {step.label}
            </span>
            
            {/* Etiqueta pequeña de estado actual */}
            {isCurrent && (
              <span className={cn(
                'absolute -bottom-6 text-[10px] font-bold px-2 py-0.5 rounded-full',
                esNegado ? 'bg-red-100 text-red-600' :
                esObservado ? 'bg-amber-100 text-amber-600' :
                estadoActual === 'APROBADO' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              )}>
                {estadoActual.replace('_', ' ')}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
