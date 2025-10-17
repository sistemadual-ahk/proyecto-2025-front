import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title = 'Gastify';
  @Input() currentMonth = '';
  @Output() previousMonth = new EventEmitter<void>();
  @Output() nextMonth = new EventEmitter<void>();
  @Output() notificationsClick = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();

  constructor(
    private router: Router,
    private auth: AuthService,
    private userService: UserService
  ) {}

  onPreviousMonthClick() {
    this.previousMonth.emit();
  }
  onNextMonthClick() {
    this.nextMonth.emit();
  }
  onNotificationsClick() {
    this.notificationsClick.emit();
  }
  onProfileClick() {
    this.profileClick.emit();
  }

  openNotifications() {
    this.notificationsClick.emit();
  }

  openProfile() {
    this.profileClick.emit();
  }

  logout() {
    this.userService.clearUserData();

    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

    this.router.navigate(['/login']);
  }
}
