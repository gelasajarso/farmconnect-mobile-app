# Design Document: FarmConnect Mobile App

## Overview

FarmConnect is a React Native (Expo) mobile application that serves as an agricultural marketplace. It connects four user roles — Farmers, Merchants, Delivery Agents, and Admins — on a single platform backed by a REST API secured with JWT (Keycloak).

The existing codebase already has a working foundation: authentication with JWT + refresh token, role-based navigation, product catalog browsing, product detail with order placement, farmer product management, merchant order history, and delivery assignment views. This design formalizes the architecture of that foundation and specifies the remaining hardening work: token refresh interceptor, form validation, serialization correctness, and resilient error handling.

### Key Design Goals

- **Security**: All tokens stored exclusively in `expo-secure-store` (encrypted at rest).
- **Resilience**: Automatic token refresh on 401; graceful degradation on network failure.
- **Role isolation**: Navigation structure is determined entirely by the authenticated user's role.
- **Correctness**: Form validation and data serialization are formally specified and property-tested.

---

## Architecture

The app follows a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     React Native UI                      │
│  Screens / Components / Navigation                       │
└────────────────────────┬────────────────────────────────┘
                         │ hooks (useProducts, useOrders…)
┌────────────────────────▼────────────────────────────────┐
│                   Application Layer                      │
│  AuthContext  │  Custom Hooks  │  Validation Logic       │
└────────────────────────┬────────────────────────────────┘
                         │ service calls
┌────────────────────────▼────────────────────────────────┐
│                    Service Layer                         │
│  api.ts (Axios + interceptors)                           │
│  auth.service  │  product.service  │  order.service      │
│  delivery.service                                        │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────┐
│                   Backend REST API                       │
│  EXPO_PUBLIC_API_URL  (FastAPI / Keycloak)               │
└─────────────────────────────────────────────────────────┘
```

### Navigation Architecture

```
RootNavigator (NavigationContainer)
├── AuthNavigator (unauthenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── AppNavigator (authenticated, role-gated)
    ├── FarmerNavigator (FARMER)
    │   ├── HomeStack → ProductList → ProductDetail
    │   └── FarmerProductsStack → FarmerProductsList → AddProduct
    ├── MerchantNavigator (MERCHANT)
    │   ├── HomeStack → ProductList → ProductDetail
    │   └── MerchantOrders
    ├── DeliveryNavigator (DELIVERY)
    │   ├── HomeStack → ProductList → ProductDetail
    │   └── DeliveryAssignments
    └── AdminNavigator (ADMIN | MANAGER | AGENT)
        ├── HomeStack → ProductList → ProductDetail
        └── AdminPlaceholder
```

---

## Components and Interfaces

### AuthContext

Provides session state to the entire component tree.

```typescript
interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  resolveSystemUserId(id: string): Promise<void>;
}
```

**Responsibilities:**
- Hydrate session from `SecureStore` on app launch.
- Expose `login` / `logout` actions.
- Lazily resolve and cache `system_user_id` once a domain response provides it.

### API Client (`src/services/api.ts`)

Axios instance with two interceptors:

1. **Request interceptor** — attaches `Authorization: Bearer <access_token>` to every request.
2. **Response interceptor** — on HTTP 401 (first attempt only), calls `POST /auth/refresh`, stores the new token pair, and retries the original request. If refresh fails, clears all tokens and navigates to Login.

Timeout is set to **15 seconds** for all requests.

### Service Layer

| Service | Endpoints |
|---|---|
| `auth.service` | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
| `product.service` | `GET /products/catalog`, `GET /products/{id}`, `GET /products/farmer/{id}`, `POST /products` |
| `order.service` | `GET /orders`, `POST /orders` |
| `delivery.service` | `GET /delivery/my-assignments` |

### Custom Hooks

Each hook encapsulates fetch lifecycle (`loading`, `error`, `refetch`):

- `useCatalog()` — fetches `GET /products/catalog`
- `useProductDetail(productId)` — fetches `GET /products/{productId}`
- `useFarmerProducts(farmerId | null)` — fetches `GET /products/farmer/{farmerId}`; skips if `farmerId` is null
- `useOrders()` — fetches `GET /orders`
- `useDeliveries()` — fetches `GET /delivery/my-assignments`

### Serialization Utilities (`src/services/product.service.ts`)

```typescript
function serializeProductPublicDTO(dto: ProductPublicDTO): string
function parseProductPublicDTO(serialized: string): ProductPublicDTO
```

These functions implement JSON serialization/deserialization for `ProductPublicDTO`. They are the subject of the round-trip correctness property (Requirement 11).

### Shared UI Components

| Component | Purpose |
|---|---|
| `LoadingIndicator` | Full-screen spinner shown during data fetches |
| `ErrorView` | Error message + retry button |
| `EmptyState` | Placeholder when a list has no items |
| `ProductCard` | Catalog list item (name, category, price, qty, grade, farmer) |
| `OrderRow` | Order list item (product, qty, price, status, date) |
| `DeliveryRow` | Delivery list item (id, order, status, pickup/delivered times) |

---

## Data Models

### AuthUser (in-memory session)

```typescript
interface AuthUser {
  keycloak_id: string;       // Keycloak sub UUID
  email: string;
  name: string;
  role: UserRole;            // 'FARMER' | 'MERCHANT' | 'DELIVERY' | 'ADMIN' | 'MANAGER' | 'AGENT'
  system_user_id: string | null; // e.g. 'FAR-00001', lazily resolved
}
```

### SecureStore Keys

| Key | Value |
|---|---|
| `access_token` | JWT access token string |
| `refresh_token` | JWT refresh token string |
| `system_user_id` | Domain user ID (e.g. `FAR-00001`) |
| `user_profile` | JSON-serialized `{ keycloak_id, email, name, role }` |

### ProductPublicDTO

```typescript
interface ProductPublicDTO {
  id: string;
  farmer_id: string;
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
```

### OrderDTO / OrderCreate

```typescript
interface OrderDTO {
  id: string;
  farmer_id: string;
  merchant_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
  created_at: string;
}

interface OrderCreate {
  farmer_id: string;
  merchant_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}
```

### DeliveryResponse

```typescript
interface DeliveryResponse {
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
```

### Add Product Form Validation Rules

| Field | Rule |
|---|---|
| `name` | Required; 2–100 characters |
| `category` | Required; must be one of the `Category` enum values |
| `unit` | Required; must be one of the `Unit` enum values |
| `base_price` | Required; numeric; > 0 |
| `total_quantity` | Required; numeric; ≥ 0 |
| `description` | Optional |
| `quality_grade` | Optional |
| `harvest_date` | Optional; format `YYYY-MM-DD` |
| `expiry_date` | Optional; format `YYYY-MM-DD` |
| `currency` | Optional; defaults to `USD` |

