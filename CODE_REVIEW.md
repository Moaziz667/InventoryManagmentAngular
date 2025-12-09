# Code Review Guide - Inventory Tracker Application

This document explains the architecture and design of the Inventory Tracker application in a way that's easy to understand for a code review.

---

## 📋 Project Overview

**Inventory Tracker** is a full-stack web application that helps small businesses manage their product inventory. Users can add products, track stock levels, and view history of all inventory changes.

### Tech Stack
- **Frontend**: Angular 20 (TypeScript, standalone components)
- **Backend**: Node.js + Express.js
- **Database**: In-memory storage (can be upgraded to MongoDB/PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **UI Framework**: Angular Material

---

## 🏗️ Architecture

### Three Main Layers

```
┌─────────────────────────────────────────┐
│     COMPONENTS (What users see)         │
│  Dashboard, Products, Stock History     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     SERVICES (Business logic)           │
│  Auth, Products, HTTP calls             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     API (Backend endpoints)             │
│  Express.js server with JWT auth        │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
InventoryManagment/
├── inventory-tracker/          # Angular frontend
│   ├── src/app/
│   │   ├── components/         # UI Components
│   │   │   ├── login/          # Login page
│   │   │   ├── dashboard/      # Main product list
│   │   │   ├── product-card/   # Product display card
│   │   │   ├── product-detail/ # Product details page
│   │   │   ├── stock-history/  # Stock history table
│   │   │   └── help/           # Help & documentation
│   │   ├── services/           # API communication
│   │   │   ├── auth.service.ts     # Authentication logic
│   │   │   └── product.service.ts  # Product CRUD operations
│   │   ├── guards/             # Route protection
│   │   │   └── auth.guard.ts       # Checks if user is logged in
│   │   ├── interceptors/       # HTTP middleware
│   │   │   └── auth.interceptor.ts # Adds auth token to requests
│   │   ├── models/             # Data interfaces
│   │   │   └── product.model.ts    # Product & Stock types
│   │   └── app.routes.ts       # URL routing
│   └── package.json            # Frontend dependencies
│
├── inventory-api/              # Node.js/Express backend
│   ├── routes/                 # API endpoints
│   │   ├── auth.routes.js      # Login/register endpoints
│   │   ├── product.routes.js   # Product CRUD endpoints
│   │   └── history.routes.js   # Stock history endpoints
│   ├── middleware/
│   │   └── auth.middleware.js  # Validates JWT tokens
│   ├── data/
│   │   └── database.js         # In-memory database
│   ├── server.js               # Express app setup
│   └── package.json            # Backend dependencies
│
└── README.md                   # Project documentation
```

---

## 🔐 Authentication Flow

### How Login Works

```
User enters email/password
    ↓
LoginComponent submits form
    ↓
AuthService.login() → POST /api/auth/login
    ↓
Backend validates credentials
    ↓
Returns JWT token + user data
    ↓
AuthService stores token in localStorage
    ↓
User redirected to Dashboard
```

### How Protected Routes Work

1. User tries to access `/dashboard`
2. **authGuard** checks: Is user logged in?
3. If YES → Show dashboard
4. If NO → Redirect to login page

---

## 🔄 Data Flow Example: Creating a Product

```
1. USER ACTION
   User fills form & clicks "Add Product"

2. COMPONENT (dashboard.component.ts)
   → Calls productService.createProduct(formData)

3. SERVICE (product.service.ts)
   → Prepares data
   → Calls HTTP POST /api/products
   → Updates local products list (signal)
   → Components automatically re-render

4. BACKEND (inventory-api/routes/product.routes.js)
   → Validates product data
   → Saves to database
   → Returns new product with ID

5. UI UPDATES
   → Product appears in dashboard
   → User sees success message
```

---

## 📊 Key Concepts

### 1. **Signals** (Angular State Management)
What are signals? Simple reactive variables that automatically update the UI.

```typescript
// Create a signal
private productsSignal = signal<Product[]>([]);

// Read it
const products = productsSignal();

// Update it
productsSignal.set(newProducts);

// Components automatically re-render when signal changes
```

**Why we use them:**
- No need for manual change detection
- Cleaner than RxJS observables
- Better performance

### 2. **Observables** (Async Operations)
Used for HTTP requests that take time.

```typescript
// Service method returns Observable
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>('/api/products');
}

// Component subscribes to it
this.productService.getProducts().subscribe(products => {
  this.productsSignal.set(products); // Update signal when data arrives
});
```

**Why we use them:**
- Handle network delays
- Can cancel requests
- Can retry on failure

### 3. **Guards** (Route Protection)
Prevent unauthorized access to pages.

```typescript
// authGuard: Only logged-in users
if (authService.isAuthenticated()) {
  return true; // Allow access
}
router.navigate(['/login']); // Redirect if not logged in
return false;
```

### 4. **Interceptors** (HTTP Middleware)
Automatically add auth token to every API request.

```typescript
// Before sending request
const clonedReq = req.clone({
  headers: req.headers.set('Authorization', `Bearer ${token}`)
});
```

---

## 📋 Service Layer (Business Logic)

### AuthService
**Responsible for:**
- User login/register
- Storing auth tokens
- Checking if user is authenticated

**Key Methods:**
```typescript
login(email, password)      // Log user in
logout()                    // Clear auth & redirect
getToken()                  // Get stored JWT token
getCurrentUser()            // Fetch user info from API
```

### ProductService
**Responsible for:**
- Loading products from API
- Creating/updating/deleting products
- Tracking stock changes
- Filtering products

**Key Methods:**
```typescript
loadProducts(filter)        // Get all products with optional filters
getProduct(id)              // Get one product by ID
createProduct(data)         // Add new product
updateProduct(id, changes)  // Edit product
updateStock(id, quantity)   // Change quantity & log history
deleteProduct(id)           // Remove product
```

---

## 🎨 Component Structure

### DashboardComponent
**What it does:**
- Shows list of all products
- Has search & filter options
- Allows creating/editing/deleting products

**Flow:**
1. On page load → `loadProducts()` from service
2. Displays products in grid
3. User can search/filter
4. Products update in real-time

### ProductDetailComponent
**What it does:**
- Shows detailed view of one product
- Displays stock history for that product
- Allows editing product info

**Shows:**
- Product image, name, price
- Current stock level
- Stock status (Critical/Low/Sufficient)
- History of all stock changes

### StockHistoryComponent
**What it does:**
- Table view of ALL stock changes across ALL products
- Shows who changed it, when, and why

---

## 🛡️ Error Handling

### Service Level
```typescript
// Catch API errors and show user-friendly message
catchError(error => {
  const message = error.error?.message || 'Failed to load products';
  this.errorSignal.set(message);
  return of([]); // Return empty array on error
})
```

### Component Level
```typescript
// Show error message to user
if (error) {
  this.snackBar.open('Error: ' + error, 'Close', { duration: 5000 });
}
```

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/login          Login user
POST /api/auth/register       Create new account
GET  /api/auth/me             Get current user info
PUT  /api/auth/me             Update user profile
```

### Products
```
GET    /api/products          Get all products
GET    /api/products/:id      Get one product
POST   /api/products          Create product
PUT    /api/products/:id      Update product
PATCH  /api/products/:id/stock   Update stock quantity
DELETE /api/products/:id      Delete product
```

### Stock History
```
GET /api/history              Get all history
GET /api/history/product/:id  Get history for one product
```

---

## 🚀 Performance Optimizations

### 1. **Lazy Loading**
Components load only when user visits that page
```typescript
loadComponent: () => import('./dashboard.component')
```

### 2. **Change Detection**
Signals only update components that need updating (not whole page)

### 3. **OnPush Strategy**
Components marked for manual change detection when data changes

### 4. **HTTP Caching**
Stock history cached to avoid duplicate requests

---

## 🔒 Security Features

### 1. **JWT Authentication**
- Every request includes token in `Authorization` header
- Backend validates token on every request
- Token stored securely in localStorage

### 2. **Password Hashing**
- Passwords hashed with bcryptjs (never stored plain text)
- Salt rounds: 10 (makes cracking very hard)

### 3. **CORS**
- Backend only accepts requests from frontend domain

### 4. **Environment Variables**
- API URL stored in `environment.ts` (not hardcoded)

---

## 📝 How to Explain to Your Professor

### Main Points to Cover:

1. **Architecture**
   - "We have 3 layers: Components (UI), Services (logic), Backend (API)"
   - "Each layer has a specific responsibility"

2. **Authentication**
   - "Guards prevent unauthorized access"
   - "Interceptors automatically add auth token to requests"

3. **State Management**
   - "Signals automatically update UI when data changes"
   - "No need for complex Redux-like patterns"

4. **Data Flow**
   - "User action → Component → Service → API → Signal → UI"
   - "Everything flows in one direction"

5. **Code Organization**
   - "Services handle API communication"
   - "Components handle UI logic"
   - "Guards handle security"
   - "Models define data types"

---

## 🧪 Testing Checklist

When demonstrating to your professor, test these scenarios:

- [ ] **Login**: Enter correct credentials → logged in
- [ ] **Login Fail**: Enter wrong password → error message
- [ ] **Create Product**: Add new product → appears at top of list
- [ ] **Update Stock**: Change quantity → history updated
- [ ] **Filter**: Search by name → shows matching products
- [ ] **Stock Status**: Product with 0 stock → marked "Critical"
- [ ] **Logout**: Click logout → redirected to login
- [ ] **Protected Route**: Try accessing /dashboard without login → redirected

---

## 💡 Design Patterns Used

| Pattern | Used For | Example |
|---------|----------|---------|
| **Dependency Injection** | Inject services into components | `constructor(private service: ProductService)` |
| **Guard Pattern** | Control route access | `authGuard` checks authentication |
| **Interceptor Pattern** | Modify all HTTP requests | Auto-add token to headers |
| **Observable Pattern** | Handle async operations | HTTP requests return Observable |
| **Signal Pattern** | Reactive state | `signal<Product[]>` |
| **Lazy Loading** | Load code on demand | Routes load components when needed |

---

## 📚 Key Technologies Explained

### Angular
- Frontend framework for building interactive web apps
- Standalone components (modern approach, less boilerplate)

### Signals
- Angular's new reactivity system (like React hooks)
- Automatically re-render when data changes

### RxJS Observables
- Handle time-based operations (network requests, timers)
- Allow transforming data with `map`, `filter`, `tap` etc.

### Angular Material
- Pre-built beautiful UI components
- Cards, buttons, tables, dialogs, etc.

### JWT (JSON Web Tokens)
- Secure way to authenticate users
- Token contains user info, signed by server
- Can't be forged (requires server's secret key)

### Express.js
- Node.js framework for building APIs
- Simple and lightweight

---

## 🎓 Key Takeaways

1. **Clear Architecture**: Separation of concerns (UI, logic, data)
2. **Type Safety**: TypeScript interfaces prevent bugs
3. **Reactive UI**: Signals automatically update without manual refresh
4. **Security**: JWT auth + route guards + bcrypt passwords
5. **User Experience**: Loading states, error messages, animations
6. **Scalability**: Can replace in-memory DB with MongoDB/PostgreSQL

---

## 📞 Quick Reference

**How to start the app:**
```bash
# Terminal 1: Backend
cd inventory-api
npm install
npm run dev

# Terminal 2: Frontend
cd inventory-tracker
npm install
npm start
```

**Default login:**
- Email: `admin@inventory.com`
- Password: `admin123`

---

## 🎯 Summary for Your Professor

> "This application demonstrates a modern full-stack web development approach using Angular and Node.js. The frontend uses signals for reactive state management, while the backend provides RESTful API endpoints secured with JWT authentication. The code is organized into clear layers (components, services, routes) making it maintainable and scalable."

---

**Good luck with your code review!** 🚀
