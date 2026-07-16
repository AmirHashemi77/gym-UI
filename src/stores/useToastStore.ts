import { create } from 'zustand';

type SuccessToast = {
  id: number;
  message: string;
};

type ToastState = {
  toasts: SuccessToast[];
  showSuccess: (message: string) => void;
  dismiss: (id: number) => void;
};

let nextToastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showSuccess: (message) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const toast = { id: ++nextToastId, message: trimmedMessage };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
