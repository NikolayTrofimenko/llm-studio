import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {
  UiButtonComponent,
  UiCheckboxComponent,
  UiInputComponent,
  UiOption,
  UiSelectComponent,
  UiTextareaComponent,
  UiToggleComponent,
} from '../../shared';

type BriefFormShape = {
  fullName: FormControl<string>;
  email: FormControl<string>;
  projectType: FormControl<string>;
  message: FormControl<string>;
  updates: FormControl<boolean>;
  marketing: FormControl<boolean>;
};

type PreviewFormShape = {
  instantPreview: FormControl<boolean>;
  pushNotifications: FormControl<boolean>;
};

@Component({
  selector: 'app-shared-gallery',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UiButtonComponent,
    UiCheckboxComponent,
    UiInputComponent,
    UiSelectComponent,
    UiTextareaComponent,
    UiToggleComponent,
  ],
  templateUrl: './shared-gallery.component.html',
  styleUrl: './shared-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedGalleryComponent {
  readonly briefForm = new FormGroup<BriefFormShape>({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    projectType: new FormControl('design', { nonNullable: true }),
    message: new FormControl('', { nonNullable: true }),
    updates: new FormControl(true, { nonNullable: true }),
    marketing: new FormControl(false, { nonNullable: true }),
  });

  readonly projectOptions: UiOption[] = [
    { label: 'Product design sprint', value: 'design' },
    { label: 'Angular UI migration', value: 'angular' },
    { label: 'Design system audit', value: 'audit' },
    { label: 'Branding refresh', value: 'branding' },
  ];

  readonly previewForm = new FormGroup<PreviewFormShape>({
    instantPreview: new FormControl(true, { nonNullable: true }),
    pushNotifications: new FormControl(false, { nonNullable: true }),
  });

  readonly statusBadges = [
    { title: 'Adaptive', subtitle: 'Fluid grid 320-1920px' },
    { title: 'Themed', subtitle: 'Light & dark tokens' },
    { title: 'Accessible', subtitle: 'WCAG AA contrast' },
  ];

  readonly upcomingComponents = [
    'Date picker',
    'Stepper',
    'Tag input',
    'File uploader',
  ];

  protected submitBrief(): void {
    if (this.briefForm.invalid) {
      this.briefForm.markAllAsTouched();
    }
  }

  protected controlError(control: AbstractControl | null): string | undefined {
    if (!this.shouldShowError(control)) {
      return undefined;
    }

    if (control?.hasError('required')) {
      return 'Поле обязательно';
    }

    if (control?.hasError('email')) {
      return 'Введите корректный email';
    }

    return 'Проверьте значение';
  }

  protected shouldShowError(control: AbstractControl | null): boolean {
    if (!control) {
      return false;
    }

    return control.invalid && (control.dirty || control.touched);
  }
}

