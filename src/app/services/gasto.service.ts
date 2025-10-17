import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperacionService } from './operacion.service';
import { Gasto } from '../../models/gasto.model';
import { Operacion } from '../../models/operacion.model';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  
  constructor(private operacionService: OperacionService) {}

  /**
   * Obtiene todos los gastos del usuario actual.
   * @returns Un Observable que emite un array de gastos.
   */
  getAllGastos(): Observable<Gasto[]> {
    return new Observable(observer => {
      this.operacionService.getEgresos().subscribe({
        next: (operaciones) => {
          // Convertir Operacion[] a Gasto[]
          const gastos = operaciones.map(this.operacionToGasto);
          observer.next(gastos);
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Obtiene un gasto por su ID.
   * @param id El ID del gasto.
   * @returns Un Observable que emite el gasto encontrado.
   */
  getGastoById(id: string | number): Observable<Gasto> {
    return new Observable(observer => {
      this.operacionService.getOperacionById(id).subscribe({
        next: (operacion) => {
          if (operacion.tipo === 'Egreso') {
            observer.next(this.operacionToGasto(operacion));
          } else {
            observer.error(new Error('La operación no es un egreso'));
          }
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Crea un nuevo gasto.
   * @param gastoData Los datos del nuevo gasto.
   * @returns Un Observable que emite el gasto creado.
   */
  createGasto(gastoData: Partial<Gasto>): Observable<Gasto> {
    const operacionData = this.gastoToOperacion(gastoData);
    return new Observable(observer => {
      this.operacionService.createOperacion(operacionData).subscribe({
        next: (operacion) => {
          observer.next(this.operacionToGasto(operacion));
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Actualiza un gasto existente.
   * @param id El ID del gasto a actualizar.
   * @param gastoData Los nuevos datos del gasto.
   * @returns Un Observable que emite el gasto actualizado.
   */
  updateGasto(id: string | number, gastoData: Partial<Gasto>): Observable<Gasto> {
    const operacionData = this.gastoToOperacion(gastoData);
    return new Observable(observer => {
      this.operacionService.updateOperacion(id, operacionData).subscribe({
        next: (operacion) => {
          observer.next(this.operacionToGasto(operacion));
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Elimina un gasto.
   * @param id El ID del gasto a eliminar.
   * @returns Un Observable que confirma la eliminación.
   */
  deleteGasto(id: string | number): Observable<any> {
    return this.operacionService.deleteOperacion(id);
  }

  /**
   * Convierte una Operacion a Gasto.
   * @param operacion La operación a convertir.
   * @returns El gasto convertido.
   */
  private operacionToGasto(operacion: Operacion): Gasto {
    return {
      _id: operacion._id,
      monto: operacion.monto,
      descripcion: operacion.descripcion,
      tipo: operacion.tipo === 'Egreso' ? 'expense' : 'income',
      datetime: this.fechaToDate(operacion.fecha),
      userId: operacion.userId || '',
      billetera: operacion.billeteraId,
      categoria: {
        _id: operacion.categoriaId,
        userId: operacion.userId || '',
        nombre: '', // Se llenaría con datos adicionales si es necesario
        descripcion: ''
      }
    };
  }

  /**
   * Convierte un Gasto a Operacion.
   * @param gasto El gasto a convertir.
   * @returns La operación convertida.
   */
  private gastoToOperacion(gasto: Partial<Gasto>): Partial<Operacion> {
    return {
      monto: gasto.monto,
      descripcion: gasto.descripcion,
      tipo: 'Egreso',
      categoriaId: gasto.categoria?._id || '',
      billeteraId: gasto.billetera || '',
      fecha: this.dateToFecha(gasto.datetime || new Date()),
      userId: gasto.userId
    };
  }

  /**
   * Convierte fecha string (YYYYMMDD) a Date.
   * @param fecha Fecha en formato "YYYYMMDD".
   * @returns Objeto Date.
   */
  private fechaToDate(fecha: string): Date {
    const year = parseInt(fecha.substring(0, 4));
    const month = parseInt(fecha.substring(4, 6)) - 1; // Mes es 0-indexado
    const day = parseInt(fecha.substring(6, 8));
    return new Date(year, month, day);
  }

  /**
   * Convierte Date a fecha string (YYYYMMDD).
   * @param date Objeto Date.
   * @returns Fecha en formato "YYYYMMDD".
   */
  private dateToFecha(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
