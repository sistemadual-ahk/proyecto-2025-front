import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

export interface SidebarItem {
  icon?: string; // opcional: clase de icono (ej. "bx bx-home")
  label: string; // texto visible
  route?: string; // ruta de navegación
  key?: string; // id interno si lo necesitás
  logout?: boolean; // marcar item de logout
  active?: boolean; // estado activo
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  isOpen = false;
  perfilHabilitado = false;
  ajustesHabilitado = false;
  @Input() items: SidebarItem[] = [];
  @Output() closeEvent = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();

  constructor(
    private router: Router,
    public auth: AuthService
  ) {}

  get currentDate(): string {
    const fecha = new Date();
    const meses = [
      'Ene.',
      'Feb.',
      'Mar.',
      'Abr.',
      'May.',
      'Jun.',
      'Jul.',
      'Ago.',
      'Sep.',
      'Oct.',
      'Nov.',
      'Dic.',
    ];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia} ${mes} ${año}`;
  }

  onNavigate(route: string) {
    this.router.navigate([route]);
  }

  // Métodos para el menú
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
  openMenu() {
    this.isOpen = true;
  }
  closeMenu() {
    this.isOpen = false;
  }

  onEditProfile() {
    this.editProfile.emit();
    this.closeMenu();
  }

  onItemClick(item: SidebarItem) {
    if (item.logout) {
      this.logoutEvent.emit();
      return;
    }
    if (item.route) {
      this.router.navigate([item.route]);
      this.closeMenu();
    }
  }

  onLogout() {
    this.logoutEvent.emit();
  }
}
