// src/models/categoria.model.ts

export interface Categoria {
  // Soportamos tanto el id del DTO como el _id de Mongo
  id?: string;
  _id?: string;

  userId?: string;        // lo dejo opcional: el backend te manda "user", no userId
  nombre: string;
  descripcion?: string;
  color?: string;
  iconColor?: string;
  icono?: string;
  isDefault?: boolean;
  type?: 'income' | 'expense';

  // si usás el objeto usuario que viene en el DTO
  user?: any | null;
}
