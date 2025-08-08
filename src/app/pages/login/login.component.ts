import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(private router: Router) {}

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
