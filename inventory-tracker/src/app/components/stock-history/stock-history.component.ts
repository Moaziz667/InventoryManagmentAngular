import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ProductService } from '../../services/product.service';
import { StockHistoryEntry } from '../../models/product.model';

@Component({
  selector: 'app-stock-history',
  standalone: true,
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
  templateUrl: './stock-history.component.html',
  styleUrl: './stock-history.component.scss'
})
export class StockHistoryComponent implements OnInit {
  private productService = inject(ProductService);
  
  displayedColumns: string[] = ['timestamp', 'productName', 'changeType', 'change', 'notes'];
  
  stockHistory = signal<StockHistoryEntry[]>([]);
  paginatedHistory = signal<StockHistoryEntry[]>([]);
  isLoading = signal<boolean>(true);
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  
  ngOnInit(): void {
    this.loadHistory();
  }
  
  loadHistory(): void {
    this.isLoading.set(true);
    // Load stock history from API
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
  
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }
  
  onSort(sort: Sort): void {
    const data = [...this.stockHistory()];
    
    if (!sort.active || sort.direction === '') {
      this.stockHistory.set(data);
    } else {
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
    
    this.pageIndex = 0;
    this.updatePaginatedData();
  }
  
  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  private updatePaginatedData(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedHistory.set(this.stockHistory().slice(start, end));
  }
  
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
