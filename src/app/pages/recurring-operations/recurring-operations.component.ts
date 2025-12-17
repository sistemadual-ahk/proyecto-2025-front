import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recurring-operations',
  standalone: true,
  imports: [CommonModule, PageTitleComponent],
  templateUrl: './recurring-operations.component.html',
  styleUrl: './recurring-operations.component.scss'
})
export class RecurringOperationsComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
