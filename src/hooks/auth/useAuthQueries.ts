import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../api/auth.service';
import { tokenStorage } from '../../api/http';
import type { ChangePasswordRequest, CreateStudentRequest, LoginRequest, RefreshTokenRequest } from '../../api/types';
import { useAuthStore } from '../../features/auth/auth.store';
import { useToastStore } from '../../stores/useToastStore';
import { queryKeys } from '../queryKeys';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (response) => {
      useToastStore.getState().showSuccess(response.message || 'ورود شما با موفقیت انجام شد.');
      setUser(response.data.user);
      queryClient.setQueryData(queryKeys.auth.profile, {
        success: response.success,
        message: response.message,
        data: response.data.user,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

export const useRegisterStudent = () =>
  useMutation({
    mutationFn: (payload: CreateStudentRequest) => authService.registerStudent(payload),
    onSuccess: (response) => {
      useToastStore.getState().showSuccess(response.message || 'ثبت‌نام شما با موفقیت تکمیل شد.');
    },
  });

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: (payload?: RefreshTokenRequest) => authService.logout(payload),
    onSettled: () => {
      clearUser();
      queryClient.clear();
    },
  });
};

export const useProfile = () =>
  useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: authService.getProfile,
    enabled: Boolean(tokenStorage.getAccessToken()),
    retry: false,
  });

export const useRefreshToken = () =>
  useMutation({
    mutationFn: (payload: RefreshTokenRequest) => authService.refreshToken(payload),
    onSuccess: (response) => {
      useAuthStore.getState().setUser(response.data.user);
    },
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordRequest) => authService.changePassword(payload),
  });
