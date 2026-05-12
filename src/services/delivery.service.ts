import api from './api';
import { USE_MOCK } from '../mock';
import { mockGetMyAssignments, mockUpdateDeliveryStatus } from '../mock/mockServices';
import type { DeliveryResponse, DeliveryStatusUpdate } from '../types';

export interface ActionableOrder {
  id: string;
  product_name: string | null;
  quantity: number;
  total_price: number;
  currency: string;
  status: string;
  delivery_address: string | null;
  created_at: string;
}

// GET /orders/actionable
export async function getActionableOrders(): Promise<ActionableOrder[]> {
  if (USE_MOCK) {
    return [
      {
        id: 'ord-001',
        product_name: 'Organic Tomatoes',
        quantity: 5,
        total_price: 250.0,
        currency: 'ETB',
        status: 'READY_FOR_PICKUP',
        delivery_address: '123 Bole Road, Addis Ababa',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'ord-002',
        product_name: 'Fresh Maize',
        quantity: 10,
        total_price: 400.0,
        currency: 'ETB',
        status: 'READY_FOR_PICKUP',
        delivery_address: '45 Piassa Street, Addis Ababa',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'ord-003',
        product_name: null,
        quantity: 2,
        total_price: 180.0,
        currency: 'ETB',
        status: 'READY_FOR_PICKUP',
        delivery_address: null,
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ];
  }
  const { data } = await api.get<ActionableOrder[]>('/orders/actionable');
  return data;
}

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
