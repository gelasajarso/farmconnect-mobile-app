import api from './api';
import type { OrderDTO, OrderCreate, OrderEscrowPair } from '../types';

export async function getOrders(): Promise<OrderDTO[]> {
  const { data } = await api.get<OrderDTO[]>('/orders');
  return data;
}

export async function createOrder(orderData: OrderCreate): Promise<OrderEscrowPair> {
  const { data } = await api.post<OrderEscrowPair>('/orders', orderData);
  return data;
}
