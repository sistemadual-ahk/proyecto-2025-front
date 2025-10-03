import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected readonly API_BASE_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Métodos genéricos para operaciones CRUD
  getAll<T>(route: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.API_BASE_URL}${route}`);
  }

  getById<T>(route: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${this.API_BASE_URL}${route}/${id}`);
  }

  create<T>(route: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.API_BASE_URL}${route}`, data);
  }

  update<T>(route: string, id: string | number, data: any): Observable<T> {
    return this.http.put<T>(`${this.API_BASE_URL}${route}/${id}`, data);
  }

  delete(route: string, id: string | number): Observable<any> {
    return this.http.delete(`${this.API_BASE_URL}${route}/${id}`);
  }

  // Métodos específicos existentes
  login(credenciales: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL.replace('/api', '')}/login`, credenciales);
  }

  register(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL.replace('/api', '')}/register`, datosUsuario);
  }

  getProfile(userId: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL.replace('/api', '')}/profile/${userId}`);
  }
}