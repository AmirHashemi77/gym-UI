import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Moon, Search, Sun, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const styles = {
    primary:
      'border border-brand-red-bright/50 bg-brand-red text-brand-text-main hover:bg-brand-red-strong font-bold shadow-glow-sm',
    secondary:
      'border border-slate-300 bg-white/70 text-brand-charcoal hover:border-brand-red/50 hover:bg-stone-100 dark:border-brand-border dark:bg-brand-carbon/90 dark:text-brand-text-main dark:hover:border-brand-red-bright/60 dark:hover:bg-brand-stone backdrop-blur-md',
    ghost:
      'text-slate-600 hover:bg-brand-red/10 hover:text-brand-red-strong dark:text-brand-text-soft dark:hover:bg-brand-red/15 dark:hover:text-brand-text-main',
    danger: 'border border-brand-red-bright/60 bg-brand-red-bright text-white hover:bg-brand-red-strong',
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-red-bright/25 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
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
      className={`rounded-2xl border border-stone-300/80 bg-stone-50/90 p-4 shadow-card backdrop-blur-md dark:border-brand-border dark:bg-brand-surface-2/90 dark:shadow-black/40 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-xl border border-stone-300 bg-stone-50/90 px-3 text-sm text-brand-charcoal outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-brand-red/70 focus:ring-4 focus:ring-brand-red/10 dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-main dark:placeholder:text-brand-text-muted dark:focus:border-brand-red-bright/70 dark:focus:ring-brand-red/20 dark:backdrop-blur-md ${className}`}
      {...props}
    />
  );
}

export function PasswordInput({ className = '', ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const toggleLabel = isPasswordVisible ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور';

  return (
    <div className="relative w-full">
      <Input
        {...props}
        type={isPasswordVisible ? 'text' : 'password'}
        className={`pl-11 ${className}`}
      />
      <button
        type="button"
        className="absolute left-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-brand-red/10 hover:text-brand-red dark:text-brand-text-muted dark:hover:bg-brand-red/15 dark:hover:text-brand-red-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-bright/60"
        onClick={() => setIsPasswordVisible((visible) => !visible)}
        aria-label={toggleLabel}
        title={toggleLabel}
        aria-pressed={isPasswordVisible}
      >
        {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-stone-300 bg-stone-50/90 px-3 py-3 text-sm text-brand-charcoal outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-brand-red/70 focus:ring-4 focus:ring-brand-red/10 dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-main dark:placeholder:text-brand-text-muted dark:focus:border-brand-red-bright/70 dark:focus:ring-brand-red/20 dark:backdrop-blur-md ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`min-h-11 w-full rounded-xl border border-stone-300 bg-stone-50/90 px-3 text-sm text-brand-charcoal outline-none transition-all duration-200 focus:border-brand-red/70 focus:ring-4 focus:ring-brand-red/10 dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-main dark:focus:border-brand-red-bright/70 dark:focus:ring-brand-red/20 dark:backdrop-blur-md ${className}`}
      {...props}
    />
  );
}

export function SearchBox(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-brand-text-muted" />
      <Input className="pr-10" {...props} />
    </div>
  );
}

export function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  return (
    <button
      className="grid h-12 w-12 place-items-center rounded-xl text-slate-600 transition hover:bg-brand-red/10 hover:text-brand-red dark:text-brand-text-soft dark:hover:bg-brand-red/15 dark:hover:text-brand-red-text"
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
        className="fixed inset-0 z-50 grid place-items-end bg-brand-black/80 backdrop-blur-sm p-0 sm:place-items-center sm:p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-stone-300 bg-stone-50/95 p-5 shadow-2xl backdrop-blur-xl dark:border-brand-border dark:bg-brand-surface/95 sm:max-w-2xl sm:rounded-2xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold dark:text-brand-text-main">{title}</h2>
            <button
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-brand-red/10 hover:text-brand-red dark:text-brand-text-muted dark:hover:bg-brand-red/15 dark:hover:text-brand-red-text"
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
      className="rounded-2xl border border-dashed border-stone-400 p-8 text-center dark:border-brand-border"
    >
      <p className="font-semibold text-slate-700 dark:text-brand-text-soft">{title}</p>
      {caption ? <p className="mt-1 text-sm text-slate-500 dark:text-brand-text-muted">{caption}</p> : null}
    </motion.div>
  );
}

export function ScrollLoader() {
  return (
    <div className="flex justify-center py-5">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-brand-red dark:border-brand-border dark:border-t-brand-red-bright" />
    </div>
  );
}
