// Import Angular tools for components, lifecycle hook and signals
import { Component, OnInit, signal } from '@angular/core';
// Import common Angular directives like *ngIf and *ngFor
import { CommonModule } from '@angular/common';
// Import router pieces to read params and navigate
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// Import Material card component
import { MatCardModule } from '@angular/material/card';
// Import Material button component
import { MatButtonModule } from '@angular/material/button';
// Import Material icon support
import { MatIconModule } from '@angular/material/icon';
// Import Material chips for status labels
import { MatChipsModule } from '@angular/material/chips';
// Import Material loading spinner
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// Import Material table for stock history list
import { MatTableModule } from '@angular/material/table';
// Import dialog service for opening modals
import { MatDialog } from '@angular/material/dialog';
// Import our product service which talks to the API
import { ProductService } from '../../services/product.service';
// Import product type and stock history entry type
import { Product, StockHistoryEntry } from '../../models/product.model';
// Import product modal for editing product
import { ProductModalComponent } from '../product-modal/product-modal.component';
// Import confirm dialog for deleting product
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

// Define this class as the product detail page component
@Component({
  // HTML tag for this component
  selector: 'app-product-detail',
  // Standalone component (no module needed)
  standalone: true,
  // Other modules/components used inside the template
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
  // External HTML template for product detail view
  templateUrl: './product-detail.component.html',
  // External styles for this page
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  // Signal holding the currently loaded product (or null while loading/if missing)
  product = signal<Product | null>(null);
  // Signal holding the list of stock history entries
  history = signal<StockHistoryEntry[]>([]);
  // Signal telling if we are loading data from the server
  isLoading = signal(true);
  // Columns that should be shown in the Material table
  displayedColumns = ['date', 'type', 'quantity', 'reason'];

  // Inject route to read product id, router to navigate, service for data, and dialog for modals
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private dialog: MatDialog
  ) {}

  // Lifecycle hook: called when the component is first created
  ngOnInit() {
    // Read id parameter from the URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // If we have an id, load that product
      this.loadProduct(id);
    } else {
      // If no id is provided, stop loading
      this.isLoading.set(false);
    }
  }

  // Load product details from backend by id
  loadProduct(id: string) {
    // Show loading spinner while data is fetched
    this.isLoading.set(true);
    this.productService.getProduct(id).subscribe({
      // If request succeeds, store product and then load history
      next: (product) => {
        this.product.set(product);
        this.loadHistory(id);
      },
      // If request fails, clear product and stop loading
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  // Load stock history list for this product
  loadHistory(productId: string) {
    this.productService.getProductHistory(productId).subscribe({
      // Store history and turn off loading when success
      next: (history) => {
        this.history.set(history);
        this.isLoading.set(false);
      },
      // On error, just stop loading (we might still show product info)
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // Get a human readable stock status string for the current product
  getStockStatus(): string {
    const p = this.product();
    if (!p) return '';
    if (p.quantity === 0) return 'Out of Stock';
    if (p.quantity <= p.minStock) return 'Low Stock';
    return 'In Stock';
  }

  // Get a CSS class name based on current stock status
  getStockStatusClass(): string {
    const p = this.product();
    if (!p) return '';
    if (p.quantity === 0) return 'out-of-stock';
    if (p.quantity <= p.minStock) return 'low-stock';
    return 'in-stock';
  }

  // Calculate the total value of all stock (price * quantity)
  getTotalValue(): string {
    const p = this.product();
    if (!p) return '0.00';
    return (p.price * p.quantity).toFixed(2);
  }

  // Figure out how much quantity changed in a history entry
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

  // Open modal to edit current product
  editProduct() {
    const p = this.product();
    if (!p) return;

    const dialogRef = this.dialog.open(ProductModalComponent, {
      width: '600px',
      data: { product: p }
    });

    // After dialog closes, check if we got new data and update
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

  // Ask for confirmation and then delete the product
  deleteProduct() {
    const p = this.product();
    if (!p) return;

    // Open confirm dialog before actually deleting
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${p.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });

    // If user confirmed, call service to delete and go back to dashboard
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
