import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { createNavigationContainerRef } from '@react-navigation/native';
import {
  getAccessToken,
  getRefreshToken,
  storeTokens,
  clearTokens,
} from '../utils/tokenStorage';
import type { RefreshTokenResponse } from '../types';

// Navigation ref — attached to NavigationContainer in App.tsx
export const navigationRef = createNavigationContainerRef<any>();

function getDefaultBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }

  return 'http://localhost:8000/api/v1';
}

function normalizeBaseUrl(url?: string) {
  const trimmed = url?.trim();
  if (trimmed) {
    return trimmed;
  }

  const fallbackUrl = getDefaultBaseUrl();
  console.warn(
    `[API] EXPO_PUBLIC_API_URL is not set. Falling back to ${fallbackUrl}`
  );
  return fallbackUrl;
}

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);

console.info(`[API] Using base URL: ${API_BASE_URL}`);

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor: Attach Bearer token ─────────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: 401 → refresh → retry once ────────────────────────
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');

        // Call refresh endpoint directly (not through intercepted api instance)
        const { data } = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Store rotated tokens
        await storeTokens(data.access_token, data.refresh_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear all tokens and redirect to login
        await clearTokens();
        if (navigationRef.isReady()) {
          navigationRef.navigate('Login' as never);
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
