
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserDTO } from '../../models/user.model'

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiService {
  // ✅ Tipado fuerte
  private userDataSubject = new BehaviorSubject<UserDTO | null>(null);
  public userData$: Observable<UserDTO | null> = this.userDataSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
    this.loadUserFromStorage();
  }

  // ✅ Crear usuario (tipado)
  createUser(payload: Partial<UserDTO>): Observable<UserDTO> {
    return super.create<UserDTO>('/usuarios', payload).pipe(
      tap((response) => {
        this.setUserData(response);
      })
    );
  }

  // ✅ Actualizar usuario (tipado)
  updateUser(id: string | number, payload: Partial<UserDTO>): Observable<UserDTO> {
    return super.update<UserDTO>('/usuarios', id, payload).pipe(
      tap((response) => {
        // Merge defensivo con lo que ya tenías
        const currentUserData = this.getUserData();
        const updatedData = currentUserData ? { ...currentUserData, ...response } : response;
        this.setUserData(updatedData);
      })
    );
  }

  // ✅ Traer por ID desde backend
  getUserById(id: string): Observable<UserDTO> {
    return super.get<UserDTO>(`/usuarios/${id}`).pipe(
      tap((response) => {
        this.setUserData(response);
      })
    );
  }

  // ✅ Opcional: traer usuario actual (si tu backend lo soporta)
  getCurrentUser(): Observable<UserDTO> {
    return super.get<UserDTO>('/usuarios/me').pipe(
      tap((response) => {
        this.setUserData(response);
      })
    );
  }

  // ========= Persistencia / Estado =========

  private setUserData(userData: UserDTO): void {
    // 🔧 si necesitás normalizar snake_case → camelCase, hacelo aquí
    // const normalized: UserDTO = { ...userData, situacion_laboral: userData.situacion_laboral ?? null };

    localStorage.setItem('user_data', JSON.stringify(userData));
    this.userDataSubject.next(userData);
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('user_data');
    if (!storedUser) return;
    try {
      const parsed: UserDTO = JSON.parse(storedUser);
      this.userDataSubject.next(parsed);
    } catch (error) {
      console.error('Error al parsear datos de usuario desde localStorage:', error);
      localStorage.removeItem('user_data');
    }
  }

 
  getUserData(): Observable<UserDTO> {
    return super.get<UserDTO>('/usuarios/me').pipe(
      tap((response) => this.setUserData(response))
    );
  }

  clearUserData(): void {
    localStorage.removeItem('user_data');
    this.userDataSubject.next(null);
  }
}
