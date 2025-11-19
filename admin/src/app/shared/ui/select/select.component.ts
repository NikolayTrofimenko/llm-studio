import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiOption } from '../ui-option.model';
import { compactClassNames } from '../classnames.util';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint?: string;
  @Input() error?: string;
  @Input() placeholder = 'Выберите значение';
  @Input() options: UiOption[] = [];
  @Input() required = false;

  protected value: string | null = null;
  protected isDisabled = false;
  protected isFocused = false;

  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  protected onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value || null;
    this.onChange(this.value);
  }

  protected handleFocus(): void {
    this.isFocused = true;
  }

  protected handleBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  protected trackByValue(_: number, option: UiOption): string {
    return String(option.value);
  }

  protected get hasError(): boolean {
    return !!this.error;
  }

  protected get selectClasses(): string[] {
    return compactClassNames([
      this.hasError ? 'ui-select--error' : null,
      this.isFocused ? 'ui-select--focused' : null,
      this.isDisabled ? 'ui-select--disabled' : null,
    ]);
  }
}

