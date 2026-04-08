# FarmConnect Mobile App

A role-aware Expo React Native application built for the FarmConnect agricultural marketplace. The app supports authenticated experiences for farmers, merchants, delivery agents, and administrative users.

## Key Features

- Role-based navigation flows
  - Farmer: marketplace + product management
  - Merchant: marketplace + order management
  - Delivery: marketplace + delivery assignments
  - Admin: marketplace + admin placeholder tab
- Secure authentication with token storage and refresh handling
- API-first architecture with centralized Axios instance
- Expo-managed React Native project with TypeScript support
- Modular screen, hook, service, and utility structure

## Architecture Overview

### Core layers

- `App.tsx`
  - Wraps the app in the `AuthProvider`
  - Renders the root navigator
- `src/context/AuthContext.tsx`
  - Manages auth state across the app
  - Hydrates stored tokens and profile data
  - Exposes `login`, `logout`, and `resolveSystemUserId`
- `src/navigation/RootNavigator.tsx`
  - Decides whether to show authentication or app navigation
  - Displays a global loading state while auth is being restored
- `src/navigation/AppNavigator.tsx`
  - Exposes role-specific bottom tab navigators
  - Includes nested stacks for marketplace and domain-specific actions

### API integration

- `src/services/api.ts`
  - Axios client with base URL fallback and request interceptors
  - Automatically attaches bearer tokens
  - Refresh token workflow on `401` responses
  - Navigation fallback to login when refresh fails
- `src/services/auth.service.ts`
  - Auth endpoints for login and token refresh

### Domain types

- `src/types/index.ts`
  - Application-wide type definitions for auth, products, orders, deliveries, and role enums
  - Ensures type-safe navigation and API payloads

### Utilities

- `src/utils/tokenStorage.ts`
  - Secure token storage helpers for `access_token` and `refresh_token`
  - Session persistence across app restarts
- `src/utils/errorHandling.ts`
  - Centralized handling of API and UI errors
- `src/utils/enumLabels.ts`
  - User-friendly labels for enum values

## Folder Structure

- `src/components/` — reusable UI components
- `src/context/` — global application state providers
- `src/hooks/` — reusable hooks for data and auth logic
- `src/navigation/` — React Navigation stacks and tab flows
- `src/screens/` — screen-level UI implementations
- `src/services/` — API client and service abstractions
- `src/types/` — TypeScript contracts and domain models
- `src/utils/` — helper utilities

## Setup & Development

### Prerequisites

- Node.js 18+ or compatible LTS
- Expo CLI installed globally (`npm install -g expo-cli`)
- Yarn or npm
- Android/iOS simulator or Expo Go on a mobile device

### Install dependencies

```bash
npm install
# or
# yarn install
```

### Configure API URL

The app reads the backend URL from `EXPO_PUBLIC_API_URL`.

```bash
export EXPO_PUBLIC_API_URL="https://api.example.com/api/v1"
```

On Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL = "https://api.example.com/api/v1"
```

If the variable is not set, the app defaults to `http://localhost:8000/api/v1`.

### Run the app

```bash
npm start
```

Then choose one of:

```bash
npm run android
npm run ios
npm run web
```

### Run tests

```bash
npm test
```

## Authentication Flow

1. User logs in through `LoginScreen`
2. `AuthContext` calls `auth.service.login`
3. Tokens are persisted via `src/utils/tokenStorage.ts`
4. App navigation becomes role-aware
5. API requests include bearer tokens automatically
6. On `401`, the refresh flow rotates tokens and retries the request

## Role-Based Experience

| Role                        | Main Tabs                | Capabilities                                             |
| --------------------------- | ------------------------ | -------------------------------------------------------- |
| `FARMER`                    | Marketplace, My Products | Browse products, add new products, manage farm inventory |
| `MERCHANT`                  | Marketplace, My Orders   | Browse products and manage merchant orders               |
| `DELIVERY`                  | Marketplace, Deliveries  | Browse marketplace and view assigned deliveries          |
| `ADMIN`, `MANAGER`, `AGENT` | Marketplace, Admin       | Access admin placeholder and marketplace                 |

## Extending the App

Suggested extension points:

- Add product CRUD operations via `product.service.ts`
- Implement merchant order details and checkout flows
- Add delivery acceptance, status updates, and map handling
- Replace admin placeholder with management dashboards
- Use GraphQL or a stronger data-fetching layer for marketplace data

## Notes for Maintainers

- The app is built with Expo SDK `~51.0.0`
- Navigation is powered by React Navigation v6
- TypeScript is enforced project-wide for better safety and refactoring
- The Axios instance is already configured for token refresh and navigation fallback
- `AuthContext` stores minimal profile data to keep the app lightweight while retaining auth state

## Troubleshooting

- `EXPO_PUBLIC_API_URL` missing → app falls back to `http://localhost:8000/api/v1`
- `401` refresh issue → tokens are cleared and user is routed to login
- If a new role is added, update `src/navigation/AppNavigator.tsx` and `src/types/index.ts`

## Recommended Improvements

- Add end-to-end or integration tests for auth and navigation flows
- Add environment-specific config support
- Add deeper offline caching or optimistic UI updates
- Add analytics and error reporting for production builds

---

FarmConnect Mobile App is designed to be a scalable, role-aware marketplace client with secure token management, clean navigation, and a modular codebase ready for rapid domain feature expansion.
