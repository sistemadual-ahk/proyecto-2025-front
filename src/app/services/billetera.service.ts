import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

// Interfaz básica asumida para la billetera
export interface Billetera {
  id: string;
  balance: number;
  nombre: string;
  color: string;
}

// Interfaz para la RESPUESTA COMPLETA del API
interface ApiResponse {
  success: boolean;
  data: Billetera[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class BilleteraService extends ApiService {
  getBilleteras(): Observable<Billetera[]> {
    return super.getAll<Billetera>('/billeteras');
  }

  createBilletera(billetera: Partial<Billetera>): Observable<Billetera> {
    return super.create<Billetera>('/billeteras', billetera);
  }
}
