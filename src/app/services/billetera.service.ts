import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 

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
  providedIn: 'root'
})
export class BilleteraService {
  private apiUrl = 'http://localhost:3000/api/billeteras'; 

  constructor(private http: HttpClient) { }
  getBilleteras(): Observable<Billetera[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map(response => response.data));
  }

  createBilletera(billetera: Partial<Billetera>): Observable<Billetera> {
    return this.http.post<Billetera>(this.apiUrl, billetera);
  }
}
