import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: BaseModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-xs animate-fade-in">
      {/* Backdrop clickable overlay */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} glass-card bg-white/95 border border-slate-200/50 shadow-2xl rounded-3xl overflow-hidden z-10 transition-all duration-300 animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top brand line representing GAD Cañar flags */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-[#F5C100] to-green-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          {title ? (
            <h3 className="font-heading font-black text-slate-900 text-lg tracking-wide">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  )
}
