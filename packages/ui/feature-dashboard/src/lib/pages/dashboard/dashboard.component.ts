import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="ap-h-full ap-p-5">
      <div class="ap-typography-headline-5 ap-mb-5">Dashboard</div>
      <div class="ap-typography-body-1">Welcome to your dashboard!</div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
