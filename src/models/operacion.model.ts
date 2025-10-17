export interface Operacion {
  _id?: string;
  monto: number;
  descripcion: string;
  tipo: 'Ingreso' | 'Egreso';
  categoriaId: string;
  billeteraId: string;
  fecha: string; // Formato: "YYYYMMDD"
  userId?: string; // Opcional, puede venir del backend
}
