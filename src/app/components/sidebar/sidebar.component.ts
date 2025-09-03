import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isMenuOpen = false;
  @Output() closeMenu = new EventEmitter<void>();

  constructor(private router: Router) {}

  onCloseMenu() {
    this.closeMenu.emit();
  }

  openWallets() {
    this.router.navigate(['/wallets']);
    this.onCloseMenu();
  }

  openGoals() {
    this.router.navigate(['/saving-goals']);
    this.onCloseMenu();
  }

  logout(): void {
    console.log('Logout');
    this.router.navigate(['/']);
    this.onCloseMenu();
  }
}
