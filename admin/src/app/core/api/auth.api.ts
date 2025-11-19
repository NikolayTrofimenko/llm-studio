import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appConfig } from '../config/app-config';
import { User } from '../models/user.model';

interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  firstName?: string;
  lastName?: string;
}

export interface ApiMessageResponse {
  message: string;
  devLink?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${appConfig.apiUrl}/auth`;

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload, {
      withCredentials: true,
    });
  }

  register(payload: RegisterPayload) {
    return this.http.post<ApiMessageResponse>(
      `${this.baseUrl}/register`,
      payload,
      { withCredentials: true },
    );
  }

  refresh() {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/refresh`,
      {},
      { withCredentials: true },
    );
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }

  me() {
    return this.http.get<User>(`${this.baseUrl}/me`, {
      withCredentials: true,
    });
  }

  forgotPassword(payload: ForgotPasswordPayload) {
    return this.http.post<ApiMessageResponse>(
      `${this.baseUrl}/forgot-password`,
      payload,
    );
  }

  resetPassword(payload: ResetPasswordPayload) {
    return this.http.post<ApiMessageResponse>(
      `${this.baseUrl}/reset-password`,
      payload,
    );
  }

  verifyEmail(payload: VerifyEmailPayload) {
    return this.http.post<ApiMessageResponse>(
      `${this.baseUrl}/verify-email`,
      payload,
    );
  }

  resendVerification(email: string) {
    return this.http.post<ApiMessageResponse>(
      `${this.baseUrl}/resend-verification`,
      { email },
    );
  }
}

