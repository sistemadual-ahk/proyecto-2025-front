import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../../components/page-title/page-title.component';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, PageTitleComponent],
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss',
})
export class SecuritySettingsComponent {
  constructor(private router: Router) {}

  goBack(): void {
    // Navegación específica de vuelta a settings
    this.router.navigate(['/settings']).catch(() => {
      // Fallback si hay problemas con la navegación
      window.history.back();
    });
  }

  openPin(): void {
    this.router.navigate(['/settings/security/pin']).catch(() => {
      console.error('Error navigating to PIN settings');
    });
  }

  openPolicies(): void {
    this.router.navigate(['/settings/security/data']).catch(() => {
      console.error('Error navigating to policies');
    });
  }
}


