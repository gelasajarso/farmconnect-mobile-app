// ─── Roles & Enums ───────────────────────────────────────────────────────────

export type UserRole = 'FARMER' | 'MERCHANT' | 'DELIVERY' | 'ADMIN' | 'MANAGER' | 'AGENT';

export type Category = 'GRAINS' | 'VEGETABLES' | 'FRUITS' | 'DAIRY' | 'MEAT' | 'SPICES' | 'OTHER';

export type Unit = 'KG' | 'TON' | 'LITER' | 'UNIT' | 'CRATE' | 'BAG';

export type QualityGrade = 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'PREMIUM' | 'STANDARD';

export type ProductStatus = 'AVAILABLE' | 'LOW_STOCK' | 'SOLD_OUT' | 'EXPIRED' | 'DISCONTINUED';

export type OrderStatus =
  | 'CREATED'
  | 'PENDING_PAYMENT'
  | 'FUNDED'
  | 'CONFIRMED'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type DeliveryStatus =
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;       // keycloak_id — Keycloak sub UUID
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: LoginUser;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenInfoResponse {
  valid: boolean;
  user_id: string | null;       // keycloak_id — NOT system_user_id
  username: string | null;
  email: string | null;
  roles: string[];
  is_service_account: boolean;
  expires_at: number | null;    // Unix timestamp
}

// ─── Auth Context ─────────────────────────────────────────────────────────────

export interface AuthUser {
  keycloak_id: string;           // from LoginResponse.user.id (Keycloak sub UUID)
  email: string;
  name: string;
  role: UserRole;
  system_user_id: string | null; // lazily resolved from domain responses (e.g. FAR-00001)
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resolveSystemUserId: (id: string) => Promise<void>;
  updateProfile: (updates: { name: string; email: string }) => Promise<void>;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface CatalogFarmer {
  id: string;           // system_user_id (e.g. FAR-00001)
  name: string | null;
  farm_region: string | null;
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  category: Category;
  base_price: number;
  currency: string;
  total_quantity: number;
  quality_grade: QualityGrade | null;
  is_active: boolean;
  harvest_date: string | null;
  farmer: CatalogFarmer | null;
}

export interface ProductLocation {
  latitude: number | null;
  longitude: number | null;
}

export interface ProductPublicDTO {
  id: string;
  farmer_id: string;            // system_user_id
  name: string;
  description: string | null;
  category: Category;
  unit: Unit;
  base_price: number;
  currency: string;
  total_quantity: number;
  reserved_quantity: number;
  sold_quantity: number;
  spoiled_quantity: number;
  quantity_available: number | null;
  quality_grade: QualityGrade | null;
  harvest_date: string | null;
  expiry_date: string | null;
  location: ProductLocation | null;
  images: string[] | null;
  is_active: boolean;
  status: ProductStatus | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown> | null;
}

export interface ProductCreate {
  farmer_id: string;            // system_user_id
  name: string;
  description?: string;
  category: Category;
  unit: Unit;
  base_price: number;
  currency: string;
  total_quantity: number;
  quality_grade?: QualityGrade;
  harvest_date?: string;
  expiry_date?: string;
  is_active: boolean;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderDTO {
  id: string;
  farmer_id: string;            // system_user_id
  merchant_id: string;          // system_user_id
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
}

export interface OrderCreate {
  farmer_id: string;            // from product.farmer_id (system_user_id)
  merchant_id: string;          // from Auth_Context.system_user_id
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface EscrowDTO {
  id: string;
  order_id: string;
  amount: number;
  status: string;
}

export interface OrderEscrowPair {
  order: OrderDTO;
  escrow: EscrowDTO;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotifType = 'order' | 'delivery' | 'product' | 'system';

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: string;   // ISO 8601, e.g. "2026-04-11T11:00:00Z"
  read: boolean;
}

export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  base_price?: number;
  total_quantity?: number;
  quality_grade?: QualityGrade;
  harvest_date?: string;
  expiry_date?: string;
  is_active?: boolean;
}

export interface DeliveryStatusUpdate {
  status: DeliveryStatus;
  notes?: string;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  system_user_id: string | null;
  created_at: string;
  is_active: boolean;
}

// ─── Delivery ─────────────────────────────────────────────────────────────────

export interface DeliveryResponse {
  id: string;
  order_id: string;
  carrier_id: string;
  status: DeliveryStatus;
  pickup_time: string | null;
  delivered_time: string | null;
  pickup_photo_url: string | null;
  delivery_photo_url: string | null;
  recipient_signature_url: string | null;
  notes: string | null;
}
