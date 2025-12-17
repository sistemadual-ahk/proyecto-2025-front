import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { UserService } from '../../services/user.service';
import { UserDTO } from '../../../models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    PageTitleComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.components.scss',
})
export class SettingsComponent implements OnInit {
  user: UserDTO | null = null;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.userData$.subscribe(user => {
      this.user = user;
    });
  }

  goBack(): void {
    // Desde settings principal, volvemos al home
    this.router.navigate(['/home']).catch(() => {
      window.history.back();
    });
  }

  openProfile(): void {
    // Pasar estado para que el perfil sepa volver a Ajustes
    this.router.navigate(['/profile'], { state: { fromSettings: true } }).catch(() => {
      console.error('Error navigating to profile');
    });
  }

  openSecurity(): void {
    this.router.navigate(['/settings/security']).catch(() => {
      console.error('Error navigating to security');
    });
  }

  openNotifications(): void {
    this.router.navigate(['/settings/notifications']).catch(() => {
      console.error('Error navigating to notifications');
    });
  }

  openTelegramBot(): void {
    // TODO: Configurar el link del bot de Telegram
    const telegramBotUrl = 'https://web.telegram.org/a/#7579525505'; // Reemplazar con tu bot
    window.open(telegramBotUrl, '_blank');
  }

  logout(): void {
    // TODO: Hook into auth service when available
    this.router.navigate(['/login']).catch(() => {
      console.error('Error during logout');
    });
  }
  
}