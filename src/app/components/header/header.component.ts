import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './header.component.html', // tu HTML va en header.component.html
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  /** Título centrado (ej. "Gastify") */
  @Input() title = 'Gastify';

  /** Mes actual mostrado en el header (ej. "Junio 2025") */
  @Input() currentMonth = '';

  /** Navegar a mes anterior/siguiente */
  @Output() previousMonth = new EventEmitter<void>();
  @Output() nextMonth = new EventEmitter<void>();

  /** Click en notificaciones y perfil */
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();

  // Sin estados duplicados: delegamos al Sidebar vía template ref


  
  // Métodos helpers para el template
  onPreviousMonthClick()   { this.previousMonth.emit(); }
  onNextMonthClick()       { this.nextMonth.emit(); }
  onNotificationsClick()   { this.notificationsClick.emit(); }
  onProfileClick()         { this.profileClick.emit(); }

  openNotifications() {
    this.notificationsClick.emit();
  }

  openProfile() {
    this.profileClick.emit();
  }
  // Los eventos de notificaciones/perfil quedan expuestos
}
