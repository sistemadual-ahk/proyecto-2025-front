import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Operacion } from '../../models/operacion.model';

@Injectable({
  providedIn: 'root'
})
export class OperacionService extends ApiService {

  /**
   * Obtiene todas las operaciones del usuario actual.
   * @returns Un Observable que emite un array de todas las operaciones.
   */
  getAllOperaciones(): Observable<Operacion[]> {
    return super.getAll<Operacion>('/operaciones');
  }

  /**
   * Obtiene solo los ingresos del usuario actual.
   * @returns Un Observable que emite un array de operaciones de tipo Ingreso.
   */
  getIngresos(): Observable<Operacion[]> {
    return super.getAll<Operacion>('/operaciones/ingresos');
  }

  /**
   * Obtiene solo los egresos (gastos) del usuario actual.
   * @returns Un Observable que emite un array de operaciones de tipo Egreso.
   */
  getEgresos(): Observable<Operacion[]> {
    return super.getAll<Operacion>('/operaciones/egresos');
  }

  /**
   * Obtiene una operación por su ID.
   * @param id El ID de la operación.
   * @returns Un Observable que emite la operación encontrada.
   */
  getOperacionById(id: string | number): Observable<Operacion> {
    return super.getById<Operacion>('/operaciones', id);
  }

  /**
   * Crea una nueva operación.
   * @param operacionData Los datos de la nueva operación.
   * @returns Un Observable que emite la operación creada.
   */
  createOperacion(operacionData: Partial<Operacion>): Observable<Operacion> {
    return super.create<Operacion>('/operaciones', operacionData);
  }

  /**
   * Actualiza una operación existente.
   * @param id El ID de la operación a actualizar.
   * @param operacionData Los nuevos datos de la operación.
   * @returns Un Observable que emite la operación actualizada.
   */
  updateOperacion(id: string | number, operacionData: Partial<Operacion>): Observable<Operacion> {
    return super.update<Operacion>('/operaciones', id, operacionData);
  }

  /**
   * Elimina una operación.
   * @param id El ID de la operación a eliminar.
   * @returns Un Observable que confirma la eliminación.
   */
  deleteOperacion(id: string | number): Observable<any> {
    return super.delete('/operaciones', id);
  }
}
