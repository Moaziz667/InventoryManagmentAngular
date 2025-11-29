import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  faqs = [
    {
      question: 'How do I add a new product?',
      answer: 'Click the "Add Product" button on the Dashboard page. Fill in the product details including name, SKU, category, quantity, price, and supplier. You can also add an image URL for the product.'
    },
    {
      question: 'How do I update stock levels?',
      answer: 'Click on any product card to open it, then use the stock adjustment controls to increase or decrease the quantity. You can also edit the product directly to change the stock level.'
    },
    {
      question: 'What do the stock status colors mean?',
      answer: 'Green (Sufficient): Stock is above the minimum threshold. Orange (Low): Stock is at or below the minimum threshold. Red (Critical): Stock is at zero or very low levels requiring immediate attention.'
    },
    {
      question: 'How do I search for products?',
      answer: 'Use the search bar at the top of the Dashboard or press Ctrl+F to focus the search input. You can search by product name or SKU.'
    },
    {
      question: 'How do I filter products by category?',
      answer: 'Use the category dropdown filter on the Dashboard to show only products from a specific category.'
    },
    {
      question: 'Where can I see stock history?',
      answer: 'Click on "Activity" in the navigation bar to view the complete stock history showing all changes made to product quantities.'
    },
    {
      question: 'How do I delete a product?',
      answer: 'Open the product by clicking on its card, then click the delete button. You will be asked to confirm before the product is permanently removed.'
    },
    {
      question: 'Can I export my inventory data?',
      answer: 'Currently, data export functionality is planned for a future update. Stay tuned for this feature!'
    }
  ];

  shortcuts = [
    { keys: 'Ctrl + F', description: 'Focus search bar' },
    { keys: 'Ctrl + R', description: 'Refresh product data' },
    { keys: 'Esc', description: 'Close dialog/modal' }
  ];

  contactEmail = 'support@inventrack.com';
}
