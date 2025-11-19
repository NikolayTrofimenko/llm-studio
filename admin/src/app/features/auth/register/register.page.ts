import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiInputComponent } from '../../../shared/ui/input/input.component';
import { UiButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthStore } from '../../../core/state/auth.store';

type RegisterForm = {
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-auth-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    UiInputComponent,
    UiButtonComponent,
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthRegisterPageComponent {
  private readonly authStore = inject(AuthStore);

  protected readonly form = new FormGroup<RegisterForm>({
    firstName: new FormControl<string | null>(null),
    lastName: new FormControl<string | null>(null),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly loading = signal(false);
  protected readonly success = signal(false);
  protected readonly successMessage = signal('Готово! Проверьте почту.');
  protected readonly devLink = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  async submit() {
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.devLink.set(null);
    this.successMessage.set('Готово! Проверьте почту.');

    try {
      const { confirmPassword: _omit, ...payload } = this.form.getRawValue();
      void _omit;
      const response = await this.authStore.register({
        ...payload,
        firstName: payload.firstName ?? undefined,
        lastName: payload.lastName ?? undefined,
      });
      this.successMessage.set(response.message);
      if (response.devLink) {
        this.devLink.set(response.devLink);
      }
      this.success.set(true);
      this.form.reset();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'Не удалось создать аккаунт, попробуйте позже.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  protected passwordsMatch() {
    const { password, confirmPassword } = this.form.value;
    return password === confirmPassword;
  }
}

