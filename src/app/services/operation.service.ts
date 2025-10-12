import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define una interfaz para la Operacion si no la tienes
interface Operacion {
  _id: string;
  tipo: 'ingreso' | 'egreso'; // O 'egreso' si lo usas
  monto: number;
  // ... otros campos
}

@Injectable({ providedIn: 'root' })
export class OperacionService {
  // Asegúrate de que esta URL base coincida con tus rutas de Express (ej: /api/operaciones)
  private readonly apiUrl = 'http://localhost:3000/api/operaciones'; 

  constructor(private http: HttpClient) {}

  /**
   * Llama al backend para obtener TODAS las operaciones (ingresos y egresos)
   * del usuario autenticado. El backend usa el token JWT para filtrar por ID.
   */
  getOperacionesDelUsuario(): Observable<Operacion[]> {
    // Llama al endpoint base. En el backend, esta ruta está mapeada a getAllOperacionesForUser.
    return this.http.get<Operacion[]>(`${this.apiUrl}/`); 
  }
  
  /**
   * Opcional: Si quieres endpoints separados para ingresos o egresos (filtrado por backend)
   */
  getIngresosDelUsuario(): Observable<Operacion[]> {
    return this.http.get<Operacion[]>(`${this.apiUrl}/ingresos`);
  }
  
  getEgresosDelUsuario(): Observable<Operacion[]> {
    return this.http.get<Operacion[]>(`${this.apiUrl}/egresos`);
  }
  
  /**
   * Crea una nueva operación (el backend adjuntará el userID automáticamente).
   */
  createOperacion(operacionData: Omit<Operacion, '_id'>): Observable<Operacion> {
      // El endpoint createOperacion del controller está esperando los datos del body,
      // y adjunta el user: userID antes de llamar al service de Mongoose.
      return this.http.post<Operacion>(`${this.apiUrl}/`, operacionData);
  }
  
  // ... (otros métodos CRUD como update y delete si son necesarios)
}
