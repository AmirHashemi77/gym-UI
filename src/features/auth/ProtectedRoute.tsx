import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { tokenStorage } from '../../api/http';
import { useProfile } from '../../hooks/auth';
import { useAuth } from './useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const hasToken = Boolean(tokenStorage.getAccessToken());
  const profile = useProfile();

  if (!isAuthenticated && hasToken && profile.isLoading) {
    return <div className="p-6 text-center text-sm text-slate-500">در حال بررسی نشست...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
