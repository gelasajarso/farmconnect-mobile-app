import {
  mockGetAllUsers,
  mockGetAllProducts,
  mockGetAllOrders,
  mockGetAllDeliveries,
  mockToggleUserActive,
} from '../mock/mockServices';
import type { AdminUser, ProductPublicDTO, OrderDTO, DeliveryResponse } from '../types';

// All admin calls go through mock for now — swap to api.get/post when backend is ready

export async function getAllUsers(): Promise<AdminUser[]> {
  return mockGetAllUsers();
}

export async function getAllProducts(): Promise<ProductPublicDTO[]> {
  return mockGetAllProducts();
}

export async function getAllOrders(): Promise<OrderDTO[]> {
  return mockGetAllOrders();
}

export async function getAllDeliveries(): Promise<DeliveryResponse[]> {
  return mockGetAllDeliveries();
}

export async function toggleUserActive(userId: string): Promise<AdminUser> {
  return mockToggleUserActive(userId);
}
