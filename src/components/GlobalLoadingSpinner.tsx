import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

export function GlobalLoadingSpinner() {
  const activeRequests = useIsFetching() + useIsMutating();
  const isLoading = activeRequests > 0;

  return (
    <AnimatePresence>
      {isLoading ? (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-brand-black/70 p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="status"
          aria-live="polite"
          aria-label="در حال بارگذاری"
        >
          <motion.div
            className="flex min-w-40 flex-col items-center gap-3 rounded-2xl border border-stone-300 bg-stone-50/95 px-7 py-6 shadow-2xl dark:border-brand-border dark:bg-brand-surface/95"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-stone-300 dark:border-brand-border" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-brand-red-bright border-t-brand-red-bright motion-reduce:animate-none" />
              <div className="absolute inset-[14px] animate-pulse rounded-full bg-brand-red shadow-glow-sm motion-reduce:animate-none" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-brand-text-soft">در حال بارگذاری...</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
