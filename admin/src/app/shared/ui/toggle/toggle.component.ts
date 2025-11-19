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
  selector: 'ui-toggle',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiToggleComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiToggleComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description?: string;
  @Input() hint?: string;

  protected value = false;
  protected isDisabled = false;
  protected isFocused = false;

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: boolean | null): void {
    this.value = !!value;
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

  protected toggle(): void {
    if (this.isDisabled) {
      return;
    }

    this.value = !this.value;
    this.onChange(this.value);
  }

  protected handleFocus(): void {
    this.isFocused = true;
  }

  protected handleBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  protected get toggleClasses(): string[] {
    return compactClassNames([
      this.value ? 'ui-toggle--on' : null,
      this.isDisabled ? 'ui-toggle--disabled' : null,
      this.isFocused ? 'ui-toggle--focused' : null,
    ]);
  }
}

