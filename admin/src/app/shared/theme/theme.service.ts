import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  RendererFactory2,
  signal,
  inject,
} from '@angular/core';

export type ThemeName = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'madam-coco-theme';
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private readonly prefersDarkMedia =
    this.isBrowser() && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  private readonly currentThemeSignal = signal<ThemeName>('light');

  readonly theme = this.currentThemeSignal.asReadonly();

  constructor() {
    this.initializeTheme();
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: ThemeName): void {
    this.applyTheme(theme, true);
  }

  private initializeTheme(): void {
    const stored = this.readStoredTheme();
    const fallback: ThemeName =
      stored ??
      (this.prefersDarkMedia && this.prefersDarkMedia.matches ? 'dark' : 'light');

    this.applyTheme(fallback, false);

    if (this.prefersDarkMedia) {
      this.prefersDarkMedia.addEventListener('change', (event) => {
        if (!this.readStoredTheme()) {
          this.applyTheme(event.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  private applyTheme(theme: ThemeName, persist: boolean): void {
    this.currentThemeSignal.set(theme);

    if (this.isBrowser()) {
      this.renderer.setAttribute(
        this.document.documentElement,
        'data-theme',
        theme,
      );

      if (persist) {
        localStorage.setItem(this.storageKey, theme);
      }
    }
  }

  private readStoredTheme(): ThemeName | null {
    if (!this.isBrowser()) {
      return null;
    }

    const value = localStorage.getItem(this.storageKey);
    return value === 'light' || value === 'dark' ? value : null;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

