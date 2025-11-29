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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Signals for reactive state
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private loadingSignal = signal<boolean>(false);
  
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  
  constructor() {
    this.checkStoredAuth();
  }
  
  private checkStoredAuth(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem(this.USER_KEY);
    
    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSignal.set(user);
        this.isAuthenticatedSignal.set(true);
      } catch {
        this.clearAuth();
      }
    }
  }
  
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
  
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }
  
  updateProfile(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.API_URL}/me`, data).pipe(
      tap(response => {
        this.currentUserSignal.set(response.user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      })
    );
  }
  
  private setAuth(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
  }
  
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
  }
}
