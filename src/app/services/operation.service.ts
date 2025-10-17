import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define una interfaz para la Operacion si no la tienes
export interface Operacion {
  _id?: string;
  // 🚨 CORRECCIÓN 1: Cambiamos a 'income' | 'expense' para coincidir con el frontend.
  tipo: 'Ingreso' | 'Egreso'; 
  monto: number;
  billetera?: string; // ID de la billetera (Cambio 'wallet' a 'billetera' por consistencia)
  categoria?: string; // ID de la categoría
billeteraId: string;
categoriaId: string;
  descripcion?: string; // Opcional
  // 🚨 CORRECCIÓN 2: Cambiamos a 'string' para aceptar el formato ISO 8601.
  fecha: string;
  user: string; // ID del usuario (Necesario en la interfaz, pero excluido al enviar)
}

@Injectable({ providedIn: 'root' })
export class OperacionService {
  // Asegúrate de que esta URL base coincida con tus rutas de Express (ej: /api/operaciones)
  private readonly apiUrl = 'http://localhost:3000/api/operaciones'; 

  constructor(private http: HttpClient) {}

  /**
   * Llama al backend para obtener TODAS las operaciones (ingresos y egresos)
   * del usuario autenticado.
   */
  getOperacionesDelUsuario(): Observable<Operacion[]> {
    return this.http.get<Operacion[]>(`${this.apiUrl}/`); 
  }
  
  /**
   * Crea una nueva operación (el backend adjuntará el userID automáticamente).
   */
  // 🚨 CORRECCIÓN 2: Excluimos '_id' Y 'user' para que coincida con lo que envía el componente.
  createOperacion(operacionData: Omit<Operacion, '_id' | 'user'>): Observable<Operacion> {
      return this.http.post<Operacion>(`${this.apiUrl}/`, operacionData);
  }
  
  getIngresosDelUsuario(): Observable<Operacion[]> {
    return this.http.get<Operacion[]>(`${this.apiUrl}/ingresos`);
  }
  
  getEgresosDelUsuario(): Observable<Operacion[]> {
    return this.http.get<Operacion[]>(`${this.apiUrl}/egresos`);
  }
}
