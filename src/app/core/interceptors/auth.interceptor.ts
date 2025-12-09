import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

const authUrls = ['auth/login/', 'auth/refresh/', 'auth/register/'];
const skipAuthUrls = ['auth/password/reset/', 'auth/password/reset/confirm/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const url = req.url;
  const isAuthUrl = authUrls.some(authUrl => url.includes(authUrl));
  const isSkipAuthUrl = skipAuthUrls.some(skipUrl => url.includes(skipUrl));

  // Skip adding token for auth and public endpoints
  if (isAuthUrl || isSkipAuthUrl) {
    return next(req);
  }

  // Add auth token to request
  const accessToken = tokenService.getAccessToken();
  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  // Handle token refresh logic
  const isRefreshing = new BehaviorSubject<boolean>(false);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthUrl && accessToken) {
        // Token expired, try to refresh
        if (!isRefreshing.value) {
          isRefreshing.next(true);
          
          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing.next(false);
              // Retry the original request with new token
              const newToken = tokenService.getAccessToken();
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(newReq);
            }),
            catchError(refreshError => {
              isRefreshing.next(false);
              // Refresh failed, logout user
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // Wait for refresh to complete
          return isRefreshing.pipe(
            filter(refreshing => !refreshing),
            take(1),
            switchMap(() => {
              const newToken = tokenService.getAccessToken();
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(newReq);
            })
          );
        }
      }
      
      // Handle other errors
      if (error.status === 403) {
        router.navigate(['/error/403']);
      } else if (error.status === 404) {
        router.navigate(['/error/404']);
      } else if (error.status >= 500) {
        router.navigate(['/error/500']);
      }
      
      return throwError(() => error);
    })
  );
};