// Import Angular tools for components, inputs/outputs, lifecycle hooks and ViewChild
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
// Import common Angular directives like *ngIf and *ngFor
import { CommonModule } from '@angular/common';
// Import reactive form classes
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// Import Material form field
import { MatFormFieldModule } from '@angular/material/form-field';
// Import Material input
import { MatInputModule } from '@angular/material/input';
// Import Material select dropdown
import { MatSelectModule } from '@angular/material/select';
// Import Material icon support
import { MatIconModule } from '@angular/material/icon';
// Import Material button
import { MatButtonModule } from '@angular/material/button';
// Import Material chips (used for showing active filter chips)
import { MatChipsModule } from '@angular/material/chips';

// Import types for product filter, stock status and categories
import { ProductFilter, StockStatus, PRODUCT_CATEGORIES } from '../../models/product.model';

// Define this class as the filter bar component
@Component({
  // HTML tag for this component
  selector: 'app-filter-bar',
  // Standalone component (no module required)
  standalone: true,
  // Modules used inside the filter bar template
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
  // External template file for the filter UI
  templateUrl: './filter-bar.component.html',
  // External stylesheet for this component
  styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent implements OnInit, OnDestroy {
  // Current filter values coming from the parent (dashboard)
  @Input() currentFilter: ProductFilter = {
    searchTerm: '',
    category: 'all',
    stockStatus: 'all'
  };
  
  // Event that notifies parent when filters change
  @Output() filterChange = new EventEmitter<ProductFilter>();
  
  // Reference to the search input element in the template
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  // List of categories including "all" option
  categories = ['all', ...PRODUCT_CATEGORIES];
  
  // List of possible stock status filters with labels for the dropdown
  stockStatuses: { value: StockStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'critical', label: 'Critical' },
    { value: 'low', label: 'Low Stock' },
    { value: 'sufficient', label: 'In Stock' }
  ];
  
  // Reactive form that stores search term, category and stockStatus
  filterForm = new FormGroup({
    searchTerm: new FormControl(''),
    category: new FormControl('all'),
    stockStatus: new FormControl<StockStatus | 'all'>('all')
  });
  
  // Handler function we attach to the window event for focusing search box
  private focusSearchHandler = () => this.focusSearch();
  
  // Lifecycle hook: run when component is created
  ngOnInit(): void {
    // Initialize form values from the input currentFilter
    this.filterForm.patchValue(this.currentFilter);
    
    // Whenever form values change, emit a new ProductFilter to the parent
    this.filterForm.valueChanges.subscribe(value => {
      this.filterChange.emit({
        searchTerm: value.searchTerm || '',
        category: value.category || 'all',
        stockStatus: value.stockStatus || 'all'
      });
    });
    
    // Listen for custom browser event that should focus the search input
    // (we used this earlier when we had keyboard shortcuts)
    window.addEventListener('focusFilterSearch', this.focusSearchHandler);
  }
  
  // Lifecycle hook: run when component is destroyed
  ngOnDestroy(): void {
    // Clean up event listener when component goes away
    window.removeEventListener('focusFilterSearch', this.focusSearchHandler);
  }
  
  // Programmatically focus and select the search input text
  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
      this.searchInput.nativeElement.select();
    }
  }
  
  // Reset all filters back to their default values
  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      category: 'all',
      stockStatus: 'all'
    });
  }
  
  // Check if user has any active (non-default) filters
  hasActiveFilters(): boolean {
    const value = this.filterForm.value;
    return !!(value.searchTerm || value.category !== 'all' || value.stockStatus !== 'all');
  }
}
