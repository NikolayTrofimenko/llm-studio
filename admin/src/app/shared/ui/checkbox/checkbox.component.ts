import { NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { compactClassNames } from '../classnames.util';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description?: string;
  @Input() error?: string;
  @Input() hint?: string;

  protected checked = false;
  protected isDisabled = false;
  protected isFocused = false;

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: boolean | null): void {
    this.checked = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  protected handleToggle(): void {
    if (this.isDisabled) {
      return;
    }

    this.checked = !this.checked;
    this.onChange(this.checked);
  }

  protected handleFocus(): void {
    this.isFocused = true;
  }

  protected handleBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  protected get hasError(): boolean {
    return !!this.error;
  }

  protected get checkboxClasses(): string[] {
    return compactClassNames([
      this.checked ? 'ui-checkbox--checked' : null,
      this.isFocused ? 'ui-checkbox--focused' : null,
      this.isDisabled ? 'ui-checkbox--disabled' : null,
      this.hasError ? 'ui-checkbox--error' : null,
    ]);
  }
}

