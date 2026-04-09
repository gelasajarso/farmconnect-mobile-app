# Requirements Document

## Introduction

FarmConnect is a React Native (Expo) mobile application serving as an agriculture marketplace. It connects farmers, merchants, delivery agents, and administrators on a single platform. The app supports role-based access (FARMER, MERCHANT, DELIVERY, ADMIN, MANAGER, AGENT), product catalog browsing, order placement with escrow, delivery tracking, and farmer product management.

The current codebase has a working foundation: authentication (login/register with JWT + refresh token), role-based navigation, product catalog, product detail with order placement, farmer product management, merchant order history, and delivery assignment views. The next steps focus on hardening existing flows, improving UX, and adding missing production-grade features.

---

## Glossary

- **App**: The FarmConnect React Native (Expo) mobile application.
- **AuthContext**: The React context that holds the authenticated user's session state.
- **Farmer**: A user with role `FARMER` who lists and manages agricultural products.
- **Merchant**: A user with role `MERCHANT` who browses the catalog and places orders.
- **Delivery_Agent**: A user with role `DELIVERY` who fulfills delivery assignments.
- **Admin**: A user with role `ADMIN`, `MANAGER`, or `AGENT` who manages the platform.
- **Catalog**: The public list of available products returned by `GET /products/catalog`.
- **Product**: An agricultural item listed by a Farmer with price, quantity, grade, and status.
- **Order**: A purchase agreement between a Merchant and a Farmer, backed by an escrow.
- **Escrow**: A financial hold created alongside an Order to secure payment.
- **Delivery**: A fulfillment record assigned to a Delivery_Agent for a confirmed Order.
- **system_user_id**: The domain-level user identifier (e.g., `FAR-00001`, `MER-00002`) distinct from the Keycloak UUID.
- **API**: The backend REST service accessed via the configured `EXPO_PUBLIC_API_URL`.
- **Navigator**: A React Navigation component that controls screen routing.
- **SecureStore**: Expo's encrypted key-value storage used for tokens and user profile.
- **Token_Refresh**: The automatic process of exchanging an expired access token for a new one using the refresh token.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to securely log in and have my session persisted across app restarts, so that I do not need to re-enter credentials every time I open the app.

#### Acceptance Criteria

1. WHEN a user submits valid credentials, THE App SHALL authenticate the user and store the access token and refresh token in SecureStore.
2. WHEN the App launches with a stored access token, THE AuthContext SHALL restore the user session without requiring re-login.
3. WHEN an API request returns HTTP 401 and the request has not already been retried, THE App SHALL attempt a Token_Refresh using the stored refresh token before retrying the original request.
4. IF the Token_Refresh request fails, THEN THE App SHALL clear all tokens from SecureStore and navigate the user to the Login screen.
5. WHEN a user submits an empty email or empty password, THE App SHALL display a field-level validation error and SHALL NOT submit the request to the API.
6. WHEN a user taps "Sign In" with invalid credentials, THE App SHALL display an error message and SHALL NOT navigate away from the Login screen.
7. WHEN a user logs out, THE App SHALL clear all tokens and the stored user profile from SecureStore and navigate to the Login screen.

---

### Requirement 2: Role-Based Navigation

**User Story:** As a user, I want to see only the screens relevant to my role, so that the interface is focused and uncluttered.

#### Acceptance Criteria

1. WHEN a Farmer authenticates, THE Navigator SHALL display the Marketplace tab and the My Products tab.
2. WHEN a Merchant authenticates, THE Navigator SHALL display the Marketplace tab and the My Orders tab.
3. WHEN a Delivery_Agent authenticates, THE Navigator SHALL display the Marketplace tab and the Deliveries tab.
4. WHEN an Admin, Manager, or Agent authenticates, THE Navigator SHALL display the Marketplace tab and the Admin tab.
5. WHEN a user's role is not recognized, THE App SHALL display a "Not Authorized" screen and SHALL NOT grant access to any protected tab.
6. WHILE the AuthContext is loading the stored session, THE App SHALL display a loading indicator and SHALL NOT render any navigation tabs.

---

### Requirement 3: Product Catalog Browsing

**User Story:** As a user, I want to browse and search the product catalog, so that I can find agricultural products available for purchase.

#### Acceptance Criteria

1. WHEN the Marketplace screen loads, THE App SHALL fetch the Catalog from `GET /products/catalog` and display the results as a scrollable list.
2. WHEN the Catalog fetch is in progress, THE App SHALL display a loading indicator in place of the product list.
3. IF the Catalog fetch fails, THEN THE App SHALL display an error message and a retry button.
4. WHEN a user types in the search field, THE App SHALL filter the displayed Catalog items to those whose name or category contains the search text (case-insensitive), without making additional API calls.
5. WHEN the Catalog is empty or all items are filtered out, THE App SHALL display an empty state message.
6. WHEN a user taps a product card, THE App SHALL navigate to the Product Detail screen for that product.

---

### Requirement 4: Product Detail and Order Placement

**User Story:** As a Merchant, I want to view full product details and place an order, so that I can purchase agricultural goods from farmers.

#### Acceptance Criteria

1. WHEN the Product Detail screen loads, THE App SHALL fetch the Product from `GET /products/{productId}` and display its name, category, description, price, unit, quantity, quality grade, harvest date, expiry date, and status.
2. WHEN the Product fetch is in progress, THE App SHALL display a loading indicator.
3. IF the Product fetch returns HTTP 404, THEN THE App SHALL display a "Product not found" message and a back button.
4. WHILE the authenticated user has role MERCHANT, THE App SHALL display an order placement form on the Product Detail screen.
5. WHEN a Merchant submits an order with a quantity of zero or a non-numeric value, THE App SHALL display a field-level validation error and SHALL NOT submit the order to the API.
6. WHEN a Merchant submits a valid order, THE App SHALL call `POST /orders` and display the resulting Order ID and total price in a confirmation dialog.
7. IF the order creation request returns HTTP 409, THEN THE App SHALL display an "Insufficient stock" error message.
8. WHEN a Merchant places a successful order, THE App SHALL resolve and store the Merchant's system_user_id from the Order response.

---

### Requirement 5: Farmer Product Management

**User Story:** As a Farmer, I want to view and add my products, so that I can manage my listings on the marketplace.

#### Acceptance Criteria

1. WHEN the My Products screen loads and the Farmer's system_user_id is known, THE App SHALL fetch the Farmer's products from `GET /products/farmer/{farmerId}` and display them.
2. WHEN the Farmer's system_user_id is not yet resolved, THE App SHALL attempt to resolve it by fetching orders from `GET /orders` and extracting the `farmer_id` field.
3. IF the system_user_id resolution fails, THEN THE App SHALL display an error message and a retry option.
4. WHEN a Farmer taps "Add Product", THE App SHALL navigate to the Add Product screen.
5. WHEN a Farmer submits the Add Product form with all required fields, THE App SHALL call `POST /products` and navigate back to the My Products list on success.
6. IF the Add Product request fails, THEN THE App SHALL display the API error message and SHALL NOT navigate away from the form.
7. WHEN the My Products list is empty, THE App SHALL display an empty state message prompting the Farmer to add a product.

---

### Requirement 6: Merchant Order History

**User Story:** As a Merchant, I want to view my order history, so that I can track the status of my purchases.

#### Acceptance Criteria

1. WHEN the My Orders screen loads, THE App SHALL fetch orders from `GET /orders` and display them as a scrollable list.
2. WHEN the orders fetch is in progress, THE App SHALL display a loading indicator.
3. IF the orders fetch fails, THEN THE App SHALL display an error message and a retry button.
4. WHEN the order list is empty, THE App SHALL display an empty state message.
5. THE App SHALL display each Order's ID, product ID, quantity, total price, and status.

---

### Requirement 7: Delivery Assignment Tracking

**User Story:** As a Delivery_Agent, I want to view my assigned deliveries, so that I can fulfill them efficiently.

#### Acceptance Criteria

1. WHEN the Deliveries screen loads, THE App SHALL fetch assignments from `GET /delivery/my-assignments` and display them as a scrollable list.
2. WHEN the assignments fetch is in progress, THE App SHALL display a loading indicator.
3. IF the assignments fetch fails, THEN THE App SHALL display an error message and a retry button.
4. WHEN the assignment list is empty, THE App SHALL display an empty state message.
5. THE App SHALL display each Delivery's ID, order ID, status, pickup time, and delivered time.

---

### Requirement 8: API Error Handling and Resilience

**User Story:** As a user, I want the app to handle network and server errors gracefully, so that I am always informed of what went wrong and can take action.

#### Acceptance Criteria

1. WHEN any API request fails due to a network timeout (after 15 seconds), THE App SHALL display a user-readable error message.
2. WHEN any API request returns an unexpected HTTP error status, THE App SHALL display the error message extracted from the response body, or a generic fallback message if none is available.
3. IF an error occurs during session hydration on app launch, THEN THE App SHALL treat the user as unauthenticated and navigate to the Login screen.
4. THE App SHALL NOT expose raw stack traces or internal error objects to the user interface.

---

### Requirement 9: Secure Token Storage

**User Story:** As a user, I want my authentication tokens stored securely, so that my credentials are protected even if the device is compromised.

#### Acceptance Criteria

1. THE App SHALL store the access token and refresh token exclusively in SecureStore and SHALL NOT store them in AsyncStorage or any unencrypted location.
2. THE App SHALL store the user profile (keycloak_id, email, name, role) in SecureStore for session hydration.
3. WHEN a user logs out, THE App SHALL delete all SecureStore entries for tokens and user profile.
4. THE App SHALL store the system_user_id in SecureStore once resolved, so that it persists across app restarts.

---

### Requirement 10: Add Product Form Validation

**User Story:** As a Farmer, I want the Add Product form to validate my input before submission, so that I don't accidentally create invalid listings.

#### Acceptance Criteria

1. WHEN a Farmer submits the Add Product form with an empty product name, THE App SHALL display a validation error on the name field and SHALL NOT call the API.
2. WHEN a Farmer submits the Add Product form with a base price of zero or a non-numeric value, THE App SHALL display a validation error on the price field and SHALL NOT call the API.
3. WHEN a Farmer submits the Add Product form with a total quantity of zero or a non-numeric value, THE App SHALL display a validation error on the quantity field and SHALL NOT call the API.
4. WHEN a Farmer submits the Add Product form with no category selected, THE App SHALL display a validation error on the category field and SHALL NOT call the API.
5. WHEN a Farmer submits the Add Product form with no unit selected, THE App SHALL display a validation error on the unit field and SHALL NOT call the API.
6. WHEN all required fields are valid, THE App SHALL enable the submit button and allow the API call to proceed.

---

### Requirement 11: Product Serialization Round-Trip

**User Story:** As a developer, I want product data to serialize and deserialize correctly, so that data integrity is maintained when caching or transmitting product objects.

#### Acceptance Criteria

1. THE App SHALL serialize a ProductPublicDTO to a JSON string using `serializeProductPublicDTO`.
2. THE App SHALL deserialize a JSON string back to a ProductPublicDTO using `parseProductPublicDTO`.
3. FOR ALL valid ProductPublicDTO objects, serializing then deserializing SHALL produce an object deeply equal to the original (round-trip property).
