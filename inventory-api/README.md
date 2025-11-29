# Inventory Management API

Node.js REST API for the Inventory Management System.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:3000`

## Default Credentials

```
Email: admin@inventory.com
Password: admin123
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/me` | Update profile (protected) |

### Products (Protected - requires token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/meta/categories` | Get all categories |

**Query Parameters for GET /api/products:**
- `category` - Filter by category
- `stockStatus` - Filter by stock status (critical, low, sufficient)
- `search` - Search by name or SKU

### Stock History (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get all stock history |
| GET | `/api/history/product/:productId` | Get history for specific product |
| GET | `/api/history/stats/summary` | Get stock history statistics |

## Authentication

Use JWT Bearer token in Authorization header:

```
Authorization: Bearer <your-token>
```

## Example Requests

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@inventory.com", "password": "admin123"}'
```

### Get Products
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer <your-token>"
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "New Product",
    "category": "Electronics",
    "sku": "EL-NP-001",
    "quantity": 50,
    "price": 99.99,
    "supplier": "Supplier Name"
  }'
```

## Environment Variables

Create a `.env` file:

```
PORT=3000
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

## Project Structure

```
inventory-api/
├── data/
│   └── database.js      # In-memory database
├── middleware/
│   └── auth.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── product.routes.js
│   └── history.routes.js
├── scripts/
│   └── generate-hash.js
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Notes

- Currently uses **in-memory storage** (data resets on server restart)
- For production, connect to a real database (MongoDB, PostgreSQL, etc.)
- Change `JWT_SECRET` in production
