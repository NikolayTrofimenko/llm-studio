export interface UiOption<T = string> {
  label: string;
  value: T;
  description?: string;
  hint?: string;
  disabled?: boolean;
}

