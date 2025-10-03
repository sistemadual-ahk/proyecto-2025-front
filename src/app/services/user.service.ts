// src/app/services/user/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Ya no necesitamos importar ni usar el AuthService de Auth0

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // URL base de tu API, asegúrate de que coincida con la configuración de tu backend
  private apiBaseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Este método hace la llamada al back-end para sincronizar el usuario.
   * El AuthInterceptor añadirá el token de seguridad automáticamente.
   *    * @param payload Datos opcionales del usuario a enviar (aunque el back-end
   * usará principalmente la información del token).
   * @returns Un Observable con la respuesta del servidor (el usuario sincronizado).
   */
  createUser(payload: any): Observable<any> {
    
    // La URL debe coincidir con la ruta protegida de tu back-end.
    // Por ejemplo, usamos la ruta que inicia el proceso de sincronización.
    return this.http.post(`${this.apiBaseUrl}/usuarios`, payload);
  }
}