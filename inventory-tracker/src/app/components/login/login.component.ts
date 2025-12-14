// Import basic Angular features for components and reactive values (signals)
import { Component, signal } from '@angular/core';
// Import common Angular directives like *ngIf, *ngFor, etc.
import { CommonModule } from '@angular/common';
// Import support for template‑driven forms ([(ngModel)])
import { FormsModule } from '@angular/forms';
// Import Router so we can navigate after successful login
import { Router } from '@angular/router';
// Import Material card UI component
import { MatCardModule } from '@angular/material/card';
// Import Material form field wrapper
import { MatFormFieldModule } from '@angular/material/form-field';
// Import Material text input component
import { MatInputModule } from '@angular/material/input';
// Import Material button component
import { MatButtonModule } from '@angular/material/button';
// Import Material icon support
import { MatIconModule } from '@angular/material/icon';
// Import Material loading spinner component
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// Import our AuthService that talks to the backend for login
import { AuthService } from '../../services/auth.service';

// Tell Angular this class is a component
@Component({
  // The HTML tag name we will use in templates
  selector: 'app-login',
  // Mark this as a standalone component (no NgModule needed)
  standalone: true,
  // List of other modules/components this component needs
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  // Path to the HTML file for the view
  templateUrl: './login.component.html',
  // Path to the SCSS file for styles
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Store the email typed by the user
  email = '';
  // Store the password typed by the user
  password = '';
  // Signal that controls if password is hidden or visible
  hidePassword = signal(true);
  // Signal that tells us if we are currently calling the API
  isLoading = signal(false);
  // Signal that stores any error message to show to the user
  errorMessage = signal('');
  
  // Ask Angular to inject AuthService and Router into this component
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  // Function that runs when user clicks the Login button
  onLogin() {
    // If email or password is empty, do nothing
    if (!this.email || !this.password) return;
    
    // Turn on loading spinner
    this.isLoading.set(true);
    // Clear any old error message
    this.errorMessage.set('');
    
    // Call the login API through our AuthService
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      // If login is successful
      next: () => {
        // Navigate to the main dashboard page
        this.router.navigate(['/']);
      },
      // If login fails
      error: (err) => {
        // Stop showing the loading spinner
        this.isLoading.set(false);
        // Show a specific error from backend or a default message
        this.errorMessage.set(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }
}
