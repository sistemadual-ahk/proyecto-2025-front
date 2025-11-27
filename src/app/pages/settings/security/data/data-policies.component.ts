import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../../../components/page-title/page-title.component';

@Component({
  selector: 'app-data-policies',
  standalone: true,
  imports: [CommonModule, PageTitleComponent],
  templateUrl: './data-policies.component.html',
  styleUrl: './data-policies.component.scss',
})
export class DataPoliciesComponent {
  constructor(private router: Router) {}

  goBack(): void {
    // Navegación específica de vuelta a security
    this.router.navigate(['/settings/security']).catch(() => {
      // Fallback si hay problemas con la navegación
      window.history.back();
    });
  }

  accept(): void {
    // Después de aceptar, volver a security
    this.router.navigate(['/settings/security']).catch(() => {
      window.history.back();
    });
  }
}


