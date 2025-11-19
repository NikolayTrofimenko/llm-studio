import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { compactClassNames } from '../classnames.util';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost';
export type UiButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  @Input() variant: UiButtonVariant = 'primary';
  @Input() size: UiButtonSize = 'md';
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;

  protected get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  protected get buttonClasses(): string[] {
    return compactClassNames([
      `ui-button--${this.variant}`,
      `ui-button--${this.size}`,
      this.fullWidth ? 'ui-button--full' : null,
    ]);
  }
}

