import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Wallet {
  id?: number;
  name: string;
  description?: string;
  balance: number;
  currency: string;
  type: 'bank' | 'cash' | 'digital' | 'credit';
  userId?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService extends ApiService {

  /**
   * Obtiene todas las billeteras del usuario actual.
   * @returns Un Observable que emite un array de billeteras.
   */
  getBilleteras(): Observable<Wallet[]> {
    return super.getAll<Wallet>('/billeteras');
  }

  /**
   * Obtiene todas las billeteras (admin).
   * @returns Un Observable que emite un array de todas las billeteras.
   */
  getAllBilleterasAdmin(): Observable<Wallet[]> {
    return super.getAll<Wallet>('/billeteras/all');
  }

  /**
   * Obtiene una billetera por su ID.
   * @param id El ID de la billetera.
   * @returns Un Observable que emite la billetera encontrada.
   */
  getBilleteraById(id: string | number): Observable<Wallet> {
    return super.getById<Wallet>('/billeteras', id);
  }

  /**
   * Crea una nueva billetera.
   * @param walletData Los datos de la nueva billetera.
   * @returns Un Observable que emite la billetera creada.
   */
  createBilletera(walletData: Partial<Wallet>): Observable<Wallet> {
    return super.create<Wallet>('/billeteras', walletData);
  }

  /**
   * Actualiza una billetera existente.
   * @param id El ID de la billetera a actualizar.
   * @param walletData Los nuevos datos de la billetera.
   * @returns Un Observable que emite la billetera actualizada.
   */
  updateBilletera(id: string | number, walletData: Partial<Wallet>): Observable<Wallet> {
    return super.update<Wallet>('/billeteras', id, walletData);
  }

  /**
   * Elimina una billetera.
   * @param id El ID de la billetera a eliminar.
   * @returns Un Observable que confirma la eliminación.
   */
  deleteBilletera(id: string | number): Observable<any> {
    return super.delete('/billeteras', id);
  }
}
