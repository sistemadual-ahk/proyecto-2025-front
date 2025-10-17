import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  dateOfBirth: string = '';
  acceptTerms: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    // Aquí iría la lógica de validación y registro
    console.log('Register:', {
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      dateOfBirth: this.dateOfBirth,
      acceptTerms: this.acceptTerms,
    });

    // Por ahora, redirigir a home
    this.router.navigate(['/home']);
  }

  navegarAWelcome(): void {
    this.router.navigate(['/']);
  }

  navegarALogin(): void {
    this.router.navigate(['/login']);
  }

  navegarAInicio(): void {
    this.router.navigate(['/']);
  }
}
