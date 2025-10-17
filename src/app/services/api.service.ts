import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly API_BASE_URL = environment.API_BACK_URL;

  constructor(private http: HttpClient) {}

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
}
