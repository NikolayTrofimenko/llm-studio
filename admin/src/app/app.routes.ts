import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.page').then(
        (m) => m.LandingPageComponent,
      ),
  },
  {
    path: 'shared',
    loadComponent: () =>
      import('./pages/shared/shared-gallery.component').then(
        (m) => m.SharedGalleryComponent,
      ),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layouts/auth-shell/auth-shell.component').then(
        (m) => m.AuthShellComponent,
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.page').then(
            (m) => m.AuthLoginPageComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.page').then(
            (m) => m.AuthRegisterPageComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.page').then(
            (m) => m.AuthForgotPasswordPageComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.page').then(
            (m) => m.AuthResetPasswordPageComponent,
          ),
      },
      {
        path: 'verify',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.page').then(
            (m) => m.AuthVerifyEmailPageComponent,
          ),
      },
    ],
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/protected-shell/protected-shell.component').then(
        (m) => m.ProtectedShellComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then(
            (m) => m.DashboardPageComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
