import { type ReactNode } from 'react';
import { Bell, BookOpen, Dumbbell, Home, LogOut, MessageSquare, NotebookText, Search, UtensilsCrossed, Users } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLogout } from '../hooks/auth';
import { useAuth } from '../features/auth';
import { Button } from './ui';

export function AuthLayout({ children, size = 'default' }: { children: ReactNode; size?: 'default' | 'wide' }) {
  return (
    <main className="min-h-screen text-brand-charcoal dark:text-brand-text-main">
      <div
        className={`mx-auto flex min-h-screen w-full flex-col justify-center px-5 py-8 ${
          size === 'wide' ? 'max-w-2xl' : 'max-w-md'
        }`}
      >
        {children}
      </div>
    </main>
  );
}

export function ProtectedLayout() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const isStudent = user?.role === 'STUDENT';

  const studentLinks = [
    { to: '/athlete', label: 'خانه', icon: Home, end: true },
    { to: '/athlete/exercises', label: 'حرکات', icon: Search },
    { to: '/athlete/programs', label: 'برنامه ها', icon: NotebookText },
    { to: '/athlete/nutrition', label: 'تغذیه', icon: UtensilsCrossed },
    { to: '/athlete/questions', label: 'سوال ها', icon: MessageSquare },
    { to: '/athlete/foods', label: 'بانک غذایی', icon: BookOpen, sidebarOnly: true },
  ];

  const coachLinks = [
    { to: '/coach', label: 'خانه', icon: Home, end: true },
    { to: '/coach/athletes', label: 'ورزشکاران', icon: Users },
    { to: '/coach/exercises', label: 'حرکات', icon: Dumbbell },
    { to: '/coach/nutrition', label: 'تغذیه', icon: UtensilsCrossed },
    { to: '/coach/questions', label: 'سوال ها', icon: MessageSquare },
    { to: '/coach/notifications', label: 'اعلان ها', icon: Bell },
  ];

  const links = isStudent ? studentLinks : coachLinks;
  const homePath = isStudent ? '/athlete' : '/coach';

  return (
    <div className="min-h-screen overflow-x-hidden pb-28 text-brand-charcoal dark:text-brand-text-main md:pb-0">
      <header className="sticky top-0 z-30 border-b border-stone-300/70 bg-stone-50/80 backdrop-blur-xl dark:border-brand-border dark:bg-brand-surface/85">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button className="flex items-center gap-3 text-right" onClick={() => navigate(homePath)}>
            <span className="grid h-14 w-14 place-items-center rounded-xl border border-brand-red-bright/40 bg-brand-red shadow-glow-sm">
              <Dumbbell className="h-8 w-8 text-brand-text-main" />
            </span>
            <span>
              <span className="block text-sm font-bold">Bahman Coach</span>
              <span className="block text-xs text-slate-500 dark:text-brand-text-muted">{user?.fullName}</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <button
              className="grid h-12 w-12 place-items-center rounded-xl text-slate-600 transition hover:bg-brand-red/10 hover:text-brand-red disabled:opacity-50 dark:text-brand-text-soft dark:hover:bg-brand-red/15 dark:hover:text-brand-red-text"
              disabled={logout.isPending}
              onClick={() => {
                logout.mutate(undefined, {
                  onSettled: () => navigate('/'),
                });
              }}
              aria-label="خروج"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-20 space-y-1">
            {links.map((item) => (
              <SideNavItem key={item.to} {...item} />
            ))}
          </nav>
        </aside>

        <motion.div
          key={location.pathname}
          className="min-w-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.div>
      </div>

      <nav className="fixed inset-x-0 bottom-6 z-40 flex justify-center md:hidden">
        <div className="flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface/90 px-2.5 py-2 shadow-xl shadow-black/50 backdrop-blur-2xl">
          {links.filter((item) => !('sidebarOnly' in item && item.sidebarOnly)).map((item) => (
            <BottomNavItem key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function SideNavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'bg-brand-red/10 text-brand-red-strong dark:bg-brand-red/20 dark:text-brand-red-text'
            : 'text-slate-600 hover:bg-stone-200/70 dark:text-brand-text-muted dark:hover:bg-brand-carbon'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  );
}

function BottomNavItem({
  to,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}) {
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <div
          className={`grid h-10 w-10 place-items-center rounded-full transition-all duration-200 ${
            isActive
              ? 'bg-brand-red shadow-md shadow-brand-red/25'
              : 'bg-brand-carbon hover:bg-brand-stone'
          }`}
        >
          <Icon
            className={`h-5 w-5 transition-colors duration-200 ${
              isActive ? 'text-brand-text-main' : 'text-brand-text-soft'
            }`}
          />
        </div>
      )}
    </NavLink>
  );
}
