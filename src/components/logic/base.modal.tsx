import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface BaseModalProps {
  is_open: boolean;
  OnClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hide_brand_bar?: boolean;
  /** Respeta el header fijo (h-20) arriba y margen inferior al posicionar el modal. */
  respect_header?: boolean;
}

export function BaseModal({
  is_open,
  OnClose,
  title,
  children,
  size = 'md',
  hide_brand_bar = false,
  respect_header = false,
}: BaseModalProps) {
  const modal_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const HandleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        OnClose();
      }
    };

    if (is_open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', HandleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', HandleEscape);
    };
  }, [is_open, OnClose]);

  if (!is_open) return null;

  const size_classes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in">
      {/* Backdrop: cubre toda la pantalla, incluido el header */}
      <div
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs cursor-default"
        onClick={OnClose}
      />

      {/* Capa de posicionamiento del modal */}
      <div
        className={`relative z-10 flex h-full w-full justify-center px-4 ${
          respect_header ? 'pt-20 pb-6 items-center' : 'py-4 items-center'
        }`}
      >
        <div
          ref={modal_ref}
          className={`relative flex w-full flex-col ${size_classes[size]} overflow-hidden bg-white border border-slate-200/50 shadow-2xl rounded-3xl transition-all duration-300 animate-slide-up ${
            respect_header ? 'max-h-[calc(100vh-5rem-1.5rem)]' : 'max-h-[75vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {!hide_brand_bar && (
            <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-red-500 via-[#F5C100] to-green-500" />
          )}

          {/* Modal Header */}
          <div className="flex shrink-0 items-center justify-between p-5 border-b border-slate-100 bg-white">
            {title ? (
              <h3 className="font-heading font-black text-slate-900 text-lg tracking-wide">
                {title}
              </h3>
            ) : (
              <div />
            )}
            <button
              onClick={OnClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-white p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
