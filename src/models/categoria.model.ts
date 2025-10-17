export interface Categoria {
  _id?: string;
  userId: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  isDefault?: boolean;
}
