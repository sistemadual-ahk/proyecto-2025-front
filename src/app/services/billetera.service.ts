import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz básica asumida para la billetera
interface Billetera {
  id: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class BilleteraService {
  private apiUrl = 'http://localhost:3000/api/billeteras'; 

  constructor(private http: HttpClient) { }
  getBilleteras(): Observable<Billetera[]> {
    return this.http.get<Billetera[]>(this.apiUrl);
  }
}
