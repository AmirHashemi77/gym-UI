import { type ReactNode } from 'react';
import { Bell, Dumbbell, Home, LogOut, MessageSquare, NotebookText, Search, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/auth';
import { useAuth } from '../features/auth';
import { Button, ThemeToggle } from './ui';

export function AuthLayout({ children, size = 'default' }: { children: ReactNode; size?: 'default' | 'wide' }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className={`mx-auto flex min-h-screen w-full flex-col justify-center px-5 py-8 ${size === 'wide' ? 'max-w-2xl' : 'max-w-md'}`}>
        {children}
      </div>
    </main>
  );
}

export function ProtectedLayout() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const isStudent = user?.role === 'STUDENT';

  const studentLinks = [
    { to: '/athlete/exercises', label: 'حرکات', icon: Search },
    { to: '/athlete/questions', label: 'سوال ها', icon: MessageSquare },
    { to: '/athlete/programs', label: 'برنامه ها', icon: NotebookText },
  ];

  const coachLinks = [
    { to: '/coach/athletes', label: 'ورزشکاران', icon: Users },
    { to: '/coach/exercises', label: 'حرکات', icon: Dumbbell },
    { to: '/coach/questions', label: 'سوال ها', icon: MessageSquare },
    { to: '/coach/notifications', label: 'اعلان ها', icon: Bell },
  ];

  const links = isStudent ? studentLinks : coachLinks;
  const homePath = isStudent ? '/athlete/exercises' : '/coach/athletes';

  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-950 dark:bg-slate-950 dark:text-white md:pb-0">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button className="flex items-center gap-3 text-right" onClick={() => navigate(homePath)}>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700 text-white">
              <Dumbbell className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">Bahman Coach</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{user?.fullName}</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="h-11 w-11 px-0"
              disabled={logout.isPending}
              onClick={() => {
                logout.mutate(undefined, {
                  onSettled: () => navigate('/'),
                });
              }}
              aria-label="خروج"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-20 space-y-2">
            {links.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </aside>
        <Outlet />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:hidden" style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}>
        {links.map((item) => (
          <NavItem key={item.to} compact {...item} />
        ))}
      </nav>
    </main>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  compact,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  compact?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition md:justify-start ${
          isActive
            ? 'bg-teal-700 text-white dark:bg-teal-500'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
        } ${compact ? 'rounded-none py-2' : ''}`
      }
    >
      <Icon className="h-5 w-5" />
      <span className={compact ? 'text-xs' : ''}>{label}</span>
    </NavLink>
  );
}
