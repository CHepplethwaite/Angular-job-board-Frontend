import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface TokenPayload {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  username: string;
  email: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  permissions?: string[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly router = inject(Router);
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh);
    
    // Store expiry time for proactive refresh
    const decoded = jwtDecode<TokenPayload>(tokens.access);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, decoded.exp.toString());
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  isTokenExpired(token?: string): boolean {
    try {
      const accessToken = token || this.getAccessToken();
      if (!accessToken) return true;

      const decoded = jwtDecode<TokenPayload>(accessToken);
      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiryTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  getTokenExpiryTime(): number | null {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) * 1000 : null;
  }

  getTokenPayload(): TokenPayload | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  hasPermission(permission: string): boolean {
    const payload = this.getTokenPayload();
    if (!payload) return false;

    // For superuser/staff
    if (payload.is_superuser) return true;
    if (payload.is_staff && permission.includes('view')) return true;

    // Check specific permissions
    return payload.permissions?.includes(permission) || false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  getUserId(): number | null {
    const payload = this.getTokenPayload();
    return payload?.user_id || null;
  }

  getUsername(): string | null {
    const payload = this.getTokenPayload();
    return payload?.username || null;
  }

  getUserEmail(): string | null {
    const payload = this.getTokenPayload();
    return payload?.email || null;
  }

  isStaff(): boolean {
    const payload = this.getTokenPayload();
    return payload?.is_staff || false;
  }

  isSuperuser(): boolean {
    const payload = this.getTokenPayload();
    return payload?.is_superuser || false;
  }

  logout(redirectToLogin: boolean = true): void {
    this.clearTokens();
    if (redirectToLogin) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
    }
  }
}