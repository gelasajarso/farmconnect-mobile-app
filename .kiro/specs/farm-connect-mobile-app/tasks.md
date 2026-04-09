# Implementation Plan: FarmConnect Mobile App

## Overview

The codebase already has a working foundation for all major flows. This plan focuses on hardening the existing implementation: adding form validation completeness, serialization utilities, error handling resilience, token refresh correctness, and property-based tests for the round-trip serialization requirement. Tasks are ordered to build incrementally on what exists.

## Tasks

- [x] 1. Harden authentication flow and session hydration
  - [x] 1.1 Verify and fix LoginScreen field-level validation
    - Ensure empty email and empty password each produce a field-level error and block the API call
    - Ensure invalid credentials (HTTP 401) show an error message without navigating away
    - Confirm the submit button is disabled while the request is in-flight
    - _Requirements: 1.1, 1.5, 1.6_

  - [x] 1.2 Verify token refresh interceptor in `src/services/api.ts`
    - Confirm the response interceptor retries the original request exactly once on HTTP 401
    - Confirm that if the refresh call fails, `clearTokens()` is called and navigation goes to Login
    - Confirm the `_retry` flag prevents infinite retry loops
    - _Requirements: 1.3, 1.4_

  - [ ]* 1.3 Write unit tests for LoginScreen validation logic
    - Test: empty email → field error, no API call
    - Test: empty password → field error, no API call
    - Test: both empty → both field errors, no API call
    - Test: valid credentials → `login()` called once
    - _Requirements: 1.5, 1.6_

  - [x] 1.4 Verify logout clears all SecureStore entries
    - Confirm `logout()` in `AuthContext` calls `clearTokens()` and `clearUserProfile()`
    - Confirm user state is set to `null` after logout
    - _Requirements: 1.7, 9.3_

- [ ] 2. Checkpoint — Ensure authentication tests pass, ask the user if questions arise.

- [x] 3. Implement and harden Add Product form validation
  - [x] 3.1 Audit `AddProductScreen` validation against all rules in Requirements 10
    - Name: required, 2–100 characters
    - Category: required (one of `Category` enum values)
    - Unit: required (one of `Unit` enum values)
    - Base price: required, numeric, > 0
    - Total quantity: required, numeric, ≥ 0
    - Confirm no API call is made when any required field is invalid
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 3.2 Fix any validation gaps found in 3.1
    - Update `validate()` function in `AddProductScreen.tsx` to cover all rules
    - Ensure the submit button is disabled while loading
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 3.3 Write unit tests for Add Product form validation
    - Test: empty name → error, no API call
    - Test: name < 2 chars → error, no API call
    - Test: price = 0 → error, no API call
    - Test: price = negative → error, no API call
    - Test: quantity = negative → error, no API call
    - Test: no category selected → error, no API call
    - Test: no unit selected → error, no API call
    - Test: all valid → `createProduct()` called once
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 4. Implement product serialization utilities and round-trip correctness
  - [x] 4.1 Verify `serializeProductPublicDTO` and `parseProductPublicDTO` in `src/services/product.service.ts`
    - Confirm `serializeProductPublicDTO` returns a valid JSON string
    - Confirm `parseProductPublicDTO` returns a `ProductPublicDTO` object
    - Confirm round-trip: `parseProductPublicDTO(serializeProductPublicDTO(dto))` deeply equals `dto`
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 4.2 Write property test for ProductPublicDTO round-trip serialization
    - **Property 1: Round-trip consistency** — for all valid `ProductPublicDTO` objects, `parseProductPublicDTO(serializeProductPublicDTO(dto))` must deeply equal the original `dto`
    - **Validates: Requirements 11.3**
    - Use a property-based testing library (e.g., `fast-check`) to generate arbitrary `ProductPublicDTO` values covering all nullable fields, enum values, and nested objects
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 4.3 Write unit tests for serialization edge cases
    - Test: DTO with all nullable fields set to `null`
    - Test: DTO with `metadata` containing nested objects
    - Test: DTO with empty `images` array vs `null`
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 5. Checkpoint — Ensure serialization tests pass, ask the user if questions arise.

- [x] 6. Harden API error handling and resilience
  - [x] 6.1 Audit `extractApiError` in `src/utils/errorHandling.ts`
    - Confirm network timeout (Axios timeout error) produces a user-readable message
    - Confirm unexpected HTTP status codes extract `detail` or `message` from response body
    - Confirm fallback message is shown when no body detail is available
    - Confirm raw stack traces are never surfaced to the UI
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 6.2 Verify session hydration error handling in `AuthContext`
    - Confirm that if `SecureStore` read throws during hydration, `isLoading` is set to `false` and `user` remains `null`
    - Confirm `RootNavigator` renders `AuthNavigator` (Login screen) when `user` is `null`
    - _Requirements: 8.3_

  - [ ]* 6.3 Write unit tests for `extractApiError`
    - Test: Axios timeout error → message contains "Network error" or similar
    - Test: HTTP 500 with `detail` field → message equals `detail`
    - Test: HTTP 500 with no body → message is the generic fallback
    - Test: non-Axios error → message is the generic fallback
    - _Requirements: 8.1, 8.2, 8.4_

- [x] 7. Harden role-based navigation
  - [x] 7.1 Verify `AppNavigator` role-gating covers all roles
    - Confirm FARMER → `FarmerNavigator` (Marketplace + My Products tabs)
    - Confirm MERCHANT → `MerchantNavigator` (Marketplace + My Orders tabs)
    - Confirm DELIVERY → `DeliveryNavigator` (Marketplace + Deliveries tabs)
    - Confirm ADMIN, MANAGER, AGENT → `AdminNavigator` (Marketplace + Admin tabs)
    - Confirm unrecognized role → `NotAuthorizedScreen`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 7.2 Verify loading state in `RootNavigator`
    - Confirm `LoadingIndicator` is rendered while `isLoading` is `true`
    - Confirm no navigation tabs are rendered during loading
    - _Requirements: 2.6_

  - [ ]* 7.3 Write unit tests for `AppNavigator` role routing
    - Test: user with role FARMER → renders FarmerNavigator
    - Test: user with role MERCHANT → renders MerchantNavigator
    - Test: user with role DELIVERY → renders DeliveryNavigator
    - Test: user with role ADMIN → renders AdminNavigator
    - Test: user with unknown role → renders NotAuthorizedScreen
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8. Harden product catalog and detail screens
  - [x] 8.1 Verify `HomeScreen` catalog fetch and search filtering
    - Confirm `useCatalog` is called on mount and shows `LoadingIndicator` during fetch
    - Confirm `ErrorView` with retry button is shown on fetch failure
    - Confirm search filters by name and category (case-insensitive) without additional API calls
    - Confirm `EmptyState` is shown when catalog is empty or all items are filtered out
    - Confirm tapping a `ProductCard` navigates to `ProductDetail` with the correct `productId`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 8.2 Verify `ProductDetailScreen` fetch and order placement
    - Confirm all required fields are displayed: name, category, description, price, unit, quantity, quality grade, harvest date, expiry date, status
    - Confirm HTTP 404 error shows "Product not found" with a back button
    - Confirm order form is only visible for MERCHANT role
    - Confirm quantity = 0 or non-numeric shows field-level error and blocks API call
    - Confirm HTTP 409 on order creation shows "Insufficient stock" message
    - Confirm successful order shows confirmation dialog with Order ID and total price
    - Confirm `resolveSystemUserId` is called with `merchant_id` from the order response
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 8.3 Write unit tests for catalog search filtering
    - Test: query matching product name → filtered list contains matching items
    - Test: query matching category → filtered list contains matching items
    - Test: query with mixed case → case-insensitive match works
    - Test: query matching nothing → empty list
    - _Requirements: 3.4, 3.5_

- [x] 9. Harden farmer product management and system_user_id resolution
  - [x] 9.1 Verify `FarmerProductsScreen` system_user_id resolution flow
    - Confirm that when `system_user_id` is null, `GET /orders` is called to extract `farmer_id`
    - Confirm `resolveSystemUserId` is called with the extracted `farmer_id`
    - Confirm error state is shown with retry option if resolution fails
    - Confirm `useFarmerProducts` is skipped (not called) when `farmerId` is null
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 9.2 Verify Add Product navigation and success flow
    - Confirm tapping "Add Product" navigates to `AddProductScreen`
    - Confirm successful `createProduct` call navigates back to `FarmerProductsList`
    - Confirm API error on create shows error message and stays on the form
    - Confirm empty product list shows `EmptyState` message
    - _Requirements: 5.4, 5.5, 5.6, 5.7_

  - [x] 9.3 Verify `system_user_id` is persisted in SecureStore
    - Confirm `storeSystemUserId` is called in `resolveSystemUserId` inside `AuthContext`
    - Confirm `getSystemUserId` is read during session hydration and restored to `AuthUser`
    - _Requirements: 9.4_

- [x] 10. Harden merchant orders and delivery assignment screens
  - [x] 10.1 Verify `MerchantOrdersScreen` displays all required order fields
    - Confirm each `OrderRow` shows: Order ID, product ID, quantity, total price, status
    - Confirm `LoadingIndicator` during fetch, `ErrorView` with retry on failure, `EmptyState` when empty
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 10.2 Verify `DeliveryAssignmentsScreen` displays all required delivery fields
    - Confirm each `DeliveryRow` shows: Delivery ID, order ID, status, pickup time, delivered time
    - Confirm `LoadingIndicator` during fetch, `ErrorView` with retry on failure, `EmptyState` when empty
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Verify secure token storage invariants
  - [x] 11.1 Audit all token read/write paths
    - Confirm access token and refresh token are only stored via `SecureStore` (no `AsyncStorage` usage)
    - Confirm user profile is stored in `SecureStore` under `user_profile` key
    - Confirm `clearTokens()` deletes `access_token`, `refresh_token`, and `system_user_id`
    - Confirm `clearUserProfile()` deletes `user_profile`
    - Search codebase for any `AsyncStorage` imports and remove if found
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 12. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The codebase is largely implemented; most tasks are verification + gap-filling + test coverage
- Property test in task 4.2 validates the universal round-trip property from Requirement 11.3
- Unit tests validate specific examples and edge cases for each flow
