// Import Angular tools for components, inputs/outputs and events
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
// Import common Angular directives like *ngIf and *ngFor
import { CommonModule } from '@angular/common';
// Import router link directive so the card can link to detail page
import { RouterLink } from '@angular/router';
// Import Material card component
import { MatCardModule } from '@angular/material/card';
// Import Material button component
import { MatButtonModule } from '@angular/material/button';
// Import Material icon support
import { MatIconModule } from '@angular/material/icon';
// Import Material menu for context menu on the card
import { MatMenuModule } from '@angular/material/menu';
// Import Material tooltip for hover information
import { MatTooltipModule } from '@angular/material/tooltip';
// Import Material dialog service and module
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Import product type, stock status type and default thresholds
import { Product, StockStatus, DEFAULT_STOCK_THRESHOLDS } from '../../models/product.model';
// Import product service that knows how to calculate stock status
import { ProductService } from '../../services/product.service';
// Import our reusable confirmation dialog component
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

// Define this class as a reusable product card component
@Component({
  // HTML tag name for this component
  selector: 'app-product-card',
  // Standalone so we do not need to declare it in a module
  standalone: true,
  // List of modules/components used in the template
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule
  ],
  // External template file that defines the HTML layout
  templateUrl: './product-card.component.html',
  // External stylesheet for this card
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  // Input: the product data this card should display (required)
  @Input({ required: true }) product!: Product;
  // Output event: tells parent that user wants to edit this product
  @Output() edit = new EventEmitter<Product>();
  // Output event: tells parent that user wants to delete this product
  @Output() delete = new EventEmitter<Product>();
  
  // Inject ProductService to reuse stock status logic
  private productService = inject(ProductService);
  // Inject dialog service so we can open the confirm dialog
  private dialog = inject(MatDialog);
  
  // Getter that returns stock status for this product (critical/low/sufficient)
  get stockStatus(): StockStatus {
    return this.productService.getStockStatus(this.product.quantity, this.product.minStock);
  }
  
  // Getter that returns a human readable label based on stock status
  get stockLabel(): string {
    switch (this.stockStatus) {
      case 'critical':
        return 'Critical';
      case 'low':
        return 'Low Stock';
      case 'sufficient':
        return 'In Stock';
    }
  }
  
  // Getter that builds the CSS class name used for the colored badge
  get stockBadgeClass(): string {
    return `stock-badge ${this.stockStatus}`;
  }
  
  // Called when user chooses to edit from the card menu
  onEdit(): void {
    // Emit the edit event with the current product
    this.edit.emit(this.product);
  }
  
  // Called when user chooses to delete from the card menu
  onDelete(): void {
    // Open confirmation dialog before actually deleting
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${this.product.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });
    
    // Wait for the dialog to close and check if user confirmed
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        // If user clicked Delete, emit delete event with this product
        this.delete.emit(this.product);
      }
    });
  }
}
