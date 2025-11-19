import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/theme/theme-toggle.component';
import { AuthStore } from '../../core/state/auth.store';

@Component({
  selector: 'app-protected-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    ThemeToggleComponent,
  ],
  templateUrl: './protected-shell.component.html',
  styleUrl: './protected-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtectedShellComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly currentYear = new Date().getFullYear();

  async logout() {
    await this.authStore.logout();
  }
}

