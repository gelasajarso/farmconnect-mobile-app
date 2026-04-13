/**
 * Mock service implementations — drop-in replacements for real API calls.
 * Simulates network latency with a small delay.
 */

import type {
  LoginResponse,
  CatalogItem,
  ProductPublicDTO,
  ProductCreate,
  OrderDTO,
  OrderCreate,
  OrderEscrowPair,
  DeliveryResponse,
} from '../types';
import {
  MOCK_USERS,
  MOCK_PASSWORD,
  MOCK_SYSTEM_USER_IDS,
  MOCK_CATALOG,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_DELIVERIES,
} from './data';

// In-memory store so mutations persist within a session
let products = [...MOCK_PRODUCTS];
let orders = [...MOCK_ORDERS];

function delay(ms = 400): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function mockLogin(email: string, password: string): Promise<LoginResponse & { _mock_system_user_id?: string }> {
  await delay();
  const user = MOCK_USERS[email.toLowerCase()];
  if (!user || password !== MOCK_PASSWORD) {
    const err: any = new Error('Invalid credentials');
    err.response = { status: 401, data: { detail: 'Invalid credentials' } };
    throw err;
  }
  return {
    ...user,
    _mock_system_user_id: MOCK_SYSTEM_USER_IDS[user.user.id] ?? undefined,
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function mockGetCatalog(): Promise<CatalogItem[]> {
  await delay();
  return [...MOCK_CATALOG];
}

export async function mockGetProduct(productId: string): Promise<ProductPublicDTO> {
  await delay();
  const p = products.find((x) => x.id === productId);
  if (!p) {
    const err: any = new Error('Product not found');
    err.response = { status: 404, data: { detail: 'Not found' } };
    throw err;
  }
  return { ...p };
}

export async function mockGetFarmerProducts(farmerId: string): Promise<ProductPublicDTO[]> {
  await delay();
  return products.filter((p) => p.farmer_id === farmerId).map((p) => ({ ...p }));
}

export async function mockCreateProduct(data: ProductCreate): Promise<ProductPublicDTO> {
  await delay(600);
  const now = new Date().toISOString();
  const newProduct: ProductPublicDTO = {
    id: `prod-${uuid().slice(0, 8)}`,
    farmer_id: data.farmer_id,
    name: data.name,
    description: data.description ?? null,
    category: data.category,
    unit: data.unit,
    base_price: data.base_price,
    currency: data.currency,
    total_quantity: data.total_quantity,
    reserved_quantity: 0,
    sold_quantity: 0,
    spoiled_quantity: 0,
    quantity_available: data.total_quantity,
    quality_grade: data.quality_grade ?? null,
    harvest_date: data.harvest_date ?? null,
    expiry_date: data.expiry_date ?? null,
    location: null,
    images: null,
    is_active: data.is_active,
    status: data.is_active ? 'AVAILABLE' : 'DISCONTINUED',
    created_at: now,
    updated_at: now,
    metadata: null,
  };
  products = [newProduct, ...products];
  return { ...newProduct };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function mockGetOrders(): Promise<OrderDTO[]> {
  await delay();
  return [...orders];
}

export async function mockCreateOrder(data: OrderCreate): Promise<OrderEscrowPair> {
  await delay(600);
  const now = new Date().toISOString();
  const newOrder: OrderDTO = {
    id: `ord-${uuid().slice(0, 8)}`,
    farmer_id: data.farmer_id,
    merchant_id: data.merchant_id,
    product_id: data.product_id,
    quantity: data.quantity,
    unit_price: data.unit_price,
    total_price: data.quantity * data.unit_price,
    status: 'CREATED',
    created_at: now,
  };
  orders = [newOrder, ...orders];
  return {
    order: { ...newOrder },
    escrow: {
      id: `esc-${uuid().slice(0, 8)}`,
      order_id: newOrder.id,
      amount: newOrder.total_price,
      status: 'PENDING',
    },
  };
}

// ─── Deliveries ───────────────────────────────────────────────────────────────

export async function mockGetMyAssignments(): Promise<DeliveryResponse[]> {
  await delay();
  return [...MOCK_DELIVERIES];
}

// ─── Signup ───────────────────────────────────────────────────────────────────

import type { UserRole } from '../types';

export async function mockSignup(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<void> {
  await delay(600);
  const key = email.toLowerCase();
  if (MOCK_USERS[key]) {
    const err: any = new Error('Email already registered');
    err.response = { status: 409, data: { detail: 'Email already registered' } };
    throw err;
  }
  const id = `kc-${role.toLowerCase()}-${Date.now()}`;
  MOCK_USERS[key] = {
    access_token: `mock-access-${id}`,
    refresh_token: `mock-refresh-${id}`,
    token_type: 'Bearer',
    expires_in: 3600,
    user: { id, email: key, name, role },
  };
}
