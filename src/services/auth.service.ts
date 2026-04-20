import api from "./api";
import { USE_MOCK } from "../mock";
import { mockLogin } from "../mock/mockServices";
import type {
  LoginResponse,
  RefreshTokenResponse,
  TokenInfoResponse,
} from "../types";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  if (USE_MOCK) return mockLogin(email, password);
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function refreshToken(
  refresh_token: string,
): Promise<RefreshTokenResponse> {
  const { data } = await api.post<RefreshTokenResponse>("/auth/refresh", {
    refresh_token,
  });
  return data;
}

export async function getMe(): Promise<TokenInfoResponse> {
  const { data } = await api.get<TokenInfoResponse>("/auth/me");
  return data;
}

export async function sendOtp(email: string): Promise<{ message: string }> {
  if (USE_MOCK) {
    // Mock: simulate sending OTP
    await new Promise((r) => setTimeout(r, 800));
    return { message: "OTP sent to your email" };
  }
  const { data } = await api.post("/auth/send-otp", { email });
  return data;
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<{ token: string }> {
  if (USE_MOCK) {
    // Mock: accept any 6-digit OTP
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      await new Promise((r) => setTimeout(r, 500));
      return { token: "mock-reset-token" };
    }
    throw new Error("Invalid OTP");
  }
  const { data } = await api.post("/auth/verify-otp", { email, otp });
  return data;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  if (USE_MOCK) {
    // Mock: simulate password reset
    await new Promise((r) => setTimeout(r, 500));
    return { message: "Password reset successfully" };
  }
  const { data } = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return data;
}
