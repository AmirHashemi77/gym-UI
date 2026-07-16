import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useToastStore } from '../stores/useToastStore';

const TOAST_DURATION = 4000;

function SuccessToast({ id, message }: { id: number; message: string }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timeout = window.setTimeout(() => dismiss(id), TOAST_DURATION);
    return () => window.clearTimeout(timeout);
  }, [dismiss, id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-emerald-400/20 dark:bg-surface-dark/95"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-black text-slate-800 dark:text-white">عملیات موفق</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/60">{message}</p>
        </div>
        <button
          type="button"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white/70"
          onClick={() => dismiss(id)}
          aria-label="بستن پیام"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1 origin-right bg-emerald-500 dark:bg-brand-yellow"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function SuccessToasts() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[110] space-y-3 sm:right-6 sm:left-auto sm:w-[380px]" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <div className="pointer-events-auto" key={toast.id}>
            <SuccessToast {...toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
