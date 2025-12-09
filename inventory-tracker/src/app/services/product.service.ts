import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { 
  Product, 
  StockHistoryEntry, 
  ProductFilter, 
  StockStatus,
  DEFAULT_STOCK_THRESHOLDS,
  PRODUCT_CATEGORIES 
} from '../models/product.model';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * ProductService handles all product data and inventory operations
 * - Loads products from API
 * - Manages product CRUD (create, read, update, delete)
 * - Tracks stock history and inventory changes
 * - Uses signals for reactive state updates
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // ========== API ENDPOINTS ==========
  private readonly API_URL = `${environment.apiUrl}/products`;
  private readonly HISTORY_URL = `${environment.apiUrl}/history`;
  
  // ========== STATE SIGNALS ==========
  // These automatically update the UI when data changes
  private productsSignal = signal<Product[]>([]);
  private stockHistorySignal = signal<StockHistoryEntry[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Public read-only signals (components use these)
  readonly products = this.productsSignal.asReadonly();
  readonly stockHistory = this.stockHistorySignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  
  // Available product categories
  readonly categories = PRODUCT_CATEGORIES;
  
  constructor(private http: HttpClient) {}

  // ========== PRODUCT DATA LOADING ==========

  /**
   * Get stock status based on current quantity
   * - 'critical': quantity = 0
   * - 'low': quantity <= minStock
   * - 'sufficient': quantity > minStock
   */
  getStockStatus(quantity: number, minStock: number = DEFAULT_STOCK_THRESHOLDS.low): StockStatus {
    if (quantity <= 0) {
      return 'critical';
    } else if (quantity <= minStock) {
      return 'low';
    }
    return 'sufficient';
  }

  /**
   * Load all products from API
   * Applies optional filters (search, category, stock status)
   * Sorts by newest first (createdAt descending)
   */
  loadProducts(filter?: ProductFilter): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    // Build query parameters from filter
    let params = new HttpParams();
    if (filter?.searchTerm) {
      params = params.set('search', filter.searchTerm);
    }
    if (filter?.category && filter.category !== 'all') {
      params = params.set('category', filter.category);
    }
    if (filter?.stockStatus && filter.stockStatus !== 'all') {
      params = params.set('stockStatus', filter.stockStatus);
    }
    
    this.http.get<{ products: Product[] }>(this.API_URL, { params }).pipe(
      map(response => response.products),
      catchError((error) => {
        this.errorSignal.set(error.error?.message || 'Failed to load products');
        this.loadingSignal.set(false);
        return of([]);
      })
    ).subscribe({
      next: (products) => {
        // Sort newest products first
        const sorted = (products || []).slice().sort((a, b) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          return tb - ta; // Descending order (newest first)
        });
        this.productsSignal.set(sorted);
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Load stock history from API (shows all quantity changes)
   * Optional limit parameter to get last N records
   */
  loadStockHistory(limit: number = 100): Observable<StockHistoryEntry[]> {
    return this.http.get<{ data: StockHistoryEntry[], total: number }>(this.HISTORY_URL, {
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      map(response => response.data || []),
      tap(history => this.stockHistorySignal.set(history)),
      catchError(() => of([]))
    );
  }

  // ========== FILTERING ==========

  /**
   * Filter products locally (client-side)
   * Filters by: search term, category, stock status
   */
  getFilteredProducts(filter: ProductFilter): Product[] {
    let filtered = this.productsSignal() || [];
    
    // Search by name or SKU
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.sku.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter(p => p.category === filter.category);
    }
    
    // Filter by stock status (critical, low, or sufficient)
    if (filter.stockStatus && filter.stockStatus !== 'all') {
      filtered = filtered.filter(p => 
        this.getStockStatus(p.quantity, p.minStock) === filter.stockStatus
      );
    }
    
    return filtered;
  }

  // ========== CRUD OPERATIONS ==========

  /**
   * Get single product by ID
   */
  getProduct(id: string): Observable<Product> {
    return this.http.get<{ product: Product }>(`${this.API_URL}/${id}`).pipe(
      map(response => response.product),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Product not found'));
      })
    );
  }

  /**
   * Create new product
   * New product automatically appears at top of list
   */
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    return this.http.post<{ product: Product }>(this.API_URL, product).pipe(
      map(response => response.product),
      tap((p) => {
        // Add to beginning so newest product is first
        this.productsSignal.update(products => [p, ...products]);
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Failed to create product'));
      })
    );
  }

  /**
   * Update product details (name, price, category, etc.)
   * Refreshes the product in the list
   */
  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    return this.http.put<{ product: Product }>(`${this.API_URL}/${id}`, updates).pipe(
      map(response => response.product),
      tap((p) => {
        // Update the product in the list
        this.productsSignal.update(products => 
          products.map(prod => prod.id === id ? p : prod)
        );
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Failed to update product'));
      })
    );
  }

  /**
   * Update product stock quantity
   * Records the change in stock history
   */
  updateStock(id: string, quantity: number, reason?: string): Observable<Product> {
    return this.http.patch<{ product: Product }>(`${this.API_URL}/${id}/stock`, { 
      quantity, 
      reason 
    }).pipe(
      map(response => response.product),
      tap((p) => {
        // Update product in list
        this.productsSignal.update(products => 
          products.map(prod => prod.id === id ? p : prod)
        );
        // Refresh stock history to show new entry
        this.loadStockHistory();
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Failed to update stock'));
      })
    );
  }

  /**
   * Delete product from inventory
   * Removes from product list and API
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Remove from list
        this.productsSignal.update(products => 
          products.filter(p => p.id !== id)
        );
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Failed to delete product'));
      })
    );
  }

  // ========== LOCAL STATE QUERIES ==========

  /**
   * Get product from local state by ID (doesn't call API)
   */
  getProductById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }
  
  // Get stock history for a specific product
  getProductHistory(productId: string): Observable<StockHistoryEntry[]> {
    return this.http.get<{ product: any, history: StockHistoryEntry[] }>(
      `${this.HISTORY_URL}/product/${productId}`
    ).pipe(
      map(response => response.history || []),
      catchError(() => of([]))
    );
  }
  
  // Get stock history from local state
  getProductStockHistory(productId: string): StockHistoryEntry[] {
    return this.stockHistorySignal().filter(h => h.productId === productId);
  }
}
