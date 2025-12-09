import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

/**
 * APPLICATION ROUTES
 * 
 * Route protection:
 * - guestGuard: Only unauthenticated users (login page)
 * - authGuard: Only authenticated users (dashboard, inventory, etc.)
 * 
 * Lazy loading: Components load only when route is accessed (improves performance)
 * Animation data: Used for page transition animations
 */
export const routes: Routes = [
  // ========== PUBLIC ROUTES ==========
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard], // Only show login to non-logged-in users
    title: 'Login - Inventory Tracker',
    data: { animation: 'login' }
  },

  // ========== PROTECTED ROUTES (Require Login) ==========
  {
    path: '',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Inventory Tracker',
    data: { animation: 'dashboard' }
  },
  {
    path: 'history',
    loadComponent: () => import('./components/stock-history/stock-history.component').then(m => m.StockHistoryComponent),
    canActivate: [authGuard],
    title: 'Stock History - Inventory Tracker',
    data: { animation: 'history' }
  },
  {
    path: 'help',
    loadComponent: () => import('./components/help/help.component').then(m => m.HelpComponent),
    canActivate: [authGuard],
    title: 'Help & Support - Inventory Tracker',
    data: { animation: 'help' }
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    canActivate: [authGuard],
    title: 'Product Details - Inventory Tracker',
    data: { animation: 'productDetail' }
  },

  // ========== FALLBACK ROUTE ==========
  {
    path: '**',
    redirectTo: '', // Redirect unknown routes to dashboard
    pathMatch: 'full'
  }
];
