import api from './api';
import type { LoginResponse, RefreshTokenResponse, TokenInfoResponse } from '../types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function refreshToken(refresh_token: string): Promise<RefreshTokenResponse> {
  const { data } = await api.post<RefreshTokenResponse>('/auth/refresh', { refresh_token });
  return data;
}

export async function getMe(): Promise<TokenInfoResponse> {
  const { data } = await api.get<TokenInfoResponse>('/auth/me');
  return data;
}
