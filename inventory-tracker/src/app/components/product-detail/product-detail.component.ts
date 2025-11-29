import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../services/product.service';
import { Product, StockHistoryEntry } from '../../models/product.model';
import { ProductModalComponent } from '../product-modal/product-modal.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  template: `
    <div class="detail-container">
      <div class="back-nav">
        <button mat-button routerLink="/">
          <mat-icon>arrow_back</mat-icon>
          Back to Dashboard
        </button>
      </div>
      
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading product...</p>
        </div>
      } @else if (product()) {
        <div class="product-detail">
          <mat-card class="main-card">
            <div class="product-header">
              <div class="product-image">
                @if (product()?.imageUrl) {
                  <img [src]="product()?.imageUrl" [alt]="product()?.name">
                } @else {
                  <mat-icon>inventory_2</mat-icon>
                }
              </div>
              
              <div class="product-info">
                <div class="product-title-row">
                  <h1>{{ product()?.name }}</h1>
                  <mat-chip [class]="getStockStatusClass()">
                    {{ getStockStatus() }}
                  </mat-chip>
                </div>
                
                <p class="sku">SKU: {{ product()?.sku }}</p>
                <p class="category">
                  <mat-icon>category</mat-icon>
                  {{ product()?.category }}
                </p>
                
                @if (product()?.description) {
                  <p class="description">{{ product()?.description }}</p>
                }
              </div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <mat-icon>attach_money</mat-icon>
                <div class="stat-content">
                  <span class="stat-value">\${{ product()?.price?.toFixed(2) }}</span>
                  <span class="stat-label">Price</span>
                </div>
              </div>
              
              <div class="stat-card">
                <mat-icon>inventory</mat-icon>
                <div class="stat-content">
                  <span class="stat-value">{{ product()?.quantity }}</span>
                  <span class="stat-label">In Stock</span>
                </div>
              </div>
              
              <div class="stat-card">
                <mat-icon>warning</mat-icon>
                <div class="stat-content">
                  <span class="stat-value">{{ product()?.minStock }}</span>
                  <span class="stat-label">Min Stock</span>
                </div>
              </div>
              
              <div class="stat-card">
                <mat-icon>calculate</mat-icon>
                <div class="stat-content">
                  <span class="stat-value">\${{ getTotalValue() }}</span>
                  <span class="stat-label">Total Value</span>
                </div>
              </div>
            </div>
            
            <div class="actions">
              <button mat-raised-button color="primary" (click)="editProduct()">
                <mat-icon>edit</mat-icon>
                Edit Product
              </button>
              <button mat-raised-button color="warn" (click)="deleteProduct()">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            </div>
          </mat-card>
          
          <mat-card class="history-card">
            <h2>
              <mat-icon>history</mat-icon>
              Stock History
            </h2>
            
            @if (history().length > 0) {
              <table mat-table [dataSource]="history()" class="history-table">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let entry">
                    {{ (entry.timestamp || entry.date) | date:'short' }}
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let entry">
                    <mat-chip [class]="entry.changeType || entry.type">
                      {{ entry.changeType || entry.type }}
                    </mat-chip>
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let entry" [class.positive]="getQuantityChange(entry) > 0" [class.negative]="getQuantityChange(entry) < 0">
                    {{ getQuantityChange(entry) > 0 ? '+' : '' }}{{ getQuantityChange(entry) }}
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="reason">
                  <th mat-header-cell *matHeaderCellDef>Reason</th>
                  <td mat-cell *matCellDef="let entry">{{ entry.notes || entry.reason || '-' }}</td>
                </ng-container>
                
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            } @else {
              <div class="no-history">
                <mat-icon>info</mat-icon>
                <p>No stock history available for this product</p>
              </div>
            }
          </mat-card>
        </div>
      } @else {
        <div class="not-found">
          <mat-icon>search_off</mat-icon>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <button mat-raised-button color="primary" routerLink="/">
            Return to Dashboard
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .back-nav {
      margin-bottom: 24px;
    }
    
    .back-nav button {
      color: var(--text-secondary);
    }
    
    .back-nav mat-icon {
      margin-right: 8px;
    }
    
    .loading-container, .not-found {
      text-align: center;
      padding: 60px 20px;
    }
    
    .loading-container p, .not-found p {
      color: var(--text-secondary);
      margin-top: 16px;
    }
    
    .not-found mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--text-secondary);
    }
    
    .not-found h2 {
      margin: 16px 0 8px;
      color: var(--text-primary);
    }
    
    .not-found button {
      margin-top: 20px;
    }
    
    .product-detail {
      display: grid;
      gap: 24px;
    }
    
    .main-card {
      padding: 32px;
      border-radius: 16px;
    }
    
    .product-header {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;
    }
    
    .product-image {
      width: 200px;
      height: 200px;
      border-radius: 12px;
      overflow: hidden;
      background: var(--surface-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .product-image mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: var(--text-secondary);
    }
    
    .product-info {
      flex: 1;
    }
    
    .product-title-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }
    
    .product-title-row h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .sku {
      font-family: 'SF Mono', monospace;
      color: var(--text-secondary);
      margin: 0 0 12px;
    }
    
    .category {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      margin: 0 0 16px;
    }
    
    .category mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .description {
      color: var(--text-primary);
      line-height: 1.6;
      margin: 0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--surface-color);
      border-radius: 12px;
    }
    
    .stat-card mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--primary-color);
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .stat-label {
      font-size: 13px;
      color: var(--text-secondary);
    }
    
    .actions {
      display: flex;
      gap: 12px;
    }
    
    .actions button mat-icon {
      margin-right: 8px;
    }
    
    .history-card {
      padding: 24px;
      border-radius: 16px;
    }
    
    .history-card h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 20px;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .history-table {
      width: 100%;
    }
    
    .positive {
      color: var(--success-color);
      font-weight: 500;
    }
    
    .negative {
      color: var(--danger-color);
      font-weight: 500;
    }
    
    mat-chip.in-stock {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    
    mat-chip.low-stock {
      background: #fff3e0 !important;
      color: #ef6c00 !important;
    }
    
    mat-chip.out-of-stock {
      background: #ffebee !important;
      color: #c62828 !important;
    }
    
    mat-chip.addition, mat-chip.restock {
      background: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
    
    mat-chip.sale, mat-chip.removal {
      background: #ffebee !important;
      color: #c62828 !important;
    }
    
    mat-chip.adjustment {
      background: #e3f2fd !important;
      color: #1565c0 !important;
    }
    
    .no-history {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);
    }
    
    .no-history mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }
    
    @media (max-width: 768px) {
      .product-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .product-title-row {
        flex-direction: column;
        gap: 8px;
      }
      
      .category {
        justify-content: center;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  history = signal<StockHistoryEntry[]>([]);
  isLoading = signal(true);
  displayedColumns = ['date', 'type', 'quantity', 'reason'];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private dialog: MatDialog
  ) {}
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.isLoading.set(false);
    }
  }
  
  loadProduct(id: string) {
    this.isLoading.set(true);
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loadHistory(id);
      },
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }
  
  loadHistory(productId: string) {
    this.productService.getProductHistory(productId).subscribe({
      next: (history) => {
        this.history.set(history);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
  
  getStockStatus(): string {
    const p = this.product();
    if (!p) return '';
    if (p.quantity === 0) return 'Out of Stock';
    if (p.quantity <= p.minStock) return 'Low Stock';
    return 'In Stock';
  }
  
  getStockStatusClass(): string {
    const p = this.product();
    if (!p) return '';
    if (p.quantity === 0) return 'out-of-stock';
    if (p.quantity <= p.minStock) return 'low-stock';
    return 'in-stock';
  }
  
  getTotalValue(): string {
    const p = this.product();
    if (!p) return '0.00';
    return (p.price * p.quantity).toFixed(2);
  }
  
  getQuantityChange(entry: StockHistoryEntry): number {
    // Calculate quantity change - positive for increase, negative for decrease
    if (entry.quantityChange !== undefined && entry.quantityChange !== null) {
      return entry.quantityChange;
    }
    if (entry.changeAmount !== undefined && entry.changeAmount !== null) {
      return entry.changeType === 'decrease' ? -entry.changeAmount : entry.changeAmount;
    }
    return entry.newQuantity - entry.previousQuantity;
  }
  
  editProduct() {
    const p = this.product();
    if (!p) return;
    
    const dialogRef = this.dialog.open(ProductModalComponent, {
      width: '600px',
      data: { product: p }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.updateProduct(p.id, result).subscribe({
          next: (updated) => {
            this.product.set(updated);
          }
        });
      }
    });
  }
  
  deleteProduct() {
    const p = this.product();
    if (!p) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${p.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.productService.deleteProduct(p.id).subscribe({
          next: () => {
            this.router.navigate(['/']);
          }
        });
      }
    });
  }
}
