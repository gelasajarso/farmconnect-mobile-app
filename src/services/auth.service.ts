import api from "./api";
import { USE_MOCK } from "../mock";
import { mockLogin } from "../mock/mockServices";
import type {
  LoginResponse,
  RefreshTokenResponse,
  TokenInfoResponse,
} from "../types";

export async function login(
  emailOrPhone: string,
  password: string,
): Promise<LoginResponse> {
  if (USE_MOCK) return mockLogin(emailOrPhone, password);
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email_or_phone: emailOrPhone,
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

export async function verifyResetOtp(
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

// ─── Signup & OTP Verification ────────────────────────────────────────────────

export interface SignupPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: "farmer" | "merchant" | "delivery";
  preferred_verification_method: "email" | "phone";
}

export interface SignupResponse {
  user_id: string;
  email: string;
  role: string;
  onboarding_status: string;
  requires_verification: boolean;
  verification_method: string;
  message: string;
}

export interface VerifyOtpPayload {
  user_id: string;
  code: string;
  method: string;
}

export async function signup(payload: SignupPayload): Promise<SignupResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      user_id: "mock-user-id",
      email: payload.email ?? "",
      role: payload.role,
      onboarding_status: "PENDING_VERIFICATION",
      requires_verification: true,
      verification_method: payload.preferred_verification_method,
      message: "Account created. Please verify your account.",
    };
  }
  const { data } = await api.post<SignupResponse>("/auth/signup", payload);
  return data;
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<LoginResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return mockLogin("mock@example.com", "password");
  }
  const { data } = await api.post<LoginResponse>("/auth/verify", payload);
  return data;
}

export async function resendOtp(
  userId: string,
  method: string,
): Promise<{ message: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return { message: "OTP resent successfully" };
  }
  const { data } = await api.post<{ message: string }>(
    "/users/verify/resend",
    { user_id: userId, method },
  );
  return data;
}
