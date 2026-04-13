import api from './api';
import { USE_MOCK } from '../mock';
import { mockGetMyAssignments } from '../mock/mockServices';
import type { DeliveryResponse } from '../types';

export async function getMyAssignments(): Promise<DeliveryResponse[]> {
  if (USE_MOCK) return mockGetMyAssignments();
  const { data } = await api.get<DeliveryResponse[]>('/delivery/my-assignments');
  return data;
}
