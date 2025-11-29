import { Component, OnInit, OnDestroy, signal, computed, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ProductService } from '../../services/product.service';
import { Product, ProductFilter, StockStatus, PRODUCT_CATEGORIES } from '../../models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { ProductModalComponent } from '../product-modal/product-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatPaginatorModule,
    ProductCardComponent,
    FilterBarComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  // Math for template
  Math = Math;
  
  // Pagination
  pageSize = signal(8);
  pageIndex = signal(0);
  pageSizeOptions = [4, 8, 12, 20];
  
  // Signals
  filter = signal<ProductFilter>({
    searchTerm: '',
    category: 'all',
    stockStatus: 'all'
  });
  
  // Computed values
  filteredProducts = computed(() => {
    return this.productService.getFilteredProducts(this.filter());
  });
  
  // Paginated products
  paginatedProducts = computed(() => {
    const filtered = this.filteredProducts();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });
  
  loading = this.productService.loading;
  error = this.productService.error;
  
  // Stats
  stats = computed(() => {
    const products = this.productService.products() || [];
    const critical = products.filter(p => this.productService.getStockStatus(p.quantity, p.minStock) === 'critical').length;
    const low = products.filter(p => this.productService.getStockStatus(p.quantity, p.minStock) === 'low').length;
    const sufficient = products.filter(p => this.productService.getStockStatus(p.quantity, p.minStock) === 'sufficient').length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    return { total: products.length, critical, low, sufficient, totalValue };
  });
  
  // Category chart data
  categoryChartData = computed(() => {
    const products = this.productService.products() || [];
    const categoryCount: { [key: string]: number } = {};
    
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    
    const total = products.length || 1;
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  });
  
  // Top products by value
  topProductsByValue = computed(() => {
    const products = this.productService.products() || [];
    return products
      .map(p => ({ name: p.name, value: p.price * p.quantity }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  });
  
  // Max value for chart scaling
  maxProductValue = computed(() => {
    const top = this.topProductsByValue();
    return top.length > 0 ? top[0].value : 1;
  });
  
  private focusSearchHandler = () => this.focusSearch();
  
  ngOnInit(): void {
    // Load products from API
    this.productService.loadProducts();
    this.productService.loadStockHistory();
    
    // Listen for focus search event from navbar
    window.addEventListener('focusSearch', this.focusSearchHandler);
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('focusSearch', this.focusSearchHandler);
  }
  
  // Keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    // Ctrl+R - Refresh (not when typing)
    if (event.ctrlKey && event.key === 'r' && !this.isTyping(event)) {
      event.preventDefault();
      this.refreshProducts();
      this.showShortcutFeedback('Refreshing products...');
    }
  }
  
  private isTyping(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
  }
  
  private showShortcutFeedback(message: string): void {
    this.snackBar.open(message, '', {
      duration: 1500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: 'shortcut-snackbar'
    });
  }
  
  focusSearch(): void {
    // Dispatch event to filter bar to focus its search input
    window.dispatchEvent(new CustomEvent('focusFilterSearch'));
  }
  
  onFilterChange(newFilter: ProductFilter): void {
    this.filter.set(newFilter);
    // Reset to first page when filter changes
    this.pageIndex.set(0);
  }
  
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
  
  openCreateModal(): void {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'product-modal',
      data: { mode: 'create' }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.createProduct(result).subscribe({
          next: () => {
            this.snackBar.open('Product created successfully', 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
          },
          error: (err) => {
            this.snackBar.open('Error creating product', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
      }
    });
  }
  
  openEditModal(product: Product): void {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'product-modal',
      data: { mode: 'edit', product }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.updateProduct(product.id, result).subscribe({
          next: () => {
            this.snackBar.open('Product updated successfully', 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
          },
          error: (err) => {
            this.snackBar.open('Error updating product', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
      }
    });
  }
  
  deleteProduct(product: Product): void {
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.snackBar.open('Product deleted successfully', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      },
      error: (err) => {
        this.snackBar.open('Error deleting product', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  refreshProducts(): void {
    this.productService.loadProducts();
  }
}
