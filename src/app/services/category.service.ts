import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Category {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiService {

  /**
   * Obtiene todas las categorías del usuario actual.
   * @returns Un Observable que emite un array de categorías.
   */
  getAllCategories(): Observable<Category[]> {
    return super.getAll<Category>('/categorias');
  }

  /**
   * Obtiene todas las categorías (admin).
   * @returns Un Observable que emite un array de todas las categorías.
   */
  getAllCategoriesAdmin(): Observable<Category[]> {
    return super.getAll<Category>('/categorias/all');
  }

  /**
   * Obtiene una categoría por su ID.
   * @param id El ID de la categoría.
   * @returns Un Observable que emite la categoría encontrada.
   */
  getCategoryById(id: string | number): Observable<Category> {
    return super.getById<Category>('/categorias', id);
  }

  /**
   * Obtiene las categorías de un usuario específico.
   * @param userId El ID del usuario.
   * @returns Un Observable que emite las categorías del usuario.
   */
  getCategoriesByUser(userId: string | number): Observable<Category[]> {
    return super.getAll<Category>(`/categorias/user/${userId}`);
  }

  /**
   * Crea una nueva categoría.
   * @param categoryData Los datos de la nueva categoría.
   * @returns Un Observable que emite la categoría creada.
   */
  createCategory(categoryData: Partial<Category>): Observable<Category> {
    return super.create<Category>('/categorias', categoryData);
  }

  /**
   * Actualiza una categoría existente.
   * @param id El ID de la categoría a actualizar.
   * @param categoryData Los nuevos datos de la categoría.
   * @returns Un Observable que emite la categoría actualizada.
   */
  updateCategory(id: string | number, categoryData: Partial<Category>): Observable<Category> {
    return super.update<Category>('/categorias', id, categoryData);
  }

  /**
   * Elimina una categoría.
   * @param id El ID de la categoría a eliminar.
   * @returns Un Observable que confirma la eliminación.
   */
  deleteCategory(id: string | number): Observable<any> {
    return super.delete('/categorias', id);
  }
}
