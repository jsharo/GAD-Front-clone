import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  OnClose: () => void;
}

export function ImageLightbox({ src, alt = 'Vista ampliada', OnClose }: ImageLightboxProps) {
  useEffect(() => {
    const Handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') OnClose();
    };
    window.addEventListener('keydown', Handler);
    return () => window.removeEventListener('keydown', Handler);
  }, [OnClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={OnClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-full bg-black/30 p-2 text-white"
        onClick={OnClose}
        aria-label="Cerrar"
      >
        <X size={22} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
