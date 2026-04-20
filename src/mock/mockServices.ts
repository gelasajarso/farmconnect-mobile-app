/**
 * Mock service implementations — drop-in replacements for real API calls.
 * Simulates network latency with a small delay.
 */

import type {
  LoginResponse,
  CatalogItem,
  ProductPublicDTO,
  ProductCreate,
  ProductUpdate,
  OrderDTO,
  OrderStatus,
  OrderCreate,
  OrderEscrowPair,
  DeliveryResponse,
  DeliveryStatusUpdate,
  UserRole,
  AdminUser,
} from "../types";
import {
  MOCK_USERS,
  MOCK_PASSWORD,
  MOCK_SYSTEM_USER_IDS,
  MOCK_CATALOG,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_DELIVERIES,
  MOCK_ADMIN_USERS,
} from "./data";

// In-memory store so mutations persist within a session
let products = [...MOCK_PRODUCTS];
let orders = [...MOCK_ORDERS];
let deliveries = [...MOCK_DELIVERIES];
let adminUsers = [...MOCK_ADMIN_USERS];

function delay(ms = 400): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function mockLogin(
  email: string,
  password: string,
): Promise<LoginResponse & { _mock_system_user_id?: string }> {
  await delay();
  const user = MOCK_USERS[email.toLowerCase()];
  if (!user || password !== MOCK_PASSWORD) {
    const err: any = new Error("Invalid credentials");
    err.response = { status: 401, data: { detail: "Invalid credentials" } };
    throw err;
  }
  return {
    ...user,
    _mock_system_user_id: MOCK_SYSTEM_USER_IDS[user.user.id] ?? undefined,
  };
}

export async function mockSignup(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<void> {
  await delay(600);
  const key = email.toLowerCase();
  if (MOCK_USERS[key]) {
    const err: any = new Error("Email already registered");
    err.response = {
      status: 409,
      data: { detail: "Email already registered" },
    };
    throw err;
  }
  const id = `kc-${role.toLowerCase()}-${Date.now()}`;
  MOCK_USERS[key] = {
    access_token: `mock-access-${id}`,
    refresh_token: `mock-refresh-${id}`,
    token_type: "Bearer",
    expires_in: 3600,
    user: { id, email: key, name, role },
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function mockGetCatalog(): Promise<CatalogItem[]> {
  await delay();
  return [...MOCK_CATALOG];
}

export async function mockGetProduct(
  productId: string,
): Promise<ProductPublicDTO> {
  await delay();
  const p = products.find((x) => x.id === productId);
  if (!p) {
    const err: any = new Error("Product not found");
    err.response = { status: 404, data: { detail: "Not found" } };
    throw err;
  }
  return { ...p };
}

export async function mockGetFarmerProducts(
  farmerId: string,
): Promise<ProductPublicDTO[]> {
  await delay();
  return products
    .filter((p) => p.farmer_id === farmerId)
    .map((p) => ({ ...p }));
}

export async function mockCreateProduct(
  data: ProductCreate,
): Promise<ProductPublicDTO> {
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
    status: data.is_active ? "AVAILABLE" : "DISCONTINUED",
    created_at: now,
    updated_at: now,
    metadata: null,
  };
  products = [newProduct, ...products];
  return { ...newProduct };
}

export async function mockUpdateProduct(
  productId: string,
  farmerId: string,
  data: ProductUpdate,
): Promise<ProductPublicDTO> {
  await delay(500);
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) {
    const err: any = new Error("Product not found");
    err.response = { status: 404, data: { detail: "Not found" } };
    throw err;
  }
  if (products[idx].farmer_id !== farmerId) {
    const err: any = new Error("Forbidden");
    err.response = { status: 403, data: { detail: "Not your product" } };
    throw err;
  }
  const updated: ProductPublicDTO = {
    ...products[idx],
    ...data,
    updated_at: new Date().toISOString(),
    status:
      data.is_active === false
        ? "DISCONTINUED"
        : (data.total_quantity ?? products[idx].total_quantity) === 0
          ? "SOLD_OUT"
          : products[idx].status,
  };
  products = products.map((p) => (p.id === productId ? updated : p));
  return { ...updated };
}

export async function mockDeleteProduct(
  productId: string,
  farmerId: string,
): Promise<void> {
  await delay(400);
  const p = products.find((p) => p.id === productId);
  if (!p) {
    const err: any = new Error("Product not found");
    err.response = { status: 404, data: { detail: "Not found" } };
    throw err;
  }
  if (p.farmer_id !== farmerId) {
    const err: any = new Error("Forbidden");
    err.response = { status: 403, data: { detail: "Not your product" } };
    throw err;
  }
  products = products.filter((p) => p.id !== productId);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function mockGetOrders(): Promise<OrderDTO[]> {
  await delay();
  return [...orders];
}

export async function mockGetOrderById(orderId: string): Promise<OrderDTO> {
  await delay();
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    const err: any = new Error("Order not found");
    err.response = { status: 404, data: { detail: "Not found" } };
    throw err;
  }
  return { ...order };
}

export async function mockCreateOrder(
  data: OrderCreate,
): Promise<OrderEscrowPair> {
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
    status: "CREATED",
    created_at: now,
  };
  orders = [newOrder, ...orders];
  return {
    order: { ...newOrder },
    escrow: {
      id: `esc-${uuid().slice(0, 8)}`,
      order_id: newOrder.id,
      amount: newOrder.total_price,
      status: "PENDING",
    },
  };
}

export async function mockCancelOrder(
  orderId: string,
  merchantId: string,
): Promise<OrderDTO> {
  await delay(400);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) {
    const err: any = new Error("Order not found");
    err.response = { status: 404, data: { detail: "Not found" } };
    throw err;
  }
  if (orders[idx].merchant_id !== merchantId) {
    const err: any = new Error("Forbidden");
    err.response = { status: 403, data: { detail: "Not your order" } };
    throw err;
  }
  const cancellable: OrderStatus[] = ["CREATED", "PENDING_PAYMENT"];
  if (!cancellable.includes(orders[idx].status)) {
    const err: any = new Error("Order cannot be cancelled at this stage");
    err.response = { status: 409, data: { detail: "Cannot cancel" } };
    throw err;
  }
  const updated = { ...orders[idx], status: "CANCELLED" as OrderStatus };
  orders = orders.map((o) => (o.id === orderId ? updated : o));
  return { ...updated };
}

// ─── Deliveries ───────────────────────────────────────────────────────────────

export async function mockGetMyAssignments(): Promise<DeliveryResponse[]> {
  await delay();
  return [...deliveries];
}

export async function mockUpdateDeliveryStatus(
  deliveryId: string,
  carrierId: string,
  update: DeliveryStatusUpdate,
): Promise<DeliveryResponse> {
  await delay(500);
  const idx = deliveries.findIndex((d) => d.id === deliveryId);
  if (idx === -1) {
    const err: any = new Error("Delivery not found");
    err.response = { status: 404, data: { detail: "Not found" } };
    throw err;
  }
  if (deliveries[idx].carrier_id !== carrierId) {
    const err: any = new Error("Forbidden");
    err.response = { status: 403, data: { detail: "Not your assignment" } };
    throw err;
  }
  const now = new Date().toISOString();
  const updated: DeliveryResponse = {
    ...deliveries[idx],
    status: update.status,
    notes: update.notes ?? deliveries[idx].notes,
    pickup_time:
      update.status === "PICKED_UP" ? now : deliveries[idx].pickup_time,
    delivered_time:
      update.status === "DELIVERED" ? now : deliveries[idx].delivered_time,
  };
  deliveries = deliveries.map((d) => (d.id === deliveryId ? updated : d));
  return { ...updated };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function mockGetAllUsers(): Promise<AdminUser[]> {
  await delay();
  return [...adminUsers];
}

export async function mockGetAllProducts(): Promise<ProductPublicDTO[]> {
  await delay();
  return [...products];
}

export async function mockGetAllOrders(): Promise<OrderDTO[]> {
  await delay();
  return [...orders];
}

export async function mockGetAllDeliveries(): Promise<DeliveryResponse[]> {
  await delay();
  return [...deliveries];
}

export async function mockToggleUserActive(userId: string): Promise<AdminUser> {
  await delay(400);
  const idx = adminUsers.findIndex((u) => u.id === userId);
  if (idx === -1) {
    const err: any = new Error("User not found");
    err.response = { status: 404, data: { detail: "Not found" } };
    throw err;
  }
  const updated = { ...adminUsers[idx], is_active: !adminUsers[idx].is_active };
  adminUsers = adminUsers.map((u) => (u.id === userId ? updated : u));
  return { ...updated };
}
