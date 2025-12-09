import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { ApiService } from './api.service';
import { User } from './auth.service';

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: File;
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiService = inject(ApiService);
  
  private readonly isLoading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);
  private readonly userProfile = signal<User | null>(null);
  
  readonly loading = this.isLoading.asReadonly();
  readonly userError = this.error.asReadonly();
  readonly profile = this.userProfile.asReadonly();

  setError(message: string | null) {
    this.error.set(message);
  }

  getUserById(id: number): Observable<User> {
    this.isLoading.set(true);
    
    return this.apiService.get<User>(`users/${id}/`).pipe(
      map(response => response.data), // Extract data from ApiResponse
      tap(() => this.isLoading.set(false)),
      tap({
        error: (error) => {
          this.isLoading.set(false);
          this.error.set(error.message);
        }
      })
    );
  }

  getProfile(): Observable<User> {
    this.isLoading.set(true);
    
    return this.apiService.get<User>('auth/profile/').pipe(
      map(response => response.data), // Extract data from ApiResponse
      tap(user => {
        this.userProfile.set(user);
        this.isLoading.set(false);
      }),
      tap({
        error: (error) => {
          this.isLoading.set(false);
          this.error.set(error.message);
        }
      })
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    let request: Observable<UpdateProfileResponse>;

    if (data.avatar) {
      // Use FormData for file upload
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null) {
          if (key === 'avatar' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      request = this.apiService.upload<UpdateProfileResponse>('auth/profile/', formData).pipe(
        map(response => response.data) // Extract data from ApiResponse
      );
    } else {
      request = this.apiService.patch<UpdateProfileResponse>('auth/profile/', data).pipe(
        map(response => response.data) // Extract data from ApiResponse
      );
    }

    return request.pipe(
      tap(response => {
        this.userProfile.set(response.user);
        this.isLoading.set(false);
      }),
      tap({
        error: (error) => {
          this.isLoading.set(false);
          this.error.set(error.message);
        }
      })
    );
  }

  deleteAccount(password: string): Observable<{ detail: string }> {
    return this.apiService.delete<{ detail: string }>('auth/profile/', {
      body: { password }
    }).pipe(
      map(response => response.data) // Extract data from ApiResponse
    );
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    this.isLoading.set(true);
    
    return this.apiService.patch<User>(`users/${id}/`, data).pipe(
      map(response => response.data), // Extract data from ApiResponse
      tap(() => this.isLoading.set(false)),
      tap({
        error: (error) => {
          this.isLoading.set(false);
          this.error.set(error.message);
        }
      })
    );
  }

  deleteUser(id: number): Observable<{ detail: string }> {
    return this.apiService.delete<{ detail: string }>(`users/${id}/`).pipe(
      map(response => response.data) // Extract data from ApiResponse
    );
  }

  activateUser(id: number): Observable<User> {
    return this.apiService.post<User>(`users/${id}/activate/`, {}).pipe(
      map(response => response.data) // Extract data from ApiResponse
    );
  }

  deactivateUser(id: number): Observable<User> {
    return this.apiService.post<User>(`users/${id}/deactivate/`, {}).pipe(
      map(response => response.data) // Extract data from ApiResponse
    );
  }

  resetUserPassword(id: number): Observable<{ detail: string }> {
    return this.apiService.post<{ detail: string }>(`users/${id}/reset-password/`, {}).pipe(
      map(response => response.data) // Extract data from ApiResponse
    );
  }

  clearError(): void {
    this.error.set(null);
  }
}