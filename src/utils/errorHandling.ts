import axios from 'axios';

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const detail =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      undefined;
    return {
      status,
      message: detail ?? error.message ?? 'An unexpected error occurred.',
      detail,
    };
  }
  return {
    status: 0,
    message: 'Network error. Please check your connection.',
  };
}
