import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Search, Sun, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const styles = {
    primary:
      'bg-brand-yellow text-surface-dark hover:opacity-90 font-bold shadow-glow-sm',
    secondary:
      'bg-white/10 text-slate-800 border border-slate-200 hover:bg-slate-100 dark:bg-white/[0.07] dark:text-white dark:border-white/10 dark:hover:bg-white/[0.12] backdrop-blur-md',
    ghost:
      'text-slate-600 hover:bg-slate-100/70 dark:text-white/70 dark:hover:bg-white/[0.07]',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay }}
      className={`rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-card backdrop-blur-md dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-brand-yellow/60 focus:ring-4 focus:ring-brand-yellow/10 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-yellow/50 dark:backdrop-blur-md ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-brand-yellow/60 focus:ring-4 focus:ring-brand-yellow/10 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:placeholder:text-white/30 dark:backdrop-blur-md ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`min-h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-sm outline-none transition-all duration-200 focus:border-brand-yellow/60 focus:ring-4 focus:ring-brand-yellow/10 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:backdrop-blur-md ${className}`}
      {...props}
    />
  );
}

export function SearchBox(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
      <Input className="pr-10" {...props} />
    </div>
  );
}

export function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  return (
    <button
      className="grid h-12 w-12 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100/70 dark:text-white/70 dark:hover:bg-white/[0.07]"
      onClick={toggleTheme}
      aria-label="تغییر تم"
    >
      {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
    </button>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-end bg-black/50 backdrop-blur-sm p-0 sm:place-items-center sm:p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:bg-surface-dark/90 sm:max-w-2xl sm:rounded-2xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-white">{title}</h2>
            <button
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/[0.07]"
              onClick={onClose}
              aria-label="بستن"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function EmptyState({ title, caption }: { title: string; caption?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-white/10"
    >
      <p className="font-semibold text-slate-700 dark:text-white/70">{title}</p>
      {caption ? <p className="mt-1 text-sm text-slate-500 dark:text-white/40">{caption}</p> : null}
    </motion.div>
  );
}

export function ScrollLoader() {
  return (
    <div className="flex justify-center py-5">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-surface-dark dark:border-white/20 dark:border-t-brand-yellow" />
    </div>
  );
}
