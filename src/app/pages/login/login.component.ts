import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit { // Implementa OnInit
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  // 1. INYECTA EL UserService
  constructor(
    public auth: AuthService,
    private router: Router,
    private userService: UserService // <-- Aquí se inyecta
  ) { }

  // 2. AÑADE LA LÓGICA DE SINCRONIZACIÓN EN ngOnInit
  ngOnInit() {
    // Nos suscribimos a isAuthenticated$ para saber cuándo el usuario vuelve de Auth0
    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        // Si está autenticado, llamamos al UserService para que dispare la
        // petición al backend. El AuthInterceptor se encargará del token.
        this.auth.user$.subscribe(user => {
          const name = user?.name
          const mail = user?.email;
          const sub = user?.sub;
          console.log("Usuario autenticado:", user);

          this.userService.createUser({ name: name, mail: mail, auth0Id: sub}).subscribe({
          next: (response) => {
            console.log('Sincronización de usuario exitosa:', response);
            // Redirigir a home solo DESPUÉS de la sincronización exitosa
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Error al sincronizar usuario con el backend:', err);
            // Manejar el error de sincronización
          }
        });
        })
        
      }
    });
  }

  // 3. ELIMINA EL console.log(this.auth) innecesario
  loginWithGoogle() {
    this.auth.loginWithRedirect({
      appState: {
        target: '/home'
      },
      authorizationParams: {
        connection: 'google-oauth2'
      }
    });
  }

  // ... (El resto de tus métodos se mantiene igual)
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