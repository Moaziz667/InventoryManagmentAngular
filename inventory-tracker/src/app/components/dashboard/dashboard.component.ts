// Import core Angular features for components, lifecycle hooks and signals
import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
// Import common Angular directives like *ngIf and *ngFor
import { CommonModule } from '@angular/common';
// Import Material toolbar for the top bar
import { MatToolbarModule } from '@angular/material/toolbar';
// Import Material button component
import { MatButtonModule } from '@angular/material/button';
// Import Material icon support
import { MatIconModule } from '@angular/material/icon';
// Import Material loading spinner
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// Import Material snackbar service and module for toast messages
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// Import Material dialog service and module
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// Import Material tooltip module for small helper messages
import { MatTooltipModule } from '@angular/material/tooltip';
// Import paginator module (left here even though we simplified pagination)
import { MatPaginatorModule } from '@angular/material/paginator';

// Import our product service that talks to the API and stores state
import { ProductService } from '../../services/product.service';
// Import product related types and constants
import { Product, ProductFilter, StockStatus, PRODUCT_CATEGORIES } from '../../models/product.model';
// Import child components used inside the dashboard template
import { ProductCardComponent } from '../product-card/product-card.component';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { ProductModalComponent } from '../product-modal/product-modal.component';

// Configure this class as an Angular component
@Component({
  // HTML tag for this component
  selector: 'app-dashboard',
  // Standalone so it can be used without an NgModule
  standalone: true,
  // Other modules and components used in the template
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    // Paginator module no longer needed in simplified view but kept imported
    ProductCardComponent,
    FilterBarComponent
  ],
  // Template file for the dashboard UI
  templateUrl: './dashboard.component.html',
  // Styles for this component
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Inject ProductService using the inject() function
  private productService = inject(ProductService);
  // Inject snackbar service for showing user messages
  private snackBar = inject(MatSnackBar);
  // Inject dialog service for opening modals
  private dialog = inject(MatDialog);
  
  // Signals
  // Store current filter values selected in the filter bar
  filter = signal<ProductFilter>({
    searchTerm: '',
    category: 'all',
    stockStatus: 'all'
  });
  
  // Computed values
  // Automatically recalculate the filtered product list whenever filter or products change
  filteredProducts = computed(() => {
    return this.productService.getFilteredProducts(this.filter());
  });
  
  // Loading state signal from the ProductService
  loading = this.productService.loading;
  // Error message signal from the ProductService
  error = this.productService.error;
  
  // Stats
  // Calculate dashboard statistics based on all products
  stats = computed(() => {
    // Get the current products from the service (fallback to empty array)
    const products = this.productService.products() || [];
    // Count products that are in critical stock
    const critical = products.filter(p => this.productService.getStockStatus(p.quantity, p.minStock) === 'critical').length;
    // Count products that are low stock
    const low = products.filter(p => this.productService.getStockStatus(p.quantity, p.minStock) === 'low').length;
    // Count products that have sufficient stock
    const sufficient = products.filter(p => this.productService.getStockStatus(p.quantity, p.minStock) === 'sufficient').length;
    // Sum up total value = price * quantity for each product
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    // Return all stats as a single object
    return { total: products.length, critical, low, sufficient, totalValue };
  });
  
  // Lifecycle hook: called once when the component is created
  ngOnInit(): void {
    // Load products from API when dashboard first appears
    this.productService.loadProducts();
  }
  
  // Lifecycle hook: called when the component is destroyed
  ngOnDestroy(): void {
    // No cleanup needed right now but method is here for later
  }
  
  // Called when FilterBar emits a new filter object
  onFilterChange(newFilter: ProductFilter): void {
    // Update the filter signal with the new values
    this.filter.set(newFilter);
  }
  
  // Open modal dialog to create a new product
  openCreateModal(): void {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'product-modal',
      data: { mode: 'create' }
    });
    
    // Wait for the modal to close and get the result
    dialogRef.afterClosed().subscribe(result => {
      // If result is defined, user submitted the form
      if (result) {
        // Call service to create the new product
        this.productService.createProduct(result).subscribe({
          // If creation is successful, show success message
          next: () => {
            this.snackBar.open('Product created successfully', 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
          },
          // If creation fails, show error message
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
  
  // Open modal dialog to edit an existing product
  openEditModal(product: Product): void {
    const dialogRef = this.dialog.open(ProductModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'product-modal',
      data: { mode: 'edit', product }
    });
    
    // Handle the result after the dialog closes
    dialogRef.afterClosed().subscribe(result => {
      // If result exists, user submitted updated product data
      if (result) {
        // Call service to update the product
        this.productService.updateProduct(product.id, result).subscribe({
          // If update is successful, show success snackbar
          next: () => {
            this.snackBar.open('Product updated successfully', 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
          },
          // If update fails, show error snackbar
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
  
  // Delete a product after user confirms in product card
  deleteProduct(product: Product): void {
    // Call service to delete by id
    this.productService.deleteProduct(product.id).subscribe({
      // On success, show a confirmation message
      next: () => {
        this.snackBar.open('Product deleted successfully', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      },
      // On error, show an error message
      error: (err) => {
        this.snackBar.open('Error deleting product', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  // Manually reload the products list from the API
  refreshProducts(): void {
    this.productService.loadProducts();
  }
}
