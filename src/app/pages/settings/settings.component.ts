import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../components/page-title/page-title.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    PageTitleComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.components.scss',
})
export class SettingsComponent {
  constructor(private router: Router) {}

  goBack(): void {
    // Desde settings principal, volvemos al home
    this.router.navigate(['/home']).catch(() => {
      window.history.back();
    });
  }

  openProfile(): void {
    // Pasar estado para que el perfil sepa volver a Ajustes
    this.router.navigate(['/profile'], { state: { fromSettings: true } }).catch(() => {
      console.error('Error navigating to profile');
    });
  }

  openSecurity(): void {
    this.router.navigate(['/settings/security']).catch(() => {
      console.error('Error navigating to security');
    });
  }

  openNotifications(): void {
    this.router.navigate(['/settings/notifications']).catch(() => {
      console.error('Error navigating to notifications');
    });
  }

  logout(): void {
    // TODO: Hook into auth service when available
    this.router.navigate(['/login']).catch(() => {
      console.error('Error during logout');
    });
  }
  
}