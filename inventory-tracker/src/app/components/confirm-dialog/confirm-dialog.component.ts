// Import core Angular decorators and helpers
import { Component, Inject } from '@angular/core';
// Import CommonModule so we can use basic Angular directives in the template
import { CommonModule } from '@angular/common';
// Import Material dialog types: reference to the dialog and the data token
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
// Import Material button module for the Confirm / Cancel buttons
import { MatButtonModule } from '@angular/material/button';

// Shape of the data we pass into the confirm dialog
export interface ConfirmDialogData {
  // Title text shown at the top of the dialog
  title: string;
  // Main message asking the user to confirm
  message: string;
  // Optional custom label for the confirm button (default: "Confirm")
  confirmText?: string;
  // Optional custom label for the cancel button (default: "Cancel")
  cancelText?: string;
  // Optional Angular Material color for the confirm button
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  // HTML tag used to place this component if needed
  selector: 'app-confirm-dialog',
  // Standalone component (does not belong to an NgModule)
  standalone: true,
  // Other Angular / Material modules this component needs
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  // External HTML file for the dialog layout
  templateUrl: './confirm-dialog.component.html',
  // External SCSS file for styling the dialog
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  constructor(
    // dialogRef lets us close the dialog and optionally send back a value
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    // data contains the title/message/button labels passed in when opening
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
  
  // Called when the user clicks the Cancel button
  onCancel(): void {
    // Close dialog and return "false" to the caller
    this.dialogRef.close(false);
  }
  
  // Called when the user clicks the Confirm button
  onConfirm(): void {
    // Close dialog and return "true" to the caller
    this.dialogRef.close(true);
  }
}
