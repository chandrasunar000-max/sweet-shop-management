# Sweet Shop Management System

## 1. Project Overview

The Sweet Shop Management System is a web-based application designed to help manage sweet shop operations, including product information, categories, inventory, customer accounts, and orders.

This project is being developed in phases. The current phase focuses on project initialization, database connectivity, and database modeling.

## 2. Technology Stack

Frontend:
- React.js
- Vite

Backend:
- Node.js
- Express.js

Database:
- MongoDB
- Mongoose

## 3. Project Structure

```text
sweet-shop-management/
├── backend/
│   ├── config/
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── InventoryTransaction.js
│   ├── .env
│   └── server.js
├── frontend/
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 4. Prerequisites

Install the following software before running the project:

- Node.js and npm
- MongoDB Community Server
- Visual Studio Code

## 5. Database Configuration

The project uses MongoDB as its database and Mongoose to define schemas and manage database connections.

Create a `.env` file inside the `backend` directory with the following variable:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/sweetshop
PORT=5000
```

The `.env` file contains local configuration and must not be committed to Git.

## 6. Database Models

The project currently includes five Mongoose models:

1. User — stores user information, email, password hash, and role.
2. Category — stores sweet product categories.
3. Product — stores product details, price, category reference, and available stock.
4. Order — stores customer orders, purchased items, prices, and order status.
5. InventoryTransaction — records stock changes, including restocking and sales.

## 7. Running the Backend

From the project root directory, install the dependencies if necessary:

```bash
npm install
```

Start the backend:

```bash
npm start
```

The backend runs on port 5000 by default.

For development:

```bash
npm run dev
```

## 8. Health Check

After starting the backend, open the following address in your browser:

`http://localhost:5000/api/health`

A successful response confirms that the backend is running and reports the database connection status.

## 9. Environment Variables and Security

- Never commit `.env` files containing secrets or credentials.
- Keep `.env.example` files for documenting required configuration variables.
- Passwords must be securely hashed before being stored.
- Database access and application features should be protected appropriately as development progresses.

## 10. Current Development Status

Completed:
- Initialized the project repository.
- Configured the backend startup script.
- Configured the local MongoDB connection.
- Created the five initial Mongoose models.
- Tested model imports and basic schema validation.
- Created a `.gitignore` file.

Pending:
- Verify frontend startup.
- Finalize database relationship documentation.
- Complete project documentation and validation evidence.
- Review the initial database design before implementing business APIs.

No product, authentication, cart, or order-processing APIs have been implemented as part of this initial database-modeling phase.
## 11. Database Relationships

The Sweet Shop Management System contains five initial database models: User, Category, Product, Order, and InventoryTransaction.

### 11.1 User and Order
- One user can place multiple orders.
- Each order belongs to one user.
- Relationship: One-to-Many.

### 11.2 Category and Product
- One category can contain multiple products.
- Each product belongs to one category.
- Relationship: One-to-Many.

### 11.3 Product and Order
- One order can contain multiple products through its embedded `items` array.
- Each order item stores the product reference, product name, unit price, quantity, and subtotal.
- The unit price is saved at the time of purchase so that later product price changes do not alter historical order details.

### 11.4 Product and InventoryTransaction
- One product can have multiple inventory transactions.
- Each inventory transaction references one product.
- Relationship: One-to-Many.

### 11.5 User and InventoryTransaction
- One user can perform multiple inventory transactions.
- Each inventory transaction records the user who performed the action.
- Relationship: One-to-Many.

### 11.6 Order and InventoryTransaction
- An inventory transaction may reference an order.
- The order reference is optional because not every stock change is related to a customer order.

### 11.7 Database Design Notes
- Mongoose ObjectId references are used to connect related models.
- Order items are embedded documents inside the Order model.
- Inventory transactions record stock changes for traceability.
- Stock updates must be validated to prevent inventory from becoming negative.
[View Database Relationship Diagram](./sweet-shop.drawio)
