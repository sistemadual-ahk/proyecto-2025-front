import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Objetivo } from '../../models/objetivo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ObjetivoService extends ApiService {
  getObjetivos(): Observable<Objetivo[]> {
    // Devuelve los objetivos del usuario autenticado
    return super.getAll<Objetivo>('/objetivos');
  }

  getObjetivoById(id: string): Observable<Objetivo> {
    return super.getById<Objetivo>('/objetivos', id);
  }

  createObjetivo(payload: Partial<Objetivo>): Observable<Objetivo> {
    return super.create<Objetivo>('/objetivos', payload);
  }

  updateObjetivo(id: string, payload: Partial<Objetivo>): Observable<Objetivo> {
    return super.update<Objetivo>('/objetivos', id, payload);
  }

  deleteObjetivo(id: string): Observable<void> {
    return super.delete('/objetivos', id);
  }
}
