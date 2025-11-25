import { Operacion } from './operacion.model';

export enum EstadoObjetivo {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO'
}

export interface Objetivo {
  id?: string;
  titulo: string;
  montoObjetivo: number;
  montoActual: number;
  categoriaId?: string;
  billeteraId?: string;
  fechaInicio: string;
  fechaEsperadaFinalizacion: string;
  fechaFin?: string;
  estado: EstadoObjetivo;
  operaciones?: Operacion[];
  color?: string;
}
