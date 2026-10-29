# Sweet Shop Management System
## Day 3 — Research REST API Design

### 1. Objective

The objective of Day 3 is to understand how the React frontend communicates with the Node.js and Express backend and to prepare an API specification for the Sweet Shop Management System.

The specification defines the endpoints required for authentication, products, categories, inventory, customers, orders, and administration.

It also documents access permissions, request data, validation requirements, response formats, error handling, and database operations.

The proposed API follows REST conventions and uses MongoDB with Mongoose for data storage and validation.

---

# Task 1: Understanding REST APIs

## 2. What is an API?

API stands for Application Programming Interface.

An API defines how two software components communicate with each other. It specifies the operations that can be requested, the information that must be supplied, and the responses that can be returned.

In the Sweet Shop Management System, the React frontend needs to communicate with the Express backend to retrieve products, register customers, create orders, and display inventory information.

For example, when a customer opens the product page, the frontend can send a request to the backend to retrieve the available sweets.

The backend retrieves the appropriate data from MongoDB and returns a response that the frontend can display.

## 3. What is a REST API?

REST stands for Representational State Transfer.

REST is an architectural style for designing network-based applications. A REST-style API commonly represents application data as resources and uses HTTP methods to interact with those resources.

Examples of resources in the sweet shop include:

- Users
- Products
- Categories
- Orders
- Inventory transactions

Example endpoint:

GET /api/products

This endpoint retrieves the products available to the frontend.

Another example:

POST /api/orders

This endpoint requests the creation of a new order.

The backend must validate the request, verify the user's permissions, perform the required database operations, and return an appropriate HTTP response.

## 4. What is an endpoint?

An endpoint is a specific API address and HTTP method used to perform an operation.

For example:

GET /api/products

Retrieves a list of products.

GET /api/products/:id

Retrieves a particular product.

POST /api/products

Creates a product, provided the caller has the required permissions.

Here, `:id` is a route parameter representing a specific product's identifier.

The same URL can support different operations depending on the HTTP method.

For example:

GET /api/products retrieves products, while POST /api/products creates a product.

## 5. HTTP Methods

| Method | Purpose | Example in the Sweet Shop |
|---|---|---|
| GET | Retrieves information without intentionally changing the resource. | Retrieve products or view an order. |
| POST | Submits data or requests an operation that may create a resource or change application state. | Register a user, create an order, or restock a product. |
| PATCH | Applies a partial modification to an existing resource. | Change a product's name or deactivate it. |
| PUT | Replaces a resource representation with the supplied representation according to the API contract. | Replace the editable fields of an existing product. |
| DELETE | Requests deletion of a resource. | Delete a category when deletion is permitted and safe. |

### Why use PATCH for product updates?

Suppose a product has the following information:

- Name: Rasgulla
- Price: ₹250 per kilogram
- Available stock: 10 kg
- Category: Bengali Sweets

If the administrator wants to change only the price, PATCH allows the request to supply only the field being changed.

For example:

PATCH /api/products/PRODUCT_ID

Request body:

{
  "unitPrice": 270
}

The backend validates the new price and updates the product.

Stock should not be changed through this general product-update endpoint. Stock adjustments should use dedicated inventory operations so that the system can record the reason for every stock movement.

## 6. HTTP Status Codes

HTTP status codes tell the frontend whether a request succeeded or failed.

| Status code | Meaning | Sweet Shop example |
|---|---|---|
| 200 OK | Request succeeded. | Products retrieved successfully. |
| 201 Created | A new resource was created. | Customer registration or order creation succeeded. |
| 204 No Content | Request succeeded without returning a response body. | A permitted deletion succeeded. |
| 400 Bad Request | Request data is malformed or invalid. | Missing required product fields. |
| 401 Unauthorized | Authentication is missing or invalid. | Login is required to view private orders. |
| 403 Forbidden | The caller is authenticated but lacks permission. | A customer tries to create a product. |
| 404 Not Found | The requested resource does not exist or is not accessible under the API's disclosure policy. | A product ID cannot be found. |
| 409 Conflict | The request conflicts with the current resource state. | Stock is insufficient or a unique email already exists. |
| 413 Content Too Large | Request content exceeds the permitted size. | An oversized request body is rejected. |
| 415 Unsupported Media Type | The request uses an unsupported content type. | A JSON endpoint receives an unsupported body format. |
| 422 Unprocessable Content | The request is understood but violates defined business rules. | An order contains an invalid quantity or an invalid status transition. |
| 429 Too Many Requests | Too many requests were received in a defined period. | Login attempts exceed the configured rate limit. |
| 500 Internal Server Error | An unexpected server error occurred. | An unhandled backend error occurs. |

The API should use these codes consistently. For example, a validation failure should not be reported as a successful request.

## 7. Request Parameters, Request Bodies, and Response Bodies

### 7.1 Request parameters

Parameters provide information that helps the backend identify, filter, sort, or paginate resources.

There are three common forms.

**Route parameters**

Example:

GET /api/products/PRODUCT_ID

The product ID identifies the requested resource.

**Query parameters**

Example:

GET /api/products?categoryId=CATEGORY_ID&page=1&limit=10

These parameters can filter products by category and control pagination.

**Headers**

Headers carry metadata about the request.

Example:

Authorization: Bearer ACCESS_TOKEN

This header supplies a bearer token when the endpoint requires authentication.

### 7.2 Request body

The request body contains the data submitted to an endpoint.

Example:

POST /api/products

{
  "name": "Rasgulla",
  "description": "Traditional Bengali sweet",
  "unitPrice": 250,
  "unit": "kg",
  "categoryId": "CATEGORY_ID"
}

The backend must validate the supplied values before storing them.

The administrator should not directly set the available stock through this example. Initial stock should be recorded using an authorized inventory operation.

### 7.3 Response body

The response body contains the information returned by the backend.

Example:

{
  "success": true,
  "data": {
    "id": "PRODUCT_ID",
    "name": "Rasgulla",
    "unitPrice": 250,
    "unit": "kg",
    "availableStock": 10
  }
}

The frontend can use this information to display the product.

The API should not return sensitive information, such as password hashes or private authentication details.

## 8. Why backend validation is required

Frontend validation improves usability by helping users correct mistakes before submitting a form.

However, frontend validation cannot guarantee that incoming data is valid or safe.

A user can bypass frontend controls by modifying requests, calling an API directly, or using a tool such as Postman.

Therefore, the backend must independently validate every request.

For example, the frontend might prevent a customer from entering a quantity of zero. A malicious or incorrectly configured client could still submit:

{
  "items": [
    {
      "productId": "PRODUCT_ID",
      "quantity": -5
    }
  ]
}

The backend must reject this request.

Backend validation should check:

- Required fields.
- Correct data types.
- String lengths and formats.
- Positive prices and quantities where appropriate.
- Valid MongoDB identifiers.
- Existing product and category references.
- Permitted user roles and order statuses.
- Sufficient available stock.
- Valid business rules.
- Unexpected fields that are not accepted by the endpoint.

Backend validation protects data integrity even when the frontend cannot be trusted.

---

# Task 2: API Inventory

## 9. Access-Control Definitions

The proposed API uses three primary access levels.

**Public:** No login is required.

**Authenticated customer:** The user must be logged in. The user can access permitted customer functions and their own private data.

**Administrator:** The user must be authenticated and have the administrator role.

An administrator is not simply someone who submits `"role": "admin"` in a request. The role must be assigned and controlled by the backend.

The proposed design uses JWT-based authentication. Protected requests must include a valid access token, and the backend must verify both authentication and authorization.

## 10. Authentication Endpoints

| ID | Method and URL | Purpose | Access |
|---|---|---|---|
| AUTH-01 | POST /api/auth/register | Register a new customer. | Public |
| AUTH-02 | POST /api/auth/login | Authenticate a user and issue an access token. | Public |
| AUTH-03 | GET /api/auth/me | Retrieve the currently authenticated user's profile. | Authenticated |
| AUTH-04 | POST /api/auth/logout | End the authenticated session according to the selected token strategy. | Authenticated |

### AUTH-01: Register

**Purpose:** Create a customer account.

**Request body:**

{
  "name": "Customer Name",
  "email": "customer@example.com",
  "password": "ExamplePassword123!"
}

**Validation:**

- Name must be present and within the permitted length.
- Email must have a valid format.
- Email must be unique, with a database constraint protecting against concurrent duplicates.
- Password must satisfy the configured password policy.
- The backend must hash the password before storing it.
- The client must not be allowed to choose an administrator role.

**Success:** `201 Created`

Example:

{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "id": "USER_ID",
    "name": "Customer Name",
    "email": "customer@example.com",
    "role": "customer"
  }
}

**Possible errors:** `400` invalid input, `409` duplicate email, `500` unexpected server error.

**Database operation:** Validate the data and create a User document with a hashed password and the default customer role.

### AUTH-02: Login

**Purpose:** Verify a user's credentials.

**Request body:**

{
  "email": "customer@example.com",
  "password": "ExamplePassword123!"
}

**Validation:**

- Both fields are required.
- The email format must be valid.
- The password must be checked against the stored password hash.
- Failed attempts should be rate-limited.

**Success:** `200 OK`

Example:

{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "Customer Name",
      "email": "customer@example.com",
      "role": "customer"
    },
    "accessToken": "SIGNED_ACCESS_TOKEN"
  }
}

This example illustrates a bearer-token response. If the project uses secure HTTP-only cookies instead, the token-delivery and logout contracts should be adapted accordingly.

**Possible errors:** `400` invalid request, `401` invalid credentials, `429` too many attempts.

**Database operation:** Find the user by email and verify the submitted password against the stored hash. Do not return the password hash.

### AUTH-03: Current user

**Purpose:** Retrieve the profile of the logged-in user.

**Request:** No body required.

**Access:** Authenticated.

**Success:** `200 OK` with the current user's permitted profile fields.

**Possible errors:** `401` invalid or expired token.

**Database operation:** Verify the token, identify the user, and retrieve the permitted profile information.

### AUTH-04: Logout

**Purpose:** End the user's authenticated session.

**Access:** Authenticated.

**Success:** `200 OK` or `204 No Content`, depending on the contract.

**Possible errors:** `401` invalid token.

**Database operation:** Depends on the authentication strategy. If the application uses only stateless access tokens, simply deleting the token in the frontend does not invalidate a stolen token on the server. Server-side invalidation requires an appropriate revocation strategy, such as a denylist or refresh-token/session management.

---

# 11. Product Endpoints

| ID | Method and URL | Purpose | Access |
|---|---|---|---|
| PROD-01 | GET /api/products | List active products. | Public |
| PROD-02 | GET /api/products/:id | Retrieve product details. | Public |
| PROD-03 | POST /api/products | Create a product. | Administrator |
| PROD-04 | PATCH /api/products/:id | Partially update permitted product fields. | Administrator |
| PROD-05 | PATCH /api/products/:id/status | Activate or deactivate a product. | Administrator |
| PROD-06 | GET /api/categories | List active categories. | Public |
| PROD-07 | POST /api/categories | Create a category. | Administrator |
| PROD-08 | PATCH /api/categories/:id | Update category details. | Administrator |
| PROD-09 | DELETE /api/categories/:id | Delete a category when safe and permitted. | Administrator |

### PROD-01: List active products

**Purpose:** Display available products in the shop.

**Parameters:** Optional query parameters such as `categoryId`, `page`, `limit`, and `search`.

**Validation:**

- Pagination values must be valid positive integers.
- Page size must have a configured maximum.
- Category filters must use valid identifiers.
- Search input must be length-limited and handled safely.
- Only active products should be returned by default.

**Success:** `200 OK`

Example:

{
  "success": true,
  "data": [
    {
      "id": "PRODUCT_ID",
      "name": "Rasgulla",
      "unitPrice": 250,
      "unit": "kg",
      "availableStock": 10
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}

**Possible errors:** `400` invalid query parameters, `500` unexpected server error.

**Database operation:** Query the Product collection using the requested filters and pagination.

### PROD-02: Product details

**Purpose:** Retrieve the details of one product.

**URL:** `/api/products/:id`

**Validation:** Validate the identifier's format.

**Success:** `200 OK` with the product details.

**Possible errors:** `400` malformed ID, `404` product not found.

**Database operation:** Find the requested Product document and return permitted fields.

### PROD-03: Create product

**Purpose:** Add a new sweet to the catalogue.

**Request body:**

{
  "name": "Rasgulla",
  "description": "Traditional Bengali sweet",
  "unitPrice": 250,
  "unit": "kg",
  "categoryId": "CATEGORY_ID"
}

**Validation:**

- Name is required and must be within the configured length.
- Price must be a valid positive number.
- Unit must be an allowed value.
- Category must exist and be eligible for use.
- Any accepted optional fields must also be validated.
- Initial stock must not be set through an unrestricted product-creation field.

**Success:** `201 Created`.

**Possible errors:** `400` invalid data, `401` unauthenticated, `403` insufficient permission, `404` category not found, `409` applicable uniqueness conflict.

**Database operation:** Validate the category and create a Product document.

### PROD-04: Update product

**Purpose:** Update permitted product details.

**Example request body:**

{
  "unitPrice": 270,
  "description": "Fresh traditional Bengali sweet"
}

**Validation:**

- Reject an empty or invalid update.
- Allow only explicitly editable fields.
- Validate each supplied value.
- Do not allow this endpoint to alter stock directly.
- Do not permit a user to change protected fields such as role or internal identifiers through this endpoint.

**Success:** `200 OK` with the updated product.

**Possible errors:** `400` invalid update, `401` unauthenticated, `403` forbidden, `404` product not found.

**Database operation:** Validate the update and apply it to the Product document.

### PROD-05: Activate or deactivate product

**Purpose:** Control whether a product appears in the active catalogue.

**Request body:**

{
  "isActive": false
}

**Validation:** `isActive` must be a boolean.

**Success:** `200 OK` with the updated product status.

**Possible errors:** `400` invalid status, `401` unauthenticated, `403` forbidden, `404` product not found.

**Database operation:** Update the Product document's active status.

Deactivation is preferred to permanently deleting a product that may be referenced by historical orders.

### PROD-06: List categories

**Purpose:** Allow customers to browse sweets by category.

**Access:** Public.

**Success:** `200 OK` with active categories.

**Possible errors:** `500` unexpected server error.

**Database operation:** Query active Category documents.

### PROD-07: Create category

**Purpose:** Add a new category.

**Request body:**

{
  "name": "Bengali Sweets",
  "description": "Traditional Bengali sweets"
}

**Validation:** Name is required, has an acceptable length, and must satisfy the configured uniqueness rule.

**Success:** `201 Created`.

**Possible errors:** `400` invalid data, `401` unauthenticated, `403` forbidden, `409` duplicate category.

**Database operation:** Validate and create a Category document.

### PROD-08: Update category

**Purpose:** Update category details.

**Request body:** Permitted fields such as `name` and `description`.

**Validation:** Reject invalid fields and duplicate names where uniqueness is required.

**Success:** `200 OK`.

**Possible errors:** `400`, `401`, `403`, `404`, or `409`, as applicable.

**Database operation:** Update the Category document.

### PROD-09: Delete category

**Purpose:** Remove a category only when deletion is safe.

**Validation:** Check whether products or historical records reference the category.

**Success:** `204 No Content`.

**Possible errors:** `401`, `403`, `404`, or `409` if the category is still referenced.

**Database operation:** Delete the Category document only after the required integrity checks. If historical records depend on it, retaining or deactivating the category is preferable.

---

# 12. Inventory Endpoints

| ID | Method and URL | Purpose | Access |
|---|---|---|---|
| INV-01 | POST /api/products/:id/restock | Increase stock after receiving inventory. | Administrator |
| INV-02 | GET /api/inventory/transactions | View inventory movement history. | Administrator |
| INV-03 | GET /api/inventory/transactions/:id | View a specific inventory transaction. | Administrator |

### INV-01: Restock product

**Purpose:** Record incoming stock.

**Request body:**

{
  "quantity": 20,
  "reason": "New stock received"
}

The quantity in this example means 20 units of the product's configured stock unit. For a product measured in kilograms, it means 20 kg.

**Validation:**

- Quantity must be a finite positive number.
- The product must exist.
- The product must be eligible for restocking.
- The reason must satisfy the configured length limit.
- Only an authorized administrator may perform the operation.
- The operation must record the stock change consistently.

**Success:** `201 Created`

Example:

{
  "success": true,
  "message": "Stock updated successfully.",
  "data": {
    "productId": "PRODUCT_ID",
    "quantityAdded": 20,
    "availableStock": 30,
    "transactionType": "IN"
  }
}

**Possible errors:** `400` invalid quantity, `401` unauthenticated, `403` forbidden, `404` product not found, `500` unexpected server error.

**Database operation:** Update the product's stock and create an InventoryTransaction record.

Both changes must succeed or fail together. A database transaction or another safe consistency strategy should be used where supported.

### INV-02: Inventory history

**Purpose:** Allow administrators to review stock changes.

**Parameters:** Optional filters such as `productId`, `type`, `from`, `to`, `page`, and `limit`.

**Validation:** Validate identifiers, date ranges, transaction types, and pagination values.

**Success:** `200 OK` with a paginated list of inventory transactions.

**Possible errors:** `400`, `401`, `403`, or `500`.

**Database operation:** Query the InventoryTransaction collection using the permitted filters.

### INV-03: View inventory transaction

**Purpose:** Retrieve one stock movement record.

**Validation:** Validate the transaction identifier.

**Success:** `200 OK` with the transaction details.

**Possible errors:** `400` malformed ID, `401` unauthenticated, `403` forbidden, `404` transaction not found.

**Database operation:** Find the corresponding InventoryTransaction document.

---

# 13. Customer Endpoints

The User model represents accounts. These endpoints provide a way to manage a customer's own profile and allow administrators to review customer records.

| ID | Method and URL | Purpose | Access |
|---|---|---|---|
| CUST-01 | GET /api/customers/me | Retrieve the current customer's profile. | Authenticated customer |
| CUST-02 | PATCH /api/customers/me | Update permitted profile fields. | Authenticated customer |
| CUST-03 | GET /api/customers | List customer accounts. | Administrator |
| CUST-04 | GET /api/customers/:id | Retrieve a customer record. | Administrator |
| CUST-05 | PATCH /api/customers/:id/status | Activate or suspend a customer account. | Administrator |

### CUST-01: View own profile

**Purpose:** Retrieve the logged-in customer's profile.

**Success:** `200 OK` with permitted profile fields.

**Possible errors:** `401` unauthenticated.

**Database operation:** Find the authenticated user's User document.

The backend must identify the user from the verified authentication context, not from a user ID supplied by the client.

### CUST-02: Update own profile

**Purpose:** Update permitted customer information.

**Request body:** Fields such as name or other approved profile fields.

**Validation:** Validate each supplied field and reject protected fields, including role and account identifiers.

**Success:** `200 OK` with the updated profile.

**Possible errors:** `400`, `401`, or `409` where a uniqueness conflict applies.

**Database operation:** Update only the permitted fields in the authenticated user's User document.

### CUST-03: List customers

**Purpose:** Allow an administrator to review customer accounts.

**Parameters:** Optional pagination and search filters.

**Validation:** Validate pagination and search inputs.

**Success:** `200 OK` with a paginated list of permitted customer fields.

**Possible errors:** `400`, `401`, `403`, or `500`.

**Database operation:** Query User documents with the customer role. Exclude password hashes and other sensitive fields.

### CUST-04: View customer

**Purpose:** Retrieve a specific customer record for administrative purposes.

**Validation:** Validate the user identifier.

**Success:** `200 OK` with permitted customer information.

**Possible errors:** `400`, `401`, `403`, `404`.

**Database operation:** Find the relevant User document and return only authorized fields.

### CUST-05: Update customer status

**Purpose:** Allow an administrator to activate or suspend a customer account.

**Request body:**

{
  "isActive": false
}

**Validation:** Require a boolean status and verify the administrator's permissions. Account suspension must not grant additional privileges or permit unauthorized access to existing data.

**Success:** `200 OK`.

**Possible errors:** `400`, `401`, `403`, `404`.

**Database operation:** Update the user's account status. The authentication middleware must enforce the resulting status on subsequent protected requests.

---

# 14. Order Endpoints

| ID | Method and URL | Purpose | Access |
|---|---|---|---|
| ORD-01 | POST /api/orders | Create an order. | Authenticated customer |
| ORD-02 | GET /api/orders/my | View the current customer's orders. | Authenticated customer |
| ORD-03 | GET /api/orders/my/:id | View one of the current customer's orders. | Authenticated customer |
| ORD-04 | GET /api/orders | View all orders. | Administrator |
| ORD-05 | GET /api/orders/:id | View a particular order for administration. | Administrator |
| ORD-06 | PATCH /api/orders/:id/status | Update an order's status. | Administrator |

### ORD-01: Create order

**Purpose:** Create a purchase order for the authenticated customer.

**Request body:**

{
  "items": [
    {
      "productId": "PRODUCT_ID",
      "quantity": 2
    }
  ]
}

This example assumes the product is measured in kilograms, so the quantity is 2 kg.

The customer does not submit the authoritative price, total amount, discount approval, or administrator role.

**Validation:**

- The customer must be authenticated and permitted to place an order.
- At least one item must be supplied.
- Every product identifier must be valid.
- Each quantity must be a finite positive number.
- Products must exist and be active.
- Requested quantities must be available.
- Prices must be obtained from trusted backend data.
- Totals must be calculated by the backend.
- The order must retain the sale price for each line item.
- Stock reductions and inventory records must be consistent.
- The system must protect against two concurrent orders selling more stock than is available.

**Success:** `201 Created`

Example:

{
  "success": true,
  "message": "Order created successfully.",
  "data": {
    "id": "ORDER_ID",
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 2,
        "unitPriceAtSale": 250,
        "lineTotal": 500
      }
    ],
    "totalAmount": 500,
    "status": "pending"
  }
}

**Possible errors:** `400` invalid order data, `401` unauthenticated, `403` account not permitted to order, `404` product not found, `409` insufficient stock or conflicting inventory state, `422` invalid business rule, `500` unexpected server error.

**Database operation:** Read and validate product data, calculate prices and totals, create the Order document, decrease product stock, and create corresponding InventoryTransaction records.

These operations must be coordinated safely. A database transaction is one appropriate strategy when the deployment supports it. Conditional stock updates and suitable concurrency controls are also necessary to prevent overselling.

The exact implementation should be tested with simultaneous requests.

### ORD-02: View my orders

**Purpose:** Display the authenticated customer's order history.

**Parameters:** Optional pagination and permitted filters.

**Validation:** Validate pagination and filters.

**Success:** `200 OK` with the current customer's orders.

**Possible errors:** `400`, `401`, or `500`.

**Database operation:** Query Order documents belonging to the authenticated user.

The backend must not accept an arbitrary customer ID as a substitute for the authenticated user's identity.

### ORD-03: View one of my orders

**Purpose:** Retrieve a specific order belonging to the current customer.

**Validation:** Validate the order ID and verify ownership.

**Success:** `200 OK` with the order details.

**Possible errors:** `400` malformed ID, `401` unauthenticated, `404` order not found or not accessible.

**Database operation:** Find the order using both the order identifier and the authenticated customer's identifier.

### ORD-04: View all orders

**Purpose:** Allow administrators to review orders across the shop.

**Parameters:** Optional status, date, customer, and pagination filters.

**Validation:** Validate filter values and pagination.

**Success:** `200 OK` with a paginated list of orders.

**Possible errors:** `400`, `401`, `403`, or `500`.

**Database operation:** Query the Order collection using the authorized filters.

### ORD-05: View a particular order

**Purpose:** Retrieve a specific order for administrative review.

**Validation:** Validate the order ID.

**Success:** `200 OK`.

**Possible errors:** `400`, `401`, `403`, `404`.

**Database operation:** Find the requested Order document and return its permitted details.

### ORD-06: Update order status

**Purpose:** Allow administrators to change an order's processing status.

**Request body:**

{
  "status": "confirmed"
}

**Validation:**

- Only permitted status values may be accepted.
- The backend must verify the current status before changing it.
- Only valid status transitions are permitted.
- The administrator's role must be verified.
- A status update must not silently create inconsistent inventory records.

**Success:** `200 OK` with the updated order.

**Possible errors:** `400` invalid input, `401` unauthenticated, `403` forbidden, `404` order not found, `409` invalid transition or conflicting state.

**Database operation:** Validate the current and requested states, then update the Order document.

The project's final order-status values and transition rules should be agreed upon before implementation. Cancelling an order, for example, may require a coordinated stock-restoration operation.

---

# 15. Administration Endpoints

The administration section provides operational information needed by the shop owner or authorized staff.

| ID | Method and URL | Purpose | Access |
|---|---|---|---|
| ADM-01 | GET /api/admin/dashboard | Retrieve dashboard summaries. | Administrator |
| ADM-02 | GET /api/admin/inventory/low-stock | Retrieve products below their configured stock threshold. | Administrator |
| ADM-03 | GET /api/admin/inventory/transactions | Retrieve inventory activity for administration. | Administrator |

### ADM-01: Dashboard summary

**Purpose:** Provide an overview of the shop's activity.

**Success:** `200 OK`.

Example response:

{
  "success": true,
  "data": {
    "totalProducts": 100,
    "activeProducts": 90,
    "totalCustomers": 250,
    "pendingOrders": 12,
    "lowStockProducts": 5
  }
}

These values are illustrative. The actual totals must be calculated from the database.

**Possible errors:** `401`, `403`, `500`.

**Database operation:** Perform appropriate aggregate queries across products, users, orders, and inventory data.

### ADM-02: Low-stock products

**Purpose:** Identify products that require restocking.

**Parameters:** Optional pagination and category filters.

**Validation:** Validate the supplied filters and pagination.

**Success:** `200 OK` with products below their configured stock threshold.

**Possible errors:** `400`, `401`, `403`, `500`.

**Database operation:** Query the Product collection using the project's stock-threshold rules.

The threshold must be defined in the data model or configuration. It should not be assumed to be the same for every sweet.

### ADM-03: Administrative inventory history

**Purpose:** Provide a dedicated administrative view of inventory activity.

**Validation:** Apply the same filter and authorization rules as the inventory-history endpoint.

**Success:** `200 OK`.

**Possible errors:** `400`, `401`, `403`, `500`.

**Database operation:** Query InventoryTransaction documents with the required administrative filters.

This endpoint may be consolidated with INV-02 if the application does not need a separate administrative route. Avoid maintaining two routes that perform the same operation without a clear reason.

---

# Task 3: Documenting the API Contract

## 16. Standard response format

The backend should use a consistent response structure so that the React frontend can handle success and failure cases predictably.

### Successful response

{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}

For a paginated list, the response may also include a `pagination` object.

### Error response

{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "quantity",
      "message": "Quantity must be greater than zero."
    }
  ]
}

The exact error structure should be consistent throughout the application.

The backend should not expose stack traces, database credentials, internal query details, or other sensitive implementation information to the client.

## 17. Database operations

The proposed API interacts with the five initial models as follows.

| Model | Main responsibility | Example endpoints |
|---|---|---|
| User | Store account and profile information. | Registration, login, customer management. |
| Category | Organize sweets into categories. | List, create, update, and delete categories. |
| Product | Store sweet details, price, active status, and stock. | Product catalogue, product management, inventory updates. |
| Order | Record purchases, quantities, sale prices, totals, and order status. | Create orders, view order history, update order status. |
| InventoryTransaction | Record increases and decreases in stock. | Restocking, order-related stock reductions, inventory history. |

These models have different responsibilities. For example, the Order document records the sale, while InventoryTransaction records the corresponding stock movement.

The API should keep those responsibilities consistent.

---

# Task 4: Research API Security

## 18. Authentication versus authorization

Authentication answers:

"Who are you?"

Authorization answers:

"What are you allowed to do?"

For example, a customer can authenticate successfully and view their own orders. However, that does not authorize them to list every customer's orders or create products.

The backend must perform authorization checks on every protected endpoint.

## 19. Password hashing

Passwords should never be stored as plain text.

When a user registers, the backend should hash the password using an appropriate password-hashing algorithm and store the resulting hash.

During login, the backend verifies the submitted password against the stored hash.

A suitable password-hashing library should be selected and configured securely.

Password hashes must never be returned in API responses.

## 20. JWT-based authentication

JWT stands for JSON Web Token.

A JWT can carry signed claims that the backend uses to identify an authenticated user and validate access.

A typical flow is:

1. The user submits login credentials.
2. The backend verifies the credentials.
3. The backend issues an access token.
4. The frontend sends the token with protected API requests.
5. The backend verifies the token before allowing access.

A JWT must be verified by the backend. The backend must not trust an unverified token or accept a token merely because it contains a particular user ID or role.

Tokens should have an appropriate expiration time, and the system should use a suitable revocation or session strategy when logout or account suspension needs to invalidate access.

HTTPS should be used in deployment to protect credentials and tokens in transit.

## 21. Role-based access control

Role-based access control, or RBAC, grants permissions according to a user's role.

For this project, the proposed roles are:

**Customer**

- Browse public products.
- View permitted product details.
- Manage their own permitted profile information.
- Create orders.
- View their own orders.

**Administrator**

- Create and update products.
- Manage categories.
- Restock products.
- Review inventory transactions.
- View customer records.
- Review all orders.
- Update order statuses.
- View administrative dashboard information.

The backend must verify the authenticated user's actual role before allowing administrative operations.

The registration endpoint must assign the default customer role rather than accepting an unrestricted role from the request.

## 22. Input validation

All endpoints must validate incoming information before performing database operations.

Validation includes:

- Required fields.
- Correct types.
- Acceptable ranges.
- String lengths and formats.
- Valid identifiers.
- Allowed status values.
- Existing resource references.
- Ownership and authorization.
- Inventory availability.
- Business-rule constraints.

Mongoose schema validation is useful, but request-level validation is also needed. Database constraints and safe update logic should protect important invariants.

## 23. Consistent error handling

The backend should use a centralized error-handling strategy.

The application should distinguish validation errors, authentication failures, authorization failures, missing resources, conflicts, and unexpected server errors.

The frontend can then display an appropriate message without needing to interpret arbitrary backend responses.

Sensitive implementation details should remain in server-side logs rather than being exposed to users.

## 24. Protecting private routes

Private routes require authentication middleware.

Administrative routes additionally require authorization middleware that checks the administrator role.

For example:

- `GET /api/products` can be public.
- `GET /api/orders/my` requires authentication.
- `GET /api/orders` requires administrator permissions.
- `POST /api/products` requires administrator permissions.

The backend must also enforce ownership. A customer must not be able to view another customer's order simply by changing the order ID in the URL.

## 25. Why the backend must not trust frontend prices or roles

The frontend is controlled by the client and can be modified.

A customer could attempt to submit a request containing a lower product price:

{
  "productId": "PRODUCT_ID",
  "quantity": 2,
  "unitPrice": 1,
  "role": "admin"
}

The backend must ignore or reject unauthorized fields.

For an order, it should retrieve the trusted product price, calculate the line totals, calculate the order total, and record the sale price.

The backend must also derive the user's identity and permissions from verified authentication information rather than trusting a role or user ID supplied in the body.

Inventory changes must likewise be calculated and authorized on the server.

---

# 26. Additional API Design Decisions

The following decisions should be adopted before implementation.

**API prefix:** Use `/api` consistently.

**Data format:** Accept and return JSON for normal API requests.

**Product deletion:** Prefer deactivation when a product has historical references.

**Inventory updates:** Use dedicated stock operations and maintain an inventory transaction record.

**Order prices:** Store the price at the time of sale so historical orders do not change when catalogue prices change.

**Customer privacy:** Customers can access only their own private records.

**Administrator access:** All administrative routes require server-verified administrator permissions.

**Pagination:** List endpoints should support pagination and enforce a maximum page size.

**Validation:** Validate request bodies, parameters, and query strings before processing them.

**Error responses:** Use a consistent response structure and appropriate HTTP status codes.

**Stock consistency:** Coordinate stock updates and inventory records safely, especially when orders may be submitted concurrently.

**Sensitive fields:** Never return password hashes, authentication secrets, or internal configuration values.

**Authentication strategy:** Decide whether the frontend will use bearer tokens or secure HTTP-only cookies, then document the corresponding storage, logout, and CSRF protections where applicable.

---

# 27. Day 3 Deliverable Summary

The proposed API specification covers the following areas:

| Area | Included |
|---|---|
| Authentication | Registration, login, current user, logout |
| Products | Listing, details, creation, updates, activation and deactivation |
| Categories | Listing, creation, updates, deletion |
| Inventory | Restocking, inventory history, transaction details |
| Customers | Own profile, customer listing, customer details, account status |
| Orders | Order creation, personal history, order details, administrative listing, status updates |
| Administration | Dashboard, low-stock products, inventory activity |
| Security | Authentication, authorization, password hashing, JWT, RBAC, validation |
| Error handling | HTTP status codes and consistent error responses |
| Database integration | User, Category, Product, Order, InventoryTransaction |

## Conclusion

The purpose of Day 3 is to decide how the frontend and backend will communicate before implementing the application's business logic.

The API specification establishes a clear contract for each endpoint, including its purpose, HTTP method, access permissions, request data, validation, responses, errors, and database operations.

This design provides a foundation for implementing the API routes and controllers in the next development phase. The endpoints remain proposed until they are implemented, tested, and verified in the actual project.