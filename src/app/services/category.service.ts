import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Categoria } from '../../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiService {

  getAllCategories(): Observable<Categoria[]> {
    return super.getAll<Categoria>('/categorias');
  }

  getAllCategoriesAdmin(): Observable<Categoria[]> {
    return super.getAll<Categoria>('/categorias/all');
  }

  getCategoryById(id: string | number): Observable<Categoria> {
    return super.getById<Categoria>('/categorias', id);
  }

  getCategoriesByUser(userId: string | number): Observable<Categoria[]> {
    return super.getAll<Categoria>(`/categorias/user/${userId}`);
  }

  createCategory(categoryData: Partial<Categoria>): Observable<Categoria> {
    return super.create<Categoria>('/categorias', categoryData);
  }

  updateCategory(id: string | number, categoryData: Partial<Categoria>): Observable<Categoria> {
    return super.update<Categoria>('/categorias', id, categoryData);
  }

  deleteCategory(id: string | number): Observable<any> {
    return super.delete('/categorias', id);
  }
}
