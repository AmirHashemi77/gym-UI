import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../../api/types';
import { useAuth } from './useAuth';

export function RoleGuard({ roles }: { roles: Role[] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
