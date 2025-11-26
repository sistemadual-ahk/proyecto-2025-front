export interface Billetera {
  id?: string; // Backend usa string
  balance: number;
  nombre: string;
  balanceHistorico?: number; // Campo del backend
  isDefault: boolean;
  color?: string;
  user?: any;
  // Campos adicionales del frontend (no están en backend)
  proveedor?: string; // Solo frontend
  type?: 'bank' | 'digital' | 'cash'; // Solo frontend
  icon?: string; // Solo frontend
  moneda?: string; // Solo frontend
  ingresoHistorico?: number; // Solo frontend
  gastoHistorico?: number; // Solo frontend
}
