// 1. Interfaz para el objeto Categoría (ajustada a tu respuesta real)
export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  isDefault: boolean;
  iconColor?: string;
  user: any | null; // Puedes definir una interfaz más estricta para 'user'
  type: 'income'|  'expense';
}
