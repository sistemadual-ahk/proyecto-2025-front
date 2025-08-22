import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,  NzButtonModule, NzSliderModule, NzSwitchModule, NzSelectModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  disabled = false;
  value1 = 30;
  switchValue = false;
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  selectedValue = null;


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
