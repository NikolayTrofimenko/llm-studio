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

type ForgotForm = {
  email: FormControl<string>;
};

@Component({
  selector: 'app-auth-forgot-password-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    UiInputComponent,
    UiButtonComponent,
  ],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthForgotPasswordPageComponent {
  private readonly authStore = inject(AuthStore);

  protected readonly form = new FormGroup<ForgotForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  protected readonly loading = signal(false);
  protected readonly message = signal<string | null>(null);

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.message.set(null);
    try {
      const { email } = this.form.getRawValue();
      const response = await this.authStore.forgotPassword({ email });
      this.message.set(response.message);
      this.form.reset();
    } finally {
      this.loading.set(false);
    }
  }
}

