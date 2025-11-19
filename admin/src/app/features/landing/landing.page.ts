import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/theme/theme-toggle.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  readonly currentYear = new Date().getFullYear();
  readonly highlights = [
    { title: 'JWT + Refresh', description: 'Безопасные сессии и ротация токенов' },
    { title: 'Email flow', description: 'Подтверждение и восстановление' },
    { title: 'Adaptive UI', description: 'Shared kit + тёмная тема' },
  ];

  readonly steps = [
    'Создайте аккаунт и подтвердите email',
    'Настройте команды и роли в админке',
    'Подключите FAQ и маршрутизацию диалогов',
  ];
}

