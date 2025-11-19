import { NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { compactClassNames } from '../classnames.util';

type UiInputSize = 'sm' | 'md' | 'lg';
type UiInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint?: string;
  @Input() error?: string;
  @Input() placeholder = '';
  @Input() type: UiInputType = 'text';
  @Input() required = false;
  @Input() prefix?: string;
  @Input() suffix?: string;
  @Input() size: UiInputSize = 'md';

  protected value = '';
  protected isDisabled = false;
  protected isFocused = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  protected handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
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

  protected get fieldClasses(): string[] {
    return compactClassNames([
      `ui-field--${this.size}`,
      this.hasError ? 'ui-field--error' : null,
      this.isFocused ? 'ui-field--focused' : null,
      this.isDisabled ? 'ui-field--disabled' : null,
    ]);
  }
}

