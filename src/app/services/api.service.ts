import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_BASE_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/login`, credenciales);
  }

  register(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/register`, datosUsuario);
  }

  getProfile(userId: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/profile/${userId}`);
  }
}