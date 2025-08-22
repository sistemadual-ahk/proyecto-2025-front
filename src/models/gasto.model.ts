export interface Gasto {
  _id?: string;
  monto: number;
  descripcion: string;
  tipo: string; // "Gasto"
  datetime: Date;
  usuario: string; // ID del usuario
  billetera: string; // ID de la billetera
  categoria: string; // ID de la categoría
}