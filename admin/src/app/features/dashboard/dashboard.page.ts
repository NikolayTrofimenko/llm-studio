import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  readonly widgets = [
    {
      title: 'FAQ карточек',
      value: '128',
      trend: '+12% за неделю',
    },
    {
      title: 'Диалогов в очереди',
      value: '42',
      trend: 'ручная эскалация активна',
    },
    {
      title: 'CSAT',
      value: '4.82',
      trend: '+0.2 к прошлой неделе',
    },
  ];
}

