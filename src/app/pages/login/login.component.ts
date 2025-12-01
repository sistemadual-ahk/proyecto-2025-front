import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginInternoHabilitado = false;
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.auth.user$.subscribe((user) => {
          const name = user?.name;
          const mail = user?.email;
          const sub = user?.sub;
          console.log('Usuario autenticado:', user);

          this.userService.createUser({ name: name, mail: mail, authId: sub }).subscribe({
            next: (response) => {
              this.router.navigate(['/home']);
            },
            error: (err) => {
              //409 indica que el usuario ya existe y está ok.
              if (err.status !== 409) {
                console.error('Error al sincronizar usuario con el backend:', err);
              }
            },
          });
        });
      }
    });
  }

  loginWithGoogle() {
    this.auth.loginWithRedirect({
      appState: {
        target: '/home',
      },
      authorizationParams: {
        connection: 'google-oauth2',
      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login:', { username: this.username, password: this.password });
    this.router.navigate(['/home']);
  }

  onGoogleLogin() {
    console.log('Google login');
    this.router.navigate(['/home']);
  }

  navegarARegister(): void {
    this.router.navigate(['/register']);
  }
}
