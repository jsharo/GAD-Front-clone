import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  AddToast: (toast: Omit<ToastItem, 'id'> & { id?: string }) => string;
  RemoveToast: (id: string) => void;
  ClearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  AddToast: (toast) => {
    const id = toast.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  RemoveToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  ClearToasts: () => {
    set({ toasts: [] });
  },
}));
