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
    this.router.navigate(['/settings/security']);
  }

  accept(): void {
    this.router.navigate(['/settings/security']);
  }
}


