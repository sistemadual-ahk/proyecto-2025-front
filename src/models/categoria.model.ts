export interface Categoria {
  id?: string;
  _id?: string;

  userId?: string;  
  nombre: string;
  descripcion?: string;
  color?: string;
  iconColor?: string;
  icono?: string;
  isDefault?: boolean;
  type?: 'income' | 'expense';

 user?: any | null;
}
