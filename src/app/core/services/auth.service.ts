import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, throwError, interval, switchMap, of, catchError } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';
import { TokenService, AuthTokens } from './token.service';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  bio: string | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  groups: string[];
  user_permissions: string[];
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  // Signals for reactive state management
  private readonly currentUser = signal<User | null>(null);
  private readonly isAuthenticated = signal(false);
  private readonly isLoading = signal(false);
  private readonly error = signal<string | null>(null);

  // Public readonly signals
  readonly user = this.currentUser.asReadonly();
  readonly authenticated = this.isAuthenticated.asReadonly();
  readonly loading = this.isLoading.asReadonly();
  readonly authError = this.error.asReadonly();

  constructor() {
    // Initialize authentication state
    this.initializeAuth();
    
    // Set up token refresh interval
    this.setupTokenRefresh();
  }

  private initializeAuth(): void {
    if (this.tokenService.isAuthenticated()) {
      this.loadUserProfile().subscribe();
    }
  }

  private setupTokenRefresh(): void {
    // Check token expiry every minute
    interval(60000).subscribe(() => {
      if (this.tokenService.isAuthenticated()) {
        const expiryTime = this.tokenService.getTokenExpiryTime();
        const now = Date.now();
        
        // Refresh token if it expires in less than 5 minutes
        if (expiryTime && expiryTime - now < 300000) {
          this.refreshToken().subscribe();
        }
      }
    });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.apiService.post<LoginResponse>('auth/login/', credentials).pipe(
      tap(response => {
        this.tokenService.setTokens(response.tokens);
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        this.error.set(error.message || 'Login failed');
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<User>> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.apiService.post<ApiResponse<User>>('auth/register/', data).pipe(
      tap(response => {
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.isLoading.set(false);
        this.error.set(error.message || 'Registration failed');
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    
    if (refreshToken) {
      this.apiService.post('auth/logout/', { refresh: refreshToken }).subscribe({
        next: () => this.completeLogout(),
        error: () => this.completeLogout() // Logout locally even if API fails
      });
    } else {
      this.completeLogout();
    }
  }

  private completeLogout(): void {
    this.tokenService.logout(false);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  loadUserProfile(): Observable<User> {
    return this.apiService.get<User>('auth/profile/').pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }),
      catchError(error => {
        if (error.status === 401) {
          this.tokenService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.tokenService.getRefreshToken();
    
    if (!refreshToken) {
      this.tokenService.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post<AuthTokens>('auth/refresh/', { refresh: refreshToken }).pipe(
      tap(tokens => {
        this.tokenService.setTokens(tokens);
      }),
      catchError(error => {
        this.tokenService.logout();
        return throwError(() => error);
      })
    );
  }

  requestPasswordReset(email: string): Observable<ApiResponse<{ detail: string }>> {
    return this.apiService.post('auth/password/reset/', { email });
  }

  confirmPasswordReset(uid: string, token: string, newPassword: string): Observable<ApiResponse<{ detail: string }>> {
    return this.apiService.post('auth/password/reset/confirm/', {
      uid,
      token,
      new_password: newPassword
    });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<ApiResponse<{ detail: string }>> {
    return this.apiService.post('auth/password/change/', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  verifyEmail(uid: string, token: string): Observable<ApiResponse<{ detail: string }>> {
    return this.apiService.post('auth/verify-email/', { uid, token });
  }

  resendVerificationEmail(email: string): Observable<ApiResponse<{ detail: string }>> {
    return this.apiService.post('auth/resend-verification/', { email });
  }

  clearError(): void {
    this.error.set(null);
  }

  // ADD THIS METHOD TO FIX THE ERROR
  setAuthError(message: string | null): void {
    this.error.set(message);
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  hasPermission(permission: string): boolean {
    return this.tokenService.hasPermission(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return this.tokenService.hasAnyPermission(permissions);
  }

  hasAllPermissions(permissions: string[]): boolean {
    return this.tokenService.hasAllPermissions(permissions);
  }
}