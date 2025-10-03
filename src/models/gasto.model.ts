import { Categoria } from "./categoria.model";

export interface Gasto {
  _id?: string;
  monto: number;
  descripcion: string;
  tipo: string;
  datetime: Date;
  userId: string;
  billetera: string;
  categoria: Categoria;
}