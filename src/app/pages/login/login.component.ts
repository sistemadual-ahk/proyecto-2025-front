import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Añade RouterLink a los imports
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(public auth: AuthService, private router: Router) {}

  loginWithGoogle() {
    console.log(this.auth)
    
    this.auth.loginWithRedirect({
      appState: {
        target: '/home'
      },
      authorizationParams: {
        connection: 'google-oauth2'
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    // Aquí iría la lógica de autenticación
    console.log('Login:', { username: this.username, password: this.password });
    
    // Por ahora, redirigir a home
    this.router.navigate(['/home']);
  }

  onGoogleLogin() {
    // Aquí iría la lógica de login con Google
    console.log('Google login');
    
    // Por ahora, redirigir a home
    this.router.navigate(['/home']);
  }

  navegarARegister(): void {
    this.router.navigate(['/register']);
  }
}
