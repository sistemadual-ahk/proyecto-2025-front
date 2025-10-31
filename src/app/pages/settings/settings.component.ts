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
    this.router.navigate(['../']);
  }

  openProfile(): void {
    // Placeholder: adjust when profile route is ready
    this.router.navigate(['/profile']);
  }

  openSecurity(): void {
    // Placeholder for a future security route
    // this.router.navigate(['/security']);
  }

  openNotifications(): void {
    // Placeholder for a future notifications route
    // this.router.navigate(['/notifications']);
  }

  openLanguage(): void {
    // Placeholder for a future language route
    // this.router.navigate(['/language']);
  }

  logout(): void {
    // TODO: Hook into auth service when available
    this.router.navigate(['/login']);
  }
}