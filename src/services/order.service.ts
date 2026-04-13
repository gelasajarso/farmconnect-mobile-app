import api from './api';
import { USE_MOCK } from '../mock';
import { mockGetOrders, mockCreateOrder } from '../mock/mockServices';
import type { OrderDTO, OrderCreate, OrderEscrowPair } from '../types';

export async function getOrders(): Promise<OrderDTO[]> {
  if (USE_MOCK) return mockGetOrders();
  const { data } = await api.get<OrderDTO[]>('/orders');
  return data;
}

export async function createOrder(orderData: OrderCreate): Promise<OrderEscrowPair> {
  if (USE_MOCK) return mockCreateOrder(orderData);
  const { data } = await api.post<OrderEscrowPair>('/orders', orderData);
  return data;
}
