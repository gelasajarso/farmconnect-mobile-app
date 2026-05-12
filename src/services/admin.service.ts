import api from './api';
import { USE_MOCK } from '../mock';
import {
  mockGetAllUsers,
  mockGetAllProducts,
  mockGetAllOrders,
  mockGetAllDeliveries,
  mockToggleUserActive,
} from '../mock/mockServices';
import type { AdminUser, ProductPublicDTO, OrderDTO, DeliveryResponse } from '../types';

// ─── Task 19.1: Core admin list functions ─────────────────────────────────────

export async function getAllUsers(): Promise<AdminUser[]> {
  if (USE_MOCK) return mockGetAllUsers();
  const res = await api.get<AdminUser[]>('/users/');
  return res.data;
}

export async function getAllProducts(): Promise<ProductPublicDTO[]> {
  if (USE_MOCK) return mockGetAllProducts();
  const res = await api.get<ProductPublicDTO[]>('/agri/products/');
  return res.data;
}

export async function getAllOrders(): Promise<OrderDTO[]> {
  if (USE_MOCK) return mockGetAllOrders();
  const res = await api.get<OrderDTO[]>('/orders/');
  return res.data;
}

export async function getAllDeliveries(): Promise<DeliveryResponse[]> {
  if (USE_MOCK) return mockGetAllDeliveries();
  const res = await api.get<DeliveryResponse[]>('/delivery/');
  return res.data;
}

// toggleUserActive: keep mock for now (no real endpoint confirmed)
export async function toggleUserActive(userId: string): Promise<AdminUser> {
  return mockToggleUserActive(userId);
}

// ─── Task 19.2: Approval queue ────────────────────────────────────────────────

export interface PendingApprovalUser {
  user_id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  onboarding_status: string | null;
  created_at: string | null;
}

export async function getPendingApprovals(): Promise<PendingApprovalUser[]> {
  if (USE_MOCK) {
    await new Promise(res => setTimeout(res, 400));
    return [
      {
        user_id: 'pending-001',
        name: 'Alice Farmer',
        email: 'alice@example.com',
        role: 'FARMER',
        onboarding_status: 'PENDING_REVIEW',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        user_id: 'pending-002',
        name: 'Bob Merchant',
        email: 'bob@example.com',
        role: 'MERCHANT',
        onboarding_status: 'PENDING_REVIEW',
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        user_id: 'pending-003',
        name: null,
        email: 'carol@example.com',
        role: 'DELIVERY',
        onboarding_status: 'PENDING_REVIEW',
        created_at: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
  }
  const res = await api.get<PendingApprovalUser[]>('/users/pending-approval');
  return res.data;
}

export async function approveUser(userId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise(res => setTimeout(res, 500));
    return;
  }
  await api.post(`/users/${userId}/approve`);
}

export async function rejectUser(userId: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise(res => setTimeout(res, 500));
    return;
  }
  await api.post(`/users/${userId}/reject`);
}

// ─── Task 19.3: Delivery assignment ──────────────────────────────────────────

export interface DeliveryCarrier {
  user_id: string;
  name: string;
  email: string;
  phone: string;
}

export interface AssignDeliveryPayload {
  order_id: string;
  carrier_id: string;
}

export async function getDeliveryCarriers(): Promise<DeliveryCarrier[]> {
  if (USE_MOCK) {
    await new Promise(res => setTimeout(res, 400));
    return [
      {
        user_id: 'carrier-001',
        name: 'David Carrier',
        email: 'david@delivery.com',
        phone: '+1-555-0101',
      },
      {
        user_id: 'carrier-002',
        name: 'Eva Express',
        email: 'eva@delivery.com',
        phone: '+1-555-0102',
      },
      {
        user_id: 'carrier-003',
        name: 'Frank Fast',
        email: 'frank@delivery.com',
        phone: '+1-555-0103',
      },
    ];
  }
  const res = await api.get<DeliveryCarrier[]>('/users/delivery-carriers');
  return res.data;
}

export async function assignDelivery(payload: AssignDeliveryPayload): Promise<void> {
  if (USE_MOCK) {
    await new Promise(res => setTimeout(res, 600));
    return;
  }
  await api.post('/delivery/assign', payload);
}
