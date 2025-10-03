import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Billetera } from '../../models/billetera.model';

@Injectable({
  providedIn: 'root'
})
export class BilleteraService extends ApiService {

  getBilleteras(): Observable<Billetera[]> {
    return super.getAll<Billetera>('/billeteras');
  }

  getAllBilleterasAdmin(): Observable<Billetera[]> {
    return super.getAll<Billetera>('/billeteras/all');
  }

  getBilleteraById(id: string | number): Observable<Billetera> {
    return super.getById<Billetera>('/billeteras', id);
  }

  createBilletera(walletData: Partial<Billetera>): Observable<Billetera> {
    return super.create<Billetera>('/billeteras', walletData);
  }

  updateBilletera(id: string | number, walletData: Partial<Billetera>): Observable<Billetera> {
    return super.update<Billetera>('/billeteras', id, walletData);
  }

  deleteBilletera(id: string | number): Observable<any> {
    return super.delete('/billeteras', id);
  }
}
