# Developer Notes - Quick Reference Guide

## 🚀 Quick Start

```bash
# Terminal 1: Start Backend
cd inventory-api
npm install
npm run dev
# Runs on: http://localhost:3000

# Terminal 2: Start Frontend
cd inventory-tracker
npm install
npm start
# Opens: http://localhost:4200
```

**Test Login:**
- Email: `admin@inventory.com`
- Password: `admin123`

---

## 📂 Where to Find Things

### Frontend Code Structure
```
src/app/
├── components/           # What users see
│   ├── dashboard/        # Main product list (entry point)
│   ├── login/           # Login page
│   ├── product-detail/  # Individual product page
│   ├── stock-history/   # All stock changes across products
│   └── help/            # Help & FAQ page
├── services/            # API communication
│   ├── auth.service.ts  # Login logic
│   └── product.service.ts # Product CRUD
├── guards/              # Security
│   └── auth.guard.ts    # Checks if user logged in
├── interceptors/        # HTTP middleware
│   └── auth.interceptor.ts # Auto-add token to requests
├── models/              # Data types
│   └── product.model.ts # Product interface
└── app.routes.ts        # URL routing (pages)
```

### Backend Code Structure
```
inventory-api/
├── routes/
│   ├── auth.routes.js       # Login endpoint
│   ├── product.routes.js    # Product CRUD endpoints
│   └── history.routes.js    # Stock history endpoints
├── middleware/
│   └── auth.middleware.js   # Validates JWT tokens
├── data/
│   └── database.js          # In-memory database (seed data)
└── server.js                # Express app setup
```

---

## 🔄 Common Tasks

### Add a New API Endpoint

1. **Backend** (`inventory-api/routes/product.routes.js`):
```javascript
// Add this route
router.post('/bulk-import', authMiddleware, (req, res) => {
  try {
    // Your logic here
    res.json({ message: 'Success', data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

2. **Frontend Service** (`src/app/services/product.service.ts`):
```typescript
// Add this method
bulkImport(products: any[]): Observable<any> {
  return this.http.post(`${this.API_URL}/bulk-import`, { products }).pipe(
    tap(response => {
      // Update signals if needed
      this.productsSignal.update(existing => [...existing, ...response.data]);
    })
  );
}
```

3. **Frontend Component** (e.g., `dashboard.component.ts`):
```typescript
// Call the service method
this.productService.bulkImport(csvData).subscribe({
  next: (result) => {
    this.snackBar.open('Imported successfully!', 'Close');
  },
  error: (error) => {
    this.snackBar.open('Import failed: ' + error.message, 'Close');
  }
});
```

---

### Add a New Page

1. **Create Component:**
```bash
cd src/app/components
mkdir reports
# Create reports.component.ts, .html, .scss files
```

2. **Add Route** (`app.routes.ts`):
```typescript
{
  path: 'reports',
  loadComponent: () => import('./components/reports/reports.component')
    .then(m => m.ReportsComponent),
  canActivate: [authGuard],
  title: 'Reports - Inventory Tracker',
  data: { animation: 'reports' }
},
```

3. **Add Nav Link** (`app.html`):
```html
<a routerLink="/reports" routerLinkActive="active">
  <mat-icon>bar_chart</mat-icon>
  <span>Reports</span>
</a>
```

---

### Update Product Fields

Example: Add "Barcode" field

1. **Update Model** (`product.model.ts`):
```typescript
export interface Product {
  // ... existing fields ...
  barcode?: string;  // New field
}
```

2. **Update Service** (No change needed, service is generic)

3. **Update Backend Database** (`inventory-api/data/database.js`):
```javascript
const product = {
  // ... existing fields ...
  barcode: '1234567890',  // Add to seed data
};
```

4. **Update Components** that display products:
```typescript
// In template (.html):
<p>Barcode: {{ product.barcode }}</p>

// In edit form, add field to form controls
```

---

## 🧠 How Data Flows

### Example: Creating a Product

```
1. User fills form & clicks "Create"
   └─> dashboard.component.ts

2. Component calls service
   └─> productService.createProduct(formData)

3. Service sends HTTP request
   └─> POST http://localhost:3000/api/products
   └─> Includes "Authorization: Bearer {token}" header (auto-added by interceptor)

4. Backend receives request
   └─> auth.middleware validates token
   └─> product.routes.js handles POST /products
   └─> Saves to db.products array
   └─> Returns new product with ID

5. Service updates local state
   └─> productsSignal.update(products => [newProduct, ...products])

6. UI automatically updates
   └─> Dashboard shows new product at top of list
   └─> User sees success message
```

---

## 🔐 Authentication Flow

### Login
```
User enters email/password
  ↓
authService.login() calls POST /api/auth/login
  ↓
Backend validates credentials (bcrypt)
  ↓
Creates JWT token (expires in 24 hours)
  ↓
Frontend stores token in localStorage
  ↓
authService sets isAuthenticated signal to true
  ↓
Components show based on authentication state
```

### Protected Routes
```
User tries to visit /dashboard
  ↓
authGuard checks: authService.isAuthenticated()
  ↓
If TRUE → show dashboard
If FALSE → redirect to /login
```

### API Requests
```
Component calls service method
  ↓
Service makes HTTP request
  ↓
authInterceptor auto-adds token to header
  ↓
Backend validates token with authMiddleware
  ↓
If valid → process request
If invalid → return 401 Unauthorized
```

---

## 📝 Key Signals in the App

| Signal | Purpose | Updated By |
|--------|---------|-----------|
| `currentUser` | Logged-in user info | AuthService on login |
| `isAuthenticated` | Is user logged in? | AuthService on login/logout |
| `products` | List of all products | ProductService on load/update/delete |
| `stockHistory` | All inventory changes | ProductService on history load |
| `loading` | Is data being fetched? | Services during HTTP requests |
| `error` | Last error message | Services on API errors |

**How to use in components:**
```typescript
// Read signal value
const user = this.authService.currentUser();

// Watch for changes (re-runs when signal updates)
ngOnInit() {
  effect(() => {
    console.log('User changed:', this.authService.currentUser());
  });
}

// Use in templates
<p>{{ authService.currentUser()?.name }}</p>
```

---

## 🧪 Testing the App

### Test Scenarios Checklist

- [ ] **Login**
  - Correct credentials → logged in
  - Wrong password → error message

- [ ] **Dashboard**
  - Products load on page open
  - Can search by name/SKU
  - Can filter by category
  - Can filter by stock status
  - Newest products appear first

- [ ] **Create Product**
  - Form shows validation errors if empty
  - New product appears at top of list
  - Stock status shows correctly

- [ ] **Update Product**
  - Can edit name, price, category
  - Changes save and reflect in list

- [ ] **Update Stock**
  - Can increase/decrease quantity
  - Stock history entry created
  - Stock status updates accordingly

- [ ] **Stock History**
  - Shows all changes across all products
  - Can see previous and new quantities
  - Shows reason for change
  - Newest entries appear first

- [ ] **Delete Product**
  - Product disappears from list
  - Removed from database

- [ ] **Logout**
  - Clears auth token
  - Redirects to login
  - Cannot access /dashboard

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot GET /api/products"
**Cause:** Backend not running
**Solution:** Start backend: `cd inventory-api && npm run dev`

### Issue: "Unauthorized" errors on API calls
**Cause:** Token expired or invalid
**Solution:** Logout and login again to get fresh token

### Issue: Products not updating in real-time
**Cause:** Using `.subscribe()` without updating signals
**Solution:** Make sure service updates signals: `this.productsSignal.set(newData)`

### Issue: Styles not applying
**Cause:** SCSS file not linked
**Solution:** Check component has `styleUrl: './component.scss'` in decorator

### Issue: "Cannot find module" error
**Cause:** Import path wrong
**Solution:** Check file exists and import path is relative: `'./components/login/login.component'`

---

## 📊 Database Schema (In-Memory)

### Users
```javascript
{
  id: string,
  name: string,
  email: string,
  password: string, // bcrypt hashed
  role: 'admin' | 'user',
  createdAt: Date
}
```

### Products
```javascript
{
  id: string,
  name: string,
  category: string,
  sku: string,
  quantity: number,
  minStock: number,
  price: number,
  description?: string,
  supplier?: string,
  imageUrl?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Stock History
```javascript
{
  id: string,
  productId: string,
  productName: string,
  previousQuantity: number,
  newQuantity: number,
  changeAmount: number,
  changeType: 'increase' | 'decrease' | 'set',
  timestamp: Date,
  notes?: string
}
```

---

## 🔧 Useful Commands

```bash
# Frontend
npm start          # Start dev server on port 4200
npm run build      # Build for production
npm test           # Run unit tests
npm lint           # Check code style

# Backend
npm run dev        # Start with hot reload (nodemon)
npm start          # Start production server
npm test           # Run tests
```

---

## 📚 Technology Versions

Check `package.json` in both folders:

- **Angular:** v20.x
- **TypeScript:** v5.x
- **Node.js:** v18+ (recommended)
- **Angular Material:** v20.x
- **Express.js:** v5.x
- **JWT:** jsonwebtoken
- **Password Hashing:** bcryptjs

---

## 🎯 Key Concepts Quick Ref

**Signals** = Reactive variables that auto-update UI
```typescript
private count = signal(0);
count(); // Read
count.set(5); // Write
count.update(c => c + 1); // Update
```

**Observables** = Handle async operations
```typescript
getData(): Observable<Data> {
  return this.http.get('/api/data');
}
// In component
this.service.getData().subscribe(data => {
  this.signal.set(data);
});
```

**Guards** = Protect routes
```typescript
if (authService.isAuthenticated()) {
  return true; // Allow
}
return false; // Deny
```

**Interceptors** = Modify all HTTP requests
```typescript
const clonedReq = req.clone({
  headers: req.headers.set('Authorization', `Bearer ${token}`)
});
```

---

## 📞 Quick Links

- **Angular Docs:** https://angular.io/docs
- **Angular Material:** https://material.angular.io
- **Express.js Docs:** https://expressjs.com
- **JWT Info:** https://jwt.io/introduction
- **bcryptjs:** https://github.com/dcodeIO/bcrypt.js

---

## 💡 Tips for Code Review

1. **Focus on the flow**, not individual lines
2. **Show the data journey:** User action → Component → Service → API
3. **Highlight security:** JWT tokens, route guards, password hashing
4. **Mention scalability:** Can replace in-memory DB with MongoDB
5. **Point out best practices:** Signals, lazy loading, error handling

Good luck with your review! 🚀
