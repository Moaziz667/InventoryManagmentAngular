// Import core Angular features for components and lifecycle hooks
import { Component, Inject, OnInit } from '@angular/core';
// Import common Angular directives like *ngIf and *ngFor
import { CommonModule } from '@angular/common';
// Import reactive forms utilities and validators
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// Import Material dialog types for working with modals
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
// Import Material form field wrapper
import { MatFormFieldModule } from '@angular/material/form-field';
// Import Material text input component
import { MatInputModule } from '@angular/material/input';
// Import Material select dropdown component
import { MatSelectModule } from '@angular/material/select';
// Import Material button component
import { MatButtonModule } from '@angular/material/button';
// Import Material icon support
import { MatIconModule } from '@angular/material/icon';

// Import product type and list of categories
import { Product, PRODUCT_CATEGORIES } from '../../models/product.model';

// Interface that describes the data passed into the modal
export interface ProductModalData {
  // Whether this modal is used for creating or editing a product
  mode: 'create' | 'edit';
  // When editing, the existing product data (optional)
  product?: Product;
}

// Define this class as the product create/edit modal component
@Component({
  // HTML tag for this modal component
  selector: 'app-product-modal',
  // Standalone so it can be used directly by the dialog
  standalone: true,
  // List of modules used inside the modal template
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  // External HTML template for the dialog content
  templateUrl: './product-modal.component.html',
  // External styles for the dialog
  styleUrl: './product-modal.component.scss'
})
export class ProductModalComponent implements OnInit {
  // Reactive form that holds all product fields
  productForm!: FormGroup;
  // List of available product categories
  categories = PRODUCT_CATEGORIES;
  // Flag to tell if we are editing or creating
  isEditMode: boolean;
  
  // Inject FormBuilder, dialog reference and input data for this dialog
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductModalData
  ) {
    // Set the mode flag based on the incoming data
    this.isEditMode = data.mode === 'edit';
  }
  
  // Lifecycle hook: run when the component is created
  ngOnInit(): void {
    // Initialize the reactive form with values and validators
    this.initForm();
  }
  
  // Create the form group and set default values from existing product (if any)
  private initForm(): void {
    this.productForm = this.fb.group({
      // Product name: required and must be at least 2 characters
      name: [this.data.product?.name || '', [Validators.required, Validators.minLength(2)]],
      // Category: required dropdown selection
      category: [this.data.product?.category || '', Validators.required],
      // SKU: required and must match letters/numbers/hyphens pattern
      sku: [this.data.product?.sku || '', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/i)]],
      // Quantity: required and must be 0 or more
      quantity: [this.data.product?.quantity || 0, [Validators.required, Validators.min(0)]],
      // Price: required and must be 0 or more
      price: [this.data.product?.price || 0, [Validators.required, Validators.min(0)]],
      // Supplier name: required text field
      supplier: [this.data.product?.supplier || '', Validators.required],
      // Optional image URL
      imageUrl: [this.data.product?.imageUrl || ''],
      // Optional notes about the product
      notes: [this.data.product?.notes || '']
    });
  }
  
  // Called when user clicks the Cancel button
  onCancel(): void {
    // Close the dialog without returning any data
    this.dialogRef.close();
  }
  
  // Called when user submits the form
  onSubmit(): void {
    // If form is valid, close dialog and return form value to caller
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    } else {
      // If invalid, mark all controls as touched so errors show up
      this.markFormGroupTouched();
    }
  }
  
  // Helper: mark every form control as touched
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }
  
  // Return a friendly error message for a given form control
  getErrorMessage(controlName: string): string {
    const control = this.productForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(controlName)} must be at least 2 characters`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(controlName)} must be 0 or greater`;
    }
    if (control?.hasError('pattern')) {
      return 'SKU must contain only letters, numbers, and hyphens';
    }
    
    return '';
  }
  
  // Map internal control names to human readable labels
  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Product name',
      category: 'Category',
      sku: 'SKU',
      quantity: 'Quantity',
      price: 'Price',
      supplier: 'Supplier',
      imageUrl: 'Image URL'
    };
    return labels[controlName] || controlName;
  }
}
