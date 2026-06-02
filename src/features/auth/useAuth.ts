import { tokenStorage } from '../../api/http';
import { useAuthStore } from './auth.store';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isAuthenticated: Boolean(user && tokenStorage.getAccessToken()),
  };
};
