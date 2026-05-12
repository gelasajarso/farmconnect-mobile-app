import api from './api';
import { USE_MOCK } from '../mock';

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_BREAK';

/**
 * Get the current carrier availability status for the authenticated delivery agent.
 * GET /carriers/availability → { status: AvailabilityStatus }
 */
export async function getAvailability(): Promise<AvailabilityStatus> {
  if (USE_MOCK) return 'UNAVAILABLE';
  const { data } = await api.get<{ status: AvailabilityStatus }>('/carriers/availability');
  return data.status;
}

/**
 * Set the carrier availability status for the authenticated delivery agent.
 * POST /carriers/availability → { status: AvailabilityStatus }
 */
export async function setAvailability(status: AvailabilityStatus): Promise<AvailabilityStatus> {
  if (USE_MOCK) return status;
  const { data } = await api.post<{ status: AvailabilityStatus }>('/carriers/availability', { status });
  return data.status;
}
