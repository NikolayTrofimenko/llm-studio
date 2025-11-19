import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UiInputComponent } from '../../../shared/ui/input/input.component';
import { UiButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthStore } from '../../../core/state/auth.store';

type ResetForm = {
  email: FormControl<string>;
  token: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-auth-reset-password-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    UiInputComponent,
    UiButtonComponent,
  ],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthResetPasswordPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authStore = inject(AuthStore);

  protected readonly form = new FormGroup<ResetForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    token: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');
    if (email) {
      this.form.controls.email.setValue(email);
    }
    if (token) {
      this.form.controls.token.setValue(token);
    }
  }

  protected passwordsMatch = computed(() => {
    const { password, confirmPassword } = this.form.value;
    return password === confirmPassword;
  });

  async submit() {
    if (this.form.invalid || !this.passwordsMatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.success.set(false);
    const { confirmPassword: _omit, ...payload } = this.form.getRawValue();
    void _omit;

    try {
      await this.authStore.resetPassword(payload);
      this.success.set(true);
      this.form.controls.password.reset('');
      this.form.controls.confirmPassword.reset('');
    } finally {
      this.loading.set(false);
    }
  }
}

