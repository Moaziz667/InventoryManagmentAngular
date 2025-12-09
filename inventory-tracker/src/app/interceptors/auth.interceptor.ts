import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * AUTH INTERCEPTOR
 * Automatically adds JWT token to every HTTP request
 * 
 * How it works:
 * 1. Gets the stored auth token from AuthService
 * 2. Clones the HTTP request
 * 3. Adds "Authorization: Bearer {token}" header
 * 4. Sends modified request to API
 * 
 * This way, every API call is automatically authenticated
 * without needing to manually add the header each time
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    // Add token to request header
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }
  
  // No token, send request as-is
  return next(req);
};
