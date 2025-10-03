// src/app/services/Operation/Operation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Operation } from '../../models/operation.model';

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
  getAllGastos(): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.apiBaseUrl}/gastos`);
  }

  /**
   * Crea un nuevo Operation.
   * @param gastoData Los datos del nuevo Operation, incluyendo las referencias.
   * @returns Un Observable que emite el Operation creado.
   */
  createGasto(gastoData: Partial<Operation>): Observable<Operation> {
    return this.http.post<Operation>(`${this.apiBaseUrl}/gastos`, gastoData);
  }
}
