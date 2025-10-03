import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Gasto } from '../../models/gasto.model';

@Injectable({
  providedIn: 'root'
})
export class GastoService extends ApiService {

  getAllGastos(): Observable<Gasto[]> {
    return super.getAll<Gasto>('/gastos');
  }

  getGastoById(id: string | number): Observable<Gasto> {
    return super.getById<Gasto>('/gastos', id);
  }

  createGasto(gastoData: Partial<Gasto>): Observable<Gasto> {
    return super.create<Gasto>('/gastos', gastoData);
  }

  updateGasto(id: string | number, gastoData: Partial<Gasto>): Observable<Gasto> {
    return super.update<Gasto>('/gastos', id, gastoData);
  }

  deleteGasto(id: string | number): Observable<any> {
    return super.delete('/gastos', id);
  }
}
