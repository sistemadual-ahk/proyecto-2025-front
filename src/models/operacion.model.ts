export interface Operacion {
  _id?: string;
  id?: string; // por compatibilidad si llega del back con "id"

  tipo: 'Ingreso' | 'Egreso' | 'income' | 'expense';
  monto: number;

  billetera?: string | { id?: string; _id?: string; nombre?: string }; // Puede ser ID o objeto completo
  billeteraId?: string; // Alias para compatibilidad

  categoria?:
    | string
    | {
        id?: string;
        _id?: string;
        nombre?: string;
        icono?: string;
        color?: string;
      }; // Puede ser ID o objeto completo con icono y color
  categoriaId?: string; // Alias para compatibilidad

  descripcion?: string;
  fecha: string;

  // 👇 Para asociarla a un objetivo
  objetivo?: string;
}
