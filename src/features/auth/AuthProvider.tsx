import { useEffect, type ReactNode } from 'react';
import { tokenStorage } from '../../api/http';
import { useProfile } from '../../hooks/auth';
import { useAuthStore } from './auth.store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const profile = useProfile();

  useEffect(() => {
    if (profile.data?.data) {
      setUser(profile.data.data);
    }
  }, [profile.data, setUser]);

  useEffect(() => {
    if (!tokenStorage.getAccessToken()) {
      clearUser();
    }
  }, [clearUser]);

  return children;
}
