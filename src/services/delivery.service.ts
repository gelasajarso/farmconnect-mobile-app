import api from './api';
import { USE_MOCK } from '../mock';
import { mockGetMyAssignments, mockUpdateDeliveryStatus } from '../mock/mockServices';
import type { DeliveryResponse, DeliveryStatusUpdate } from '../types';

export async function getMyAssignments(): Promise<DeliveryResponse[]> {
  if (USE_MOCK) return mockGetMyAssignments();
  const { data } = await api.get<DeliveryResponse[]>('/delivery/my-assignments');
  return data;
}

/** Delivery agent only — ownership enforced in mock and backend */
export async function updateDeliveryStatus(
  deliveryId: string,
  carrierId: string,
  update: DeliveryStatusUpdate,
): Promise<DeliveryResponse> {
  if (USE_MOCK) return mockUpdateDeliveryStatus(deliveryId, carrierId, update);
  const { data } = await api.patch<DeliveryResponse>(`/delivery/${deliveryId}/status`, update);
  return data;
}
