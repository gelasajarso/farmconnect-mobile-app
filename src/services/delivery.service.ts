import api from './api';
import type { DeliveryResponse } from '../types';

export async function getMyAssignments(): Promise<DeliveryResponse[]> {
  const { data } = await api.get<DeliveryResponse[]>('/delivery/my-assignments');
  return data;
}
