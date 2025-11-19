import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UiButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthStore } from '../../../core/state/auth.store';

@Component({
  selector: 'app-auth-verify-email-page',
  standalone: true,
  imports: [CommonModule, RouterLink, UiButtonComponent],
  templateUrl: './verify-email.page.html',
  styleUrl: './verify-email.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthVerifyEmailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authStore = inject(AuthStore);

  protected readonly status = signal<'idle' | 'success' | 'error'>('idle');
  protected readonly message = signal<string>(
    'Перейдите по ссылке из письма, чтобы подтвердить email.',
  );
  protected readonly email = signal<string | null>(null);
  protected readonly token = signal<string | null>(null);

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');
    if (email && token) {
      this.email.set(email);
      this.token.set(token);
      this.verify();
    }
  }

  async verify() {
    const email = this.email();
    const token = this.token();
    if (!email || !token) {
      this.message.set('Укажите email и токен из письма.');
      return;
    }

    this.status.set('idle');
    try {
      const response = await this.authStore.verifyEmail({ email, token });
      this.status.set('success');
      this.message.set(response.message);
    } catch {
      this.status.set('error');
      this.message.set('Токен недействителен или истёк. Запросите новое письмо.');
    }
  }

  async resend() {
    const email = this.email();
    if (!email) {
      this.message.set('Сначала укажите email через ссылку в письме.');
      return;
    }
    await this.authStore.resendVerification(email);
    this.message.set('Новое письмо отправлено. Проверьте inbox.');
  }
}

