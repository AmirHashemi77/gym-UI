import { clearAuthSession, http, publicHttp, tokenStorage, unwrapResponse } from './http';
import type {
  ApiResponse,
  AuthResponse,
  AuthUser,
  ChangePasswordRequest,
  CreateStudentRequest,
  LoginRequest,
  RefreshTokenRequest,
  Student,
} from './types';

const persistAuthResponse = (response: ApiResponse<AuthResponse>) => {
  tokenStorage.setTokens(response.data);
  return response;
};

export const authService = {
  login: async (payload: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await publicHttp.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return persistAuthResponse(unwrapResponse(response));
  },

  registerStudent: async (payload: CreateStudentRequest): Promise<ApiResponse<Student>> => {
    const response = await publicHttp.post<ApiResponse<Student>>('/auth/register-student', payload);
    return unwrapResponse(response);
  },

  refreshToken: async (payload: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await publicHttp.post<ApiResponse<AuthResponse>>('/auth/refresh-token', payload);
    return persistAuthResponse(unwrapResponse(response));
  },

  logout: async (payload?: RefreshTokenRequest): Promise<ApiResponse<null>> => {
    const requestPayload = payload ?? { refreshToken: tokenStorage.getRefreshToken() ?? '' };

    try {
      const response = await http.post<ApiResponse<null>>('/auth/logout', requestPayload);
      return unwrapResponse(response);
    } finally {
      clearAuthSession();
    }
  },

  getProfile: async (): Promise<ApiResponse<AuthUser>> => {
    const response = await http.get<ApiResponse<AuthUser>>('/auth/profile');
    return unwrapResponse(response);
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await http.post<ApiResponse<null>>('/auth/change-password', payload);
    return unwrapResponse(response);
  },
};
