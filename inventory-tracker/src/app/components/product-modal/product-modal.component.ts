import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Product, PRODUCT_CATEGORIES } from '../../models/product.model';

export interface ProductModalData {
  mode: 'create' | 'edit';
  product?: Product;
}

@Component({
  selector: 'app-product-modal',
  standalone: true,
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
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss'
})
export class ProductModalComponent implements OnInit {
  productForm!: FormGroup;
  categories = PRODUCT_CATEGORIES;
  isEditMode: boolean;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductModalData
  ) {
    this.isEditMode = data.mode === 'edit';
  }
  
  ngOnInit(): void {
    this.initForm();
  }
  
  private initForm(): void {
    this.productForm = this.fb.group({
      name: [this.data.product?.name || '', [Validators.required, Validators.minLength(2)]],
      category: [this.data.product?.category || '', Validators.required],
      sku: [this.data.product?.sku || '', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/i)]],
      quantity: [this.data.product?.quantity || 0, [Validators.required, Validators.min(0)]],
      price: [this.data.product?.price || 0, [Validators.required, Validators.min(0)]],
      supplier: [this.data.product?.supplier || '', Validators.required],
      imageUrl: [this.data.product?.imageUrl || ''],
      notes: [this.data.product?.notes || '']
    });
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSubmit(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }
  
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }
  
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
