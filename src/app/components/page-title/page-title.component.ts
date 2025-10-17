import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-title.component.html',
  styleUrl: './page-title.component.scss'
})
export class PageTitleComponent {
  @Input() title = '';
  @Input() showBack = true;
  @Input() backRoute?: any[] | string;
  @Output() back = new EventEmitter<void>();

  constructor(private router: Router) {}

  onBackClick() {
    if (this.back.observed) {
      this.back.emit();
      return;
    }
    if (this.backRoute) {
      if (Array.isArray(this.backRoute)) {
        this.router.navigate(this.backRoute as any[]);
      } else {
        this.router.navigate([this.backRoute]);
      }
      return;
    }
    // fallback: navigate to home
    this.router.navigate(['/home']);
  }
}
