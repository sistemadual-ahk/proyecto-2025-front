// src/app/categoria.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // 👈 ¡Importar map es crucial!

// 1. Interfaz para el objeto Categoría (ajustada a tu respuesta real)
export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  isDefault: boolean;
  user: any | null; // Puedes definir una interfaz más estricta para 'user'
}

// 2. Interfaz para la RESPUESTA COMPLETA del API
interface ApiResponse {
  success: boolean;
  data: Categoria[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:3000/api/categorias';

  constructor(private http: HttpClient) { }

  // 3. Modifica el método para usar el operador map
  getCategorias(): Observable<Categoria[]> {
    // 3a. Especifica que esperas recibir el objeto 'ApiResponse'
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      // 3b. Usas el 'map' para transformar la respuesta (response)
      // y devolver SOLAMENTE la propiedad 'data', que es el arreglo de categorías.
      map(response => response.data) 
    );
  }
}