// src/app/services/gasto/gasto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gasto } from '../../models/gasto.model';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private apiBaseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los gastos de la API.
   * @returns Un Observable que emite un array de gastos.
   */
  getAllGastos(): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${this.apiBaseUrl}/gastos`);
  }

  /**
   * Crea un nuevo gasto.
   * @param gastoData Los datos del nuevo gasto, incluyendo las referencias.
   * @returns Un Observable que emite el gasto creado.
   */
  createGasto(gastoData: Partial<Gasto>): Observable<Gasto> {
    return this.http.post<Gasto>(`${this.apiBaseUrl}/gastos`, gastoData);
  }
}
