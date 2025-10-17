import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiService {
  private userDataSubject = new BehaviorSubject<any>(null);
  public userData$ = this.userDataSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
    this.loadUserFromStorage();
  }

  createUser(payload: any): Observable<any> {
    return super.create<any>('/usuarios', payload).pipe(
      tap((response) => {
        this.setUserData(response);
      })
    );
  }
  private setUserData(userData: any): void {
    localStorage.setItem('user_data', JSON.stringify(userData));
    this.userDataSubject.next(userData);
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        this.userDataSubject.next(userData);
      } catch (error) {
        console.error('Error al parsear datos de usuario desde localStorage:', error);
        localStorage.removeItem('user_data');
      }
    }
  }

  getUserData(): any {
    return this.userDataSubject.value;
  }

  clearUserData(): void {
    localStorage.removeItem('user_data');
    this.userDataSubject.next(null);
  }
}
