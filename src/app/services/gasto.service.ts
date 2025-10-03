import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Gasto } from '../../models/gasto.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GastoService extends ApiService {

  /**
   * Obtiene todos los gastos de la API.
   * @returns Un Observable que emite un array de gastos.
   */
  getAllGastos(): Observable<Gasto[]> {
    return super.getAll<Gasto>('/gastos');
  }

  /**
   * Obtiene un gasto por su ID.
   * @param id El ID del gasto.
   * @returns Un Observable que emite el gasto encontrado.
   */
  getGastoById(id: string | number): Observable<Gasto> {
    return super.getById<Gasto>('/gastos', id);
  }

  /**
   * Crea un nuevo gasto.
   * @param gastoData Los datos del nuevo gasto, incluyendo las referencias.
   * @returns Un Observable que emite el gasto creado.
   */
  createGasto(gastoData: Partial<Gasto>): Observable<Gasto> {
    return super.create<Gasto>('/gastos', gastoData);
  }

  /**
   * Actualiza un gasto existente.
   * @param id El ID del gasto a actualizar.
   * @param gastoData Los nuevos datos del gasto.
   * @returns Un Observable que emite el gasto actualizado.
   */
  updateGasto(id: string | number, gastoData: Partial<Gasto>): Observable<Gasto> {
    return super.update<Gasto>('/gastos', id, gastoData);
  }

  /**
   * Elimina un gasto.
   * @param id El ID del gasto a eliminar.
   * @returns Un Observable que confirma la eliminación.
   */
  deleteGasto(id: string | number): Observable<any> {
    return super.delete('/gastos', id);
  }
}
