import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';


export interface SidebarItem {
  icon?: string;       // opcional: clase de icono (ej. "bx bx-home")
  label: string;       // texto visible
  route?: string;      // ruta de navegación
  key?: string;        // id interno si lo necesitás
  logout?: boolean;    // marcar item de logout
  active?: boolean;    // estado activo
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  
  /** Estado abierto/cerrado del sidebar, manejado internamente */
  isOpen = false;

  constructor(private router: Router) {}

  onNavigate(route: string) {
    this.router.navigate([route]); // <-- acá sí navega
  }

  /** Nombre de usuario para la sección de perfil (opcional) */
  @Input() userName = '';



  /** Items de navegación (si no los pasás, podés hardcodearlos en el HTML) */
  @Input() items: SidebarItem[] = [];

  /** Eventos hacia el padre */
  @Output() close = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();

  // Métodos para el menú
  toggleMenu() { this.isOpen = !this.isOpen; }
  openMenu()   { this.isOpen = true; }
  closeMenu()  { this.isOpen = false; this.onClose(); }

  onClose() { this.close.emit(); }
  onEditProfile() { this.editProfile.emit(); this.closeMenu(); }

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

  onLogout() { this.logoutEvent.emit(); }
}
