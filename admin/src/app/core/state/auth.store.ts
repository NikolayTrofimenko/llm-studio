import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService, LoginPayload, RegisterPayload, ResetPasswordPayload, ForgotPasswordPayload, VerifyEmailPayload } from '../api/auth.api';
import { User } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'madam-coco:access-token';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly tokenSignal = signal<string | null>(this.loadToken());
  private readonly userSignal = signal<User | null>(null);
  private readonly statusSignal = signal<'idle' | 'loading' | 'ready'>('idle');
  private refreshPromise?: Promise<void>;

  readonly user = this.userSignal.asReadonly();
  readonly accessToken = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly hydrationReady = computed(() => this.statusSignal() === 'ready');

  private loadToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private persistToken(token: string | null) {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    this.tokenSignal.set(token);
  }

  async hydrate() {
    if (this.statusSignal() === 'loading') {
      return this.refreshPromise;
    }
    if (this.statusSignal() === 'ready') {
      return;
    }

    this.statusSignal.set('loading');
    try {
      await this.refreshAccessToken();
    } catch {
      this.clearSession();
    } finally {
      this.statusSignal.set('ready');
    }
  }

  async login(payload: LoginPayload) {
    const response = await firstValueFrom(this.api.login(payload));
    this.persistToken(response.accessToken);
    this.userSignal.set(response.user);
    await this.router.navigateByUrl('/app');
  }

  register(payload: RegisterPayload) {
    return firstValueFrom(this.api.register(payload));
  }

  forgotPassword(payload: ForgotPasswordPayload) {
    return firstValueFrom(this.api.forgotPassword(payload));
  }

  resetPassword(payload: ResetPasswordPayload) {
    return firstValueFrom(this.api.resetPassword(payload));
  }

  verifyEmail(payload: VerifyEmailPayload) {
    return firstValueFrom(this.api.verifyEmail(payload));
  }

  resendVerification(email: string) {
    return firstValueFrom(this.api.resendVerification(email));
  }

  async logout() {
    try {
      await firstValueFrom(this.api.logout());
    } finally {
      this.clearSession();
    }
    await this.router.navigate(['/auth/login']);
  }

  async refreshAccessToken(force = false) {
    if (this.refreshPromise && !force) {
      return this.refreshPromise;
    }
    this.refreshPromise = (async () => {
      try {
        const response = await firstValueFrom(this.api.refresh());
        this.persistToken(response.accessToken);
        this.userSignal.set(response.user);
      } catch (error) {
        this.clearSession();
        throw error;
      } finally {
        this.refreshPromise = undefined;
      }
    })();
    return this.refreshPromise;
  }

  async ensureAuthenticated(): Promise<boolean> {
    await this.hydrate();
    if (this.isAuthenticated()) {
      return true;
    }
    await this.router.navigate(['/auth/login']);
    return false;
  }

  async ensureGuest(): Promise<boolean> {
    await this.hydrate();
    if (!this.isAuthenticated()) {
      return true;
    }
    await this.router.navigate(['/app']);
    return false;
  }

  private clearSession() {
    this.persistToken(null);
    this.userSignal.set(null);
  }
}

