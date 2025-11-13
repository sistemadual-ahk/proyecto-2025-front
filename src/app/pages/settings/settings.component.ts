import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddAccountModalComponent } from '../../components/add-account-modal/add-account-modal.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    AddAccountModalComponent,
    HeaderComponent,
    SidebarComponent,
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
    // Placeholder: adjust when profile route is ready
    this.router.navigate(['/profile']).catch(() => {
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

  openPrivacy(): void {
    // Por ahora navegamos a settings, puedes crear la pantalla después
    console.log('Privacy settings - pantalla pendiente de crear');
    // this.router.navigate(['/settings/privacy']);
  }

  openHelp(): void {
    // Por ahora navegamos a settings, puedes crear la pantalla después
    console.log('Help settings - pantalla pendiente de crear');
    // this.router.navigate(['/settings/help']);
  }

  openAbout(): void {
    // Por ahora navegamos a settings, puedes crear la pantalla después
    console.log('About settings - pantalla pendiente de crear');
    // this.router.navigate(['/settings/about']);
  }

  logout(): void {
    // TODO: Hook into auth service when available
    this.router.navigate(['/login']).catch(() => {
      console.error('Error during logout');
    });
  }
  
}