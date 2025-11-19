import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, from } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { appConfig } from '../config/app-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const isApiRequest = req.url.startsWith(appConfig.apiUrl);
  const isAuthEndpoint = isApiRequest && req.url.includes('/auth/');
  const isRefreshEndpoint = isAuthEndpoint && req.url.includes('/auth/refresh');
  const token = authStore.accessToken();

  let authReq = req;
  if (isApiRequest) {
    authReq = req.clone({
      withCredentials: true,
      setHeaders:
        token && !isRefreshEndpoint ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const shouldRetry =
        isApiRequest &&
        !isRefreshEndpoint &&
        error.status === 401 &&
        !authReq.headers.has('x-retry');

      if (!shouldRetry) {
        return throwError(() => error);
      }

      return from(authStore.refreshAccessToken(true)).pipe(
        switchMap(() => {
          const refreshedToken = authStore.accessToken();
          let headers = authReq.headers.set('x-retry', '1');
          if (refreshedToken) {
            headers = headers.set('Authorization', `Bearer ${refreshedToken}`);
          } else {
            headers = headers.delete('Authorization');
          }
          const retryReq = authReq.clone({ headers });
          return next(retryReq);
        }),
        catchError(() => throwError(() => error)),
      );
    }),
  );
};

