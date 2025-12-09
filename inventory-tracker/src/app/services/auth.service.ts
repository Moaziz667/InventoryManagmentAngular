import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

/**
 * AuthService handles user authentication (login, logout, register)
 * Uses localStorage to persist auth tokens and user info
 * Provides reactive signals for auth state (currentUser, isAuthenticated, loading)
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API & Storage Constants
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // ========== STATE SIGNALS ==========
  // These signals update the UI automatically when auth state changes
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private loadingSignal = signal<boolean>(false);
  
  // Public read-only versions (components use these)
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  
  constructor() {
    // Load auth data from browser storage on init
    this.checkStoredAuth();
  }
  
  /**
   * Check if user is logged in by reading stored token and user from localStorage
   * Called on service init to restore auth state when page refreshes
   */
  private checkStoredAuth(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem(this.USER_KEY);
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSignal.set(user);
        this.isAuthenticatedSignal.set(true);
      } catch {
        // If stored data is corrupted, clear everything
        this.clearAuth();
      }
    }
  }

  /**
   * USER LOGIN
   * Sends email + password to API, stores returned token & user if successful
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        this.setAuth(response.token, response.user);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * USER REGISTER
   * Creates new account, stores token & user if successful
   */
  register(data: RegisterData): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => {
        this.setAuth(response.token, response.user);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }
  
  /**
   * USER LOGOUT
   * Clears auth tokens and redirects to login page
   */
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  /**
   * Get stored auth token from browser localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Fetch current user info from API
   * Updates currentUser signal with fresh data from server
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  /**
   * Update user profile (name, email, or password)
   * Refreshes currentUser signal with new data
   */
  updateProfile(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.API_URL}/me`, data).pipe(
      tap(response => {
        this.currentUserSignal.set(response.user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      })
    );
  }

  // ========== PRIVATE HELPERS ==========

  /**
   * Store token & user in localStorage and update signals
   * Called after successful login/register
   */
  private setAuth(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
  }

  /**
   * Remove all auth data from localStorage and reset signals
   * Called on logout or when auth fails
   */
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }
}
