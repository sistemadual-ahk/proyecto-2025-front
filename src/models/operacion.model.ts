export interface Operacion {
  _id?: string;
  tipo: 'Ingreso' | 'Egreso';
  monto: number;
  billeteraId: string;
  categoriaId: string;
  descripcion?: string;
  fecha: string;
}
