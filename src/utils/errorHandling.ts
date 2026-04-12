import axios from 'axios';
import { API_BASE_URL } from '../services/api';

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const isNetworkError =
      error.code === 'ERR_NETWORK' ||
      (!error.response &&
        (error.message?.toLowerCase().includes('network') ?? false));

    // Timeout: Axios sets code to 'ECONNABORTED' or the message contains 'timeout'
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      (error.message?.toLowerCase().includes('timeout') ?? false);

    if (isNetworkError) {
      return {
        status: 0,
        message: `Cannot reach the API server at ${API_BASE_URL}.`,
      };
    }

    if (isTimeout) {
      return {
        status: 0,
        message: `Request to ${API_BASE_URL} timed out.`,
      };
    }

    const status = error.response?.status ?? 0;
    // Extract a human-readable detail from the response body
    const detail: string | undefined =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      undefined;

    // Use body detail if available; otherwise a generic fallback (never raw stack)
    const message = detail ?? 'An unexpected error occurred. Please try again.';

    return { status, message, detail };
  }

  // Non-Axios errors (e.g. network unreachable) — never surface raw stack traces
  return {
    status: 0,
    message: `Cannot reach the API server at ${API_BASE_URL}.`,
  };
}
