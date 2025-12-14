// Import Angular tools for components, lifecycle hook, signals and inject
import { Component, OnInit, signal, inject } from '@angular/core';
// Import common Angular directives like *ngIf and *ngFor
import { CommonModule } from '@angular/common';
// Import router link so we can navigate from rows
import { RouterLink } from '@angular/router';
// Import Material table module
import { MatTableModule } from '@angular/material/table';
// Import Material sort module and Sort type
import { MatSortModule, Sort } from '@angular/material/sort';
// Import Material paginator module and page event type
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
// Import Material icon
import { MatIconModule } from '@angular/material/icon';
// Import Material button
import { MatButtonModule } from '@angular/material/button';
// Import Material chips for change type badges
import { MatChipsModule } from '@angular/material/chips';
// Import Material tooltip
import { MatTooltipModule } from '@angular/material/tooltip';
// Import Material loading spinner
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Import service that loads stock history from backend
import { ProductService } from '../../services/product.service';
// Import stock history entry type
import { StockHistoryEntry } from '../../models/product.model';

// Define this class as the stock history page component
@Component({
  // HTML tag for this component
  selector: 'app-stock-history',
  // Standalone component
  standalone: true,
  // Modules used inside the template
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  // External HTML template for history table
  templateUrl: './stock-history.component.html',
  // External stylesheet for this component
  styleUrl: './stock-history.component.scss'
})
export class StockHistoryComponent implements OnInit {
  // Inject product service using inject() helper
  private productService = inject(ProductService);
  
  // Columns to display in the Material table
  displayedColumns: string[] = ['timestamp', 'productName', 'changeType', 'change', 'notes'];
  
  // Signal storing the full history list
  stockHistory = signal<StockHistoryEntry[]>([]);
  // Signal storing only the current page of data
  paginatedHistory = signal<StockHistoryEntry[]>([]);
  // Signal indicating whether data is loading
  isLoading = signal<boolean>(true);
  
  // Pagination
  // How many rows to show per page
  pageSize = 10;
  // Current page index (0-based)
  pageIndex = 0;
  // Total number of items in full history list
  totalItems = 0;
  
  // Lifecycle hook: run when component is created
  ngOnInit(): void {
    this.loadHistory();
  }
  
  // Load stock history entries from backend
  loadHistory(): void {
    this.isLoading.set(true);
    // Load stock history from API (limit of 100 entries here)
    this.productService.loadStockHistory(100).subscribe({
      next: (history) => {
        this.stockHistory.set(history);
        this.totalItems = history.length;
        this.updatePaginatedData();
        this.isLoading.set(false);
      },
      error: () => {
        this.stockHistory.set([]);
        this.isLoading.set(false);
      }
    });
  }
  
  // Handle page change event from paginator
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }
  
  // Handle sorting event from table header
  onSort(sort: Sort): void {
    const data = [...this.stockHistory()];
    
    if (!sort.active || sort.direction === '') {
      // No sorting applied, reset to original order
      this.stockHistory.set(data);
    } else {
      // Sort based on active column and direction
      this.stockHistory.set(data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'timestamp':
            return this.compare(new Date(a.timestamp || 0).getTime(), new Date(b.timestamp || 0).getTime(), isAsc);
          case 'productName':
            return this.compare(a.productName || '', b.productName || '', isAsc);
          case 'changeType':
            return this.compare(a.changeType || '', b.changeType || '', isAsc);
          case 'change':
            return this.compare(a.changeAmount || 0, b.changeAmount || 0, isAsc);
          default:
            return 0;
        }
      }));
    }
    
    // Reset to the first page after sorting
    this.pageIndex = 0;
    this.updatePaginatedData();
  }
  
  // Helper to compare two values for sorting
  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  // Recalculate which slice of history should be shown on current page
  private updatePaginatedData(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedHistory.set(this.stockHistory().slice(start, end));
  }
  
  // Pick an icon name based on type of change
  getChangeIcon(changeType: string): string {
    switch (changeType) {
      case 'increase':
        return 'trending_up';
      case 'decrease':
        return 'trending_down';
      case 'set':
        return 'edit';
      default:
        return 'swap_vert';
    }
  }
  
  // Pick a CSS class based on type of change
  getChangeClass(changeType: string): string {
    switch (changeType) {
      case 'increase':
        return 'increase';
      case 'decrease':
        return 'decrease';
      case 'set':
        return 'set';
      default:
        return '';
    }
  }
}
