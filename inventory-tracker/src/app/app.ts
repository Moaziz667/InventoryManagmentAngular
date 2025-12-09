/**
 * APP ROOT COMPONENT
 * 
 * This is the main application shell that wraps all pages.
 * It provides:
 * - Navigation bar (top)
 * - User menu with logout
 * - Page content area (changes based on current route)
 * - Footer
 * - Dark/Light theme toggle
 * 
 * All pages are rendered inside <router-outlet>
 */
import { Component, computed, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, ChildrenOutletContexts } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { routeAnimations } from './animations/route-animations';

/**
 * Notification interface for displaying alerts/messages
 */
interface Notification {
  id: number;
  title: string;
  icon: string;
  type: 'warning' | 'success' | 'info';
  time: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink,
    RouterLinkActive,
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeAnimations]
})
export class App {
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());
  currentYear = new Date().getFullYear();
  
  // Notifications
  notifications = signal<Notification[]>([
    { id: 1, title: 'Low stock alert: Wireless Mouse', icon: 'warning', type: 'warning', time: '2 min ago' },
    { id: 2, title: 'New product added successfully', icon: 'check_circle', type: 'success', time: '1 hour ago' },
    { id: 3, title: 'System backup completed', icon: 'info', type: 'info', time: '3 hours ago' }
  ]);
  
  notificationCount = computed(() => this.notifications().length);
  
  constructor(
    public authService: AuthService,
    private router: Router,
    private contexts: ChildrenOutletContexts
  ) {}
  
  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  clearNotifications() {
    this.notifications.set([]);
  }
  
  focusDashboardSearch() {
    // Navigate to dashboard and trigger search focus
    if (this.router.url !== '/') {
      this.router.navigate(['/']);
    }
    // Dispatch custom event for dashboard to focus search
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('focusSearch'));
    }, 100);
  }
  
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    // Only handle if authenticated
    if (!this.isAuthenticated()) return;
    
    // Ctrl+N - New Product (handled in dashboard)
    // Ctrl+F - Focus Search
    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault();
      this.focusDashboardSearch();
    }
    
    // Ctrl+R - Refresh (handled in dashboard)
    // Escape is handled by dialogs automatically
  }
}
