import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../../components/page-title/page-title.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-notifications-settings',
  standalone: true,
  imports: [CommonModule, PageTitleComponent, MatSlideToggleModule],
  templateUrl: './notifications-settings.component.html',
  styleUrl: './notifications-settings.component.scss',
})
export class NotificationsSettingsComponent {
  allowNotifications = this.readInitialPreference();

  constructor(private router: Router) {}

  goBack(): void {
    // Navegación específica de vuelta a settings
    this.router.navigate(['/settings']).catch(() => {
      // Fallback si hay problemas con la navegación
      window.history.back();
    });
  }

  onToggleChange(checked: boolean): void {
    this.allowNotifications = checked;
    try {
      localStorage.setItem('allowNotifications', JSON.stringify(checked));
    } catch {}
  }

  private readInitialPreference(): boolean {
    try {
      const saved = localStorage.getItem('allowNotifications');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  }
}



