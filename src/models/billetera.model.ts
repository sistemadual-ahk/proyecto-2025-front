export interface Billetera {
  _id: string;
  nombre: string;
  moneda: string;
  balance: number;
  gastoHistorico: number;
  ingresoHistorico: number;
  isDefault: boolean;
  color: string;
}
