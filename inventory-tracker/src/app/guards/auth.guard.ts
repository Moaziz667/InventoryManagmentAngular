import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AUTH GUARD
 * Protects routes that require login
 * - Allows access only to authenticated users
 * - Redirects unauthenticated users to /login
 * 
 * Usage: Add to route config: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true; // User is logged in, allow access
  }
  
  // User not authenticated, redirect to login
  router.navigate(['/login']);
  return false;
};

/**
 * GUEST GUARD
 * Protects login/register routes
 * - Allows access only to unauthenticated users
 * - Redirects logged-in users to dashboard
 * 
 * Usage: Add to route config: canActivate: [guestGuard]
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return true; // User not logged in, allow access to login page
  }
  
  // User already logged in, redirect to dashboard
  router.navigate(['/']);
  return false;
};
