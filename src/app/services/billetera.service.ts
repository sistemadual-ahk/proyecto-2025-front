import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

// Interfaz basada en el modelo del backend
export interface Billetera {
  id?: string; // Backend usa string
  balance: number;
  nombre: string;
  balanceHistorico?: number; // Campo del backend
  isDefault: boolean;
  color?: string;
  user?: any;
  // Campos adicionales del frontend (no están en backend)
  proveedor?: string; // Solo frontend
  type?: 'bank' | 'digital' | 'cash'; // Solo frontend
  icon?: string; // Solo frontend
  moneda?: string; // Solo frontend
  ingresoHistorico?: number; // Solo frontend
  gastoHistorico?: number; // Solo frontend
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

  deleteBilletera(billeteraId: string){
    return super.delete('/billeteras', billeteraId);
  }

  updateBilletera(billeteraId: string, billetera: Partial<Billetera>): Observable<Billetera> {
    return super.update<Billetera>('/billeteras', billeteraId, billetera);
  }

  patchBilletera(billeteraId: string, billetera: Partial<Billetera>): Observable<Billetera> {
    return super.patch<Billetera>('/billeteras', billeteraId, billetera);
  }
}
