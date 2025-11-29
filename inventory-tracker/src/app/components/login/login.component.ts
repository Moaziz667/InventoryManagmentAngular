import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
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
  template: `
    <div class="auth-container">
      <!-- Left Side - Illustration -->
      <div class="auth-illustration">
        <div class="illustration-content">
          <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>
          <div class="illustration-icon">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Box/Package Icon -->
              <rect x="40" y="60" width="120" height="100" rx="8" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="3"/>
              <path d="M40 85 L100 55 L160 85" stroke="white" stroke-width="3" fill="none"/>
              <line x1="100" y1="55" x2="100" y2="160" stroke="white" stroke-width="3"/>
              <line x1="40" y1="85" x2="100" y2="115" stroke="white" stroke-width="2" opacity="0.5"/>
              <line x1="160" y1="85" x2="100" y2="115" stroke="white" stroke-width="2" opacity="0.5"/>
              <!-- Barcode lines -->
              <rect x="60" y="125" width="4" height="20" fill="white" opacity="0.8"/>
              <rect x="68" y="125" width="2" height="20" fill="white" opacity="0.8"/>
              <rect x="74" y="125" width="6" height="20" fill="white" opacity="0.8"/>
              <rect x="84" y="125" width="3" height="20" fill="white" opacity="0.8"/>
              <rect x="90" y="125" width="2" height="20" fill="white" opacity="0.8"/>
              <!-- Check mark -->
              <circle cx="150" cy="50" r="25" fill="#10b981"/>
              <path d="M138 50 L147 59 L162 41" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Inventory Management</h2>
          <p>Track, manage, and optimize your inventory with our powerful and intuitive system.</p>
          <div class="feature-list">
            <div class="feature-item">
              <mat-icon>check_circle</mat-icon>
              <span>Real-time stock tracking</span>
            </div>
            <div class="feature-item">
              <mat-icon>check_circle</mat-icon>
              <span>Low stock alerts</span>
            </div>
            <div class="feature-item">
              <mat-icon>check_circle</mat-icon>
              <span>Detailed history logs</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Side - Login Form -->
      <div class="auth-form-container">
        <mat-card class="auth-card">
          <mat-card-header>
            <div class="auth-header">
              <div class="logo-container">
                <mat-icon class="auth-logo">inventory_2</mat-icon>
              </div>
              <h1>Admin Login</h1>
              <p>Sign in to access the inventory dashboard</p>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            @if (errorMessage()) {
              <div class="error-banner">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }
            
            <form (ngSubmit)="onLogin()" #loginForm="ngForm">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input 
                  matInput 
                  type="email" 
                  name="email"
                  [(ngModel)]="email"
                  required
                  email
                >
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input 
                  matInput 
                  [type]="hidePassword() ? 'password' : 'text'"
                  name="password"
                  [(ngModel)]="password"
                  required
                  minlength="6"
                >
                <mat-icon matPrefix>lock</mat-icon>
                <button 
                  type="button" 
                  mat-icon-button 
                  matSuffix 
                  (click)="hidePassword.set(!hidePassword())"
                >
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
              
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                class="submit-btn"
                [disabled]="isLoading() || !loginForm.valid"
              >
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <span class="btn-content">Sign In <mat-icon>arrow_forward</mat-icon></span>
                }
              </button>
            </form>
          </mat-card-content>
          
          <mat-card-footer>
            <div class="admin-badge">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Single Admin Access Only</span>
            </div>
          </mat-card-footer>
        </mat-card>
        
        <div class="demo-credentials">
          <mat-icon>info</mat-icon>
          <span>Credentials: admin&#64;inventory.com / admin123</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      background: #f8fafc;
    }
    
    // Left Illustration Panel
    .auth-illustration {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      position: relative;
      overflow: hidden;
      
      @media (max-width: 900px) {
        display: none;
      }
    }
    
    .floating-shapes {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
    
    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;
    }
    
    .shape-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }
    
    .shape-2 {
      width: 200px;
      height: 200px;
      bottom: -50px;
      right: -50px;
      animation-delay: 2s;
    }
    
    .shape-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      right: 10%;
      animation-delay: 4s;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    
    .illustration-content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: white;
      max-width: 400px;
    }
    
    .illustration-icon {
      width: 200px;
      height: 200px;
      margin: 0 auto 30px;
      
      svg {
        width: 100%;
        height: 100%;
      }
    }
    
    .illustration-content h2 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 12px;
      color: white;
    }
    
    .illustration-content > p {
      font-size: 16px;
      opacity: 0.9;
      line-height: 1.6;
      margin: 0 0 30px;
      color: rgba(255,255,255,0.9);
    }
    
    .feature-list {
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      
      mat-icon {
        color: #10b981;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    
    // Right Form Panel
    .auth-form-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      max-width: 520px;
      
      @media (max-width: 900px) {
        max-width: 100%;
      }
    }
    
    .auth-card {
      width: 100%;
      max-width: 420px;
      border-radius: 20px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08) !important;
      border: 1px solid #e2e8f0;
    }
    
    .auth-header {
      text-align: center;
      width: 100%;
      padding: 24px 0 8px;
    }
    
    .logo-container {
      width: 70px;
      height: 70px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    
    .auth-logo {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: white;
    }
    
    .auth-header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: #1e293b;
    }
    
    .auth-header p {
      margin: 8px 0 0;
      color: #64748b;
      font-size: 14px;
    }
    
    mat-card-content {
      padding: 8px 28px !important;
    }
    
    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-radius: 12px;
      color: #dc2626;
      margin-bottom: 20px;
      font-size: 14px;
      border: 1px solid #fecaca;
    }
    
    .error-banner mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
    
    .submit-btn {
      width: 100%;
      height: 52px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 12px;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35) !important;
      transition: all 0.3s ease !important;
      color: #ffffff !important;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.45) !important;
      }
      
      &:disabled {
        opacity: 0.7;
      }
      
      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #ffffff;
        
        mat-icon {
          color: #ffffff;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }
    
    .submit-btn mat-spinner {
      display: inline-block;
    }
    
    ::ng-deep .submit-btn .mdc-button__label {
      color: #ffffff !important;
    }
    
    mat-card-footer {
      padding: 16px 28px 28px !important;
      text-align: center;
    }
    
    .admin-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      border-radius: 10px;
      color: #7c3aed;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid rgba(124, 58, 237, 0.2);
    }
    
    .admin-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .demo-credentials {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 24px;
      padding: 14px 20px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 12px;
      color: #0369a1;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid #bae6fd;
    }
    
    .demo-credentials mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #0ea5e9;
    }
    
    ::ng-deep .mat-mdc-form-field-icon-prefix {
      padding-right: 12px !important;
      color: #94a3b8;
    }
    
    ::ng-deep .mat-mdc-text-field-wrapper {
      background: #f8fafc !important;
    }
    
    ::ng-deep .mdc-notched-outline__leading,
    ::ng-deep .mdc-notched-outline__notch,
    ::ng-deep .mdc-notched-outline__trailing {
      border-color: #e2e8f0 !important;
    }
    
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #667eea !important;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  onLogin() {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }
}
