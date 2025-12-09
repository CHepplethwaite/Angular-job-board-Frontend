import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Protected routes
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
  
  // Admin routes
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  },
  
  // Home route
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomePage)
  },
  
  // Wildcard route (404)
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
