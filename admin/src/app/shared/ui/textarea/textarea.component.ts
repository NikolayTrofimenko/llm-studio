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
  selector: 'ui-textarea',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextareaComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint?: string;
  @Input() error?: string;
  @Input() placeholder = '';
  @Input() required = false;
  @Input() rows = 4;

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
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  protected handleBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  protected handleFocus(): void {
    this.isFocused = true;
  }

  protected get hasError(): boolean {
    return !!this.error;
  }

  protected get textareaClasses(): string[] {
    return compactClassNames([
      this.hasError ? 'ui-textarea--error' : null,
      this.isFocused ? 'ui-textarea--focused' : null,
      this.isDisabled ? 'ui-textarea--disabled' : null,
    ]);
  }
}

