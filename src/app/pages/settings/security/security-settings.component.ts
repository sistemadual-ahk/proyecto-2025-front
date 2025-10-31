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
    this.router.navigate(['/settings']);
  }
}


