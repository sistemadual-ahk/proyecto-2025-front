// src/app/categoria.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  iconColor: string;
  isDefault: boolean;
  type?: 'income' | 'expense';
  user: any | null;
}

interface ApiResponse {
  success: boolean;
  data: Categoria[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriaService extends ApiService {
  getCategorias(): Observable<Categoria[]> {
    return super.getAll<Categoria>('/categorias');
  }
}
