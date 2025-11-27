export interface Billetera {
  id?: string;
  balance: number;
  nombre: string;
  proveedor: string;
  type: 'bank' | 'digital' | 'cash';
  icon?: string;
  isDefault: boolean;
  color?: string;
  moneda?: string;
  ingresoHistorico: number;
  gastoHistorico: number;
}
