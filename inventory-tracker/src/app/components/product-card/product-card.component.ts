import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Product, StockStatus, DEFAULT_STOCK_THRESHOLDS } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
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
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();
  
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  
  get stockStatus(): StockStatus {
    return this.productService.getStockStatus(this.product.quantity, this.product.minStock);
  }
  
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
  
  get stockBadgeClass(): string {
    return `stock-badge ${this.stockStatus}`;
  }
  
  onEdit(): void {
    this.edit.emit(this.product);
  }
  
  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${this.product.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn'
      }
    });
    
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.delete.emit(this.product);
      }
    });
  }
}
