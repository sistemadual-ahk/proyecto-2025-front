import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Operacion } from '../../models/operacion.model';

@Injectable({
  providedIn: 'root',
})
export class IngresoService extends ApiService {
  /**
   * Obtiene todos los ingresos del usuario actual.
   * @returns Un Observable que emite un array de operaciones de tipo Ingreso.
   */
  getAllIngresos(): Observable<Operacion[]> {
    return super.getAll<Operacion>('/operaciones/ingresos');
  }

  /**
   * Obtiene un ingreso por su ID.
   * @param id El ID del ingreso.
   * @returns Un Observable que emite el ingreso encontrado.
   */
  getIngresoById(id: string | number): Observable<Operacion> {
    return super.getById<Operacion>('/operaciones', id);
  }

  /**
   * Crea un nuevo ingreso.
   * @param ingresoData Los datos del nuevo ingreso.
   * @returns Un Observable que emite el ingreso creado.
   */
  createIngreso(ingresoData: Partial<Operacion>): Observable<Operacion> {
    // Asegurar que el tipo sea 'Ingreso'
    const data = { ...ingresoData, tipo: 'Ingreso' as const };
    return super.create<Operacion>('/operaciones', data);
  }

  /**
   * Actualiza un ingreso existente.
   * @param id El ID del ingreso a actualizar.
   * @param ingresoData Los nuevos datos del ingreso.
   * @returns Un Observable que emite el ingreso actualizado.
   */
  updateIngreso(id: string | number, ingresoData: Partial<Operacion>): Observable<Operacion> {
    // Asegurar que el tipo sea 'Ingreso'
    const data = { ...ingresoData, tipo: 'Ingreso' as const };
    return super.update<Operacion>('/operaciones', id, data);
  }

  /**
   * Elimina un ingreso.
   * @param id El ID del ingreso a eliminar.
   * @returns Un Observable que confirma la eliminación.
   */
  deleteIngreso(id: string | number): Observable<any> {
    return super.delete('/operaciones', id);
  }
}
