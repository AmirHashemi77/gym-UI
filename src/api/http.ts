import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../features/auth/auth.store';
import type { ApiErrorResponse, ApiResponse, AuthResponse, RefreshTokenRequest, Role } from './types';

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredApiBaseUrl && configuredApiBaseUrl.length > 0
  ? configuredApiBaseUrl
  : '/api/v1'
).replace(/\/$/, '');

export const MEDIA_BASE_URL = API_BASE_URL.endsWith('/api/v1') ? API_BASE_URL.slice(0, -'/api/v1'.length) : '';

export const getMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${MEDIA_BASE_URL}${path}`;
  return `${MEDIA_BASE_URL}/${path}`;
};

export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

type JwtPayload = {
  sub: string;
  phone: string;
  role: Role;
  iat: number;
  exp: number;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padding);
  const binary = globalThis.atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

export const decodeJwtPayload = (token: string | null): JwtPayload | null => {
  if (!token) return null;

  try {
    const [, payload] = token.split('.');

    if (!payload) return null;

    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
};

export const isJwtExpired = (payload: Pick<JwtPayload, 'exp'> | null) => {
  if (!payload?.exp) return true;

  return payload.exp <= Math.floor(Date.now() / 1000);
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;

  const authPaths = ['/', '/login', '/register', '/coach-login'];
  if (!authPaths.includes(window.location.pathname)) {
    window.location.assign('/login');
  }
};

export const tokenStorage = {
  getAccessToken: () => (canUseStorage() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null),
  getRefreshToken: () => (canUseStorage() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  setTokens: (tokens: Pick<AuthResponse, 'accessToken' | 'refreshToken'>) => {
    if (!canUseStorage()) return;

    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clearTokens: () => {
    if (!canUseStorage()) return;

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const clearAuthSession = () => {
  tokenStorage.clearTokens();
  useAuthStore.getState().clearUser();
};

export const getAccessTokenPayload = () => decodeJwtPayload(tokenStorage.getAccessToken());

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

export const publicHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

let refreshRequest: Promise<AuthResponse> | null = null;

const refreshTokens = async () => {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    clearAuthSession();
    throw new Error('Refresh token is missing.');
  }

  refreshRequest ??= publicHttp
    .post<RefreshTokenRequest, AxiosResponse<ApiResponse<AuthResponse>>>('/auth/refresh-token', { refreshToken })
    .then((response) => {
      tokenStorage.setTokens(response.data.data);
      useAuthStore.getState().setUser(response.data.data.user);
      return response.data.data;
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
};

http.interceptors.request.use(async (config) => {
  let accessToken = tokenStorage.getAccessToken();

  if (!accessToken) {
    return config;
  }

  if (isJwtExpired(decodeJwtPayload(accessToken))) {
    try {
      const tokens = await refreshTokens();
      accessToken = tokens.accessToken;
    } catch (refreshError) {
      clearAuthSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }

  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const tokens = await refreshTokens();
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;

      return http(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);

export const unwrapResponse = <T>(response: AxiosResponse<ApiResponse<T>>) => response.data;

export const getApiError = (error: unknown): ApiErrorResponse | null => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data ?? null;
  }

  return null;
};

export const getApiErrorMessage = (error: unknown, fallback = 'خطایی رخ داد.') => {
  const apiError = getApiError(error);

  if (apiError?.message) return apiError.message;
  if (error instanceof Error && error.message) return error.message;

  return fallback;
};
