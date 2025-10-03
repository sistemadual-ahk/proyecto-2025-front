import { Component, EventEmitter, Output, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true
})
export class HeaderComponent {
  /** Cambiá el título por pantalla si querés */
  @Input() title = 'Ga<span class="dollar-sign">$</span>tify';

  /** Eventos hacia el Shell */
  @Output() menuClick = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [RouterModule]
})
export class SidebarComponent {
  @Input() open = false;

  @Output() close = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
