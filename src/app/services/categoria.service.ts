// src/app/categoria.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Categoria } from '../../models/categoria.model';

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
