import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly API_BASE_URL = environment.API_BACK_URL;

  constructor(private http: HttpClient) {}

  getAll<T>(route: string): Observable<T[]> {
    return this.http.get<ApiResponse<T[]>>(`${this.API_BASE_URL}${route}`).pipe(
      map(response => response.data)
    );
  }

  getById<T>(route: string, id: string | number): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.API_BASE_URL}${route}/${id}`).pipe(
      map(response => response.data)
    );
  }

  create<T>(route: string, data: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.API_BASE_URL}${route}`, data).pipe(
      map(response => response.data)
    );
  }

  update<T>(route: string, id: string | number, data: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.API_BASE_URL}${route}/${id}`, data).pipe(
      map(response => response.data)
    );
  }

  delete(route: string, id: string | number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.API_BASE_URL}${route}/${id}`).pipe(
      map(response => response.data)
    );
  }
}
