import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpContext } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private getHeaders(additionalHeaders?: Record<string, string>): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-App-Version': environment.version
    });

    if (additionalHeaders) {
      Object.keys(additionalHeaders).forEach(key => {
        headers = headers.set(key, additionalHeaders[key]);
      });
    }

    return headers;
  }

  get<T>(endpoint: string, params?: any, options?: {
    headers?: Record<string, string>;
    context?: HttpContext;
  }): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              httpParams = httpParams.append(key, value);
            });
          } else {
            httpParams = httpParams.set(key, params[key]);
          }
        }
      });
    }

    return this.http.get<ApiResponse<T>>(url, {
      headers: this.getHeaders(options?.headers),
      params: httpParams,
      context: options?.context
    }).pipe(
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data: any, options?: {
    headers?: Record<string, string>;
    context?: HttpContext;
  }): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.post<ApiResponse<T>>(url, data, {
      headers: this.getHeaders(options?.headers),
      context: options?.context
    }).pipe(
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, data: any, options?: {
    headers?: Record<string, string>;
    context?: HttpContext;
  }): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.put<ApiResponse<T>>(url, data, {
      headers: this.getHeaders(options?.headers),
      context: options?.context
    }).pipe(
      catchError(this.handleError)
    );
  }

  patch<T>(endpoint: string, data: any, options?: {
    headers?: Record<string, string>;
    context?: HttpContext;
  }): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.patch<ApiResponse<T>>(url, data, {
      headers: this.getHeaders(options?.headers),
      context: options?.context
    }).pipe(
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string, options?: {
    headers?: Record<string, string>;
    context?: HttpContext;
    body?: any;
  }): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.delete<ApiResponse<T>>(url, {
      headers: this.getHeaders(options?.headers),
      context: options?.context,
      body: options?.body
    }).pipe(
      catchError(this.handleError)
    );
  }

  upload<T>(endpoint: string, formData: FormData): Observable<ApiResponse<T>> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = new HttpHeaders({
      'X-App-Version': environment.version
      // Don't set Content-Type for FormData, let browser set it
    });

    return this.http.post<ApiResponse<T>>(url, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.error && error.error.detail) {
      errorMessage = error.error.detail;
    } else if (error.error && typeof error.error === 'object') {
      // Handle Django error format
      const errorObj = error.error;
      if (errorObj.non_field_errors) {
        errorMessage = Array.isArray(errorObj.non_field_errors) 
          ? errorObj.non_field_errors.join(', ')
          : errorObj.non_field_errors;
      } else {
        const messages: string[] = [];
        Object.keys(errorObj).forEach(key => {
          if (Array.isArray(errorObj[key])) {
            messages.push(`${key}: ${errorObj[key].join(', ')}`);
          } else {
            messages.push(`${key}: ${errorObj[key]}`);
          }
        });
        errorMessage = messages.join('; ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}