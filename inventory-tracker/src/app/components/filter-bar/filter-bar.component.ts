import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { ProductFilter, StockStatus, PRODUCT_CATEGORIES } from '../../models/product.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() currentFilter: ProductFilter = {
    searchTerm: '',
    category: 'all',
    stockStatus: 'all'
  };
  
  @Output() filterChange = new EventEmitter<ProductFilter>();
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  categories = ['all', ...PRODUCT_CATEGORIES];
  
  stockStatuses: { value: StockStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'critical', label: 'Critical' },
    { value: 'low', label: 'Low Stock' },
    { value: 'sufficient', label: 'In Stock' }
  ];
  
  filterForm = new FormGroup({
    searchTerm: new FormControl(''),
    category: new FormControl('all'),
    stockStatus: new FormControl<StockStatus | 'all'>('all')
  });
  
  private focusSearchHandler = () => this.focusSearch();
  
  ngOnInit(): void {
    this.filterForm.patchValue(this.currentFilter);
    
    this.filterForm.valueChanges.subscribe(value => {
      this.filterChange.emit({
        searchTerm: value.searchTerm || '',
        category: value.category || 'all',
        stockStatus: value.stockStatus || 'all'
      });
    });
    
    // Listen for focus search events
    window.addEventListener('focusFilterSearch', this.focusSearchHandler);
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('focusFilterSearch', this.focusSearchHandler);
  }
  
  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
      this.searchInput.nativeElement.select();
    }
  }
  
  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      category: 'all',
      stockStatus: 'all'
    });
  }
  
  hasActiveFilters(): boolean {
    const value = this.filterForm.value;
    return !!(value.searchTerm || value.category !== 'all' || value.stockStatus !== 'all');
  }
}
