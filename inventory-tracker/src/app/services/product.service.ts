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

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;
  private readonly HISTORY_URL = `${environment.apiUrl}/history`;
  
  // Using signals for reactive state management
  private productsSignal = signal<Product[]>([]);
  private stockHistorySignal = signal<StockHistoryEntry[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  
  // Public readonly signals
  readonly products = this.productsSignal.asReadonly();
  readonly stockHistory = this.stockHistorySignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  
  // Categories
  readonly categories = PRODUCT_CATEGORIES;
  
  constructor(private http: HttpClient) {}
  
  // Get stock status based on quantity and minStock
  getStockStatus(quantity: number, minStock: number = DEFAULT_STOCK_THRESHOLDS.low): StockStatus {
    if (quantity <= 0) {
      return 'critical';
    } else if (quantity <= minStock) {
      return 'low';
    }
    return 'sufficient';
  }
  
  // Load all products from API
  loadProducts(filter?: ProductFilter): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
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
        // Sort by createdAt descending so newest products appear first
        const sorted = (products || []).slice().sort((a, b) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          return tb - ta;
        });
        this.productsSignal.set(sorted);
        this.loadingSignal.set(false);
      }
    });
  }
  
  // Load stock history from API
  loadStockHistory(limit: number = 100): Observable<StockHistoryEntry[]> {
    return this.http.get<{ data: StockHistoryEntry[], total: number }>(this.HISTORY_URL, {
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      map(response => response.data || []),
      tap(history => this.stockHistorySignal.set(history)),
      catchError(() => of([]))
    );
  }
  
  // Get filtered products (client-side filtering for local state)
  getFilteredProducts(filter: ProductFilter): Product[] {
    let filtered = this.productsSignal() || [];
    
    // Filter by search term
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
    
    // Filter by stock status
    if (filter.stockStatus && filter.stockStatus !== 'all') {
      filtered = filtered.filter(p => 
        this.getStockStatus(p.quantity, p.minStock) === filter.stockStatus
      );
    }
    
    return filtered;
  }
  
  // Get single product by ID
  getProduct(id: string): Observable<Product> {
    return this.http.get<{ product: Product }>(`${this.API_URL}/${id}`).pipe(
      map(response => response.product),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Product not found'));
      })
    );
  }
  
  // Create product
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    return this.http.post<{ product: Product }>(this.API_URL, product).pipe(
      map(response => response.product),
      tap((p) => {
        // Insert new product at beginning so it appears first
        this.productsSignal.update(products => [p, ...products]);
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Failed to create product'));
      })
    );
  }
  
  // Update product
  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    return this.http.put<{ product: Product }>(`${this.API_URL}/${id}`, updates).pipe(
      map(response => response.product),
      tap((p) => {
        this.productsSignal.update(products => 
          products.map(prod => prod.id === id ? p : prod)
        );
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Failed to update product'));
      })
    );
  }
  
  // Update stock quantity
  updateStock(id: string, quantity: number, reason?: string): Observable<Product> {
    return this.http.patch<{ product: Product }>(`${this.API_URL}/${id}/stock`, { 
      quantity, 
      reason 
    }).pipe(
      map(response => response.product),
      tap((p) => {
        this.productsSignal.update(products => 
          products.map(prod => prod.id === id ? p : prod)
        );
        // Reload history to get new entry
        this.loadStockHistory();
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Failed to update stock'));
      })
    );
  }
  
  // Delete product
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.productsSignal.update(products => 
          products.filter(p => p.id !== id)
        );
      }),
      catchError((error) => {
        return throwError(() => new Error(error.error?.message || 'Failed to delete product'));
      })
    );
  }
  
  // Get product by ID from local state
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
