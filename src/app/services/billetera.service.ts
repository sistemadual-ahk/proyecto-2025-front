import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

// Interfaz básica asumida para la billetera
export interface Billetera {
  id?: number;
  balance: number;
  nombre: string;
  proveedor: string;
  type: 'bank' | 'digital' | 'cash';
  isDefault?: boolean;
  color?: string;
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
