import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BilleteraService, Billetera } from '../../services/billetera.service';
import { MatSelectModule } from '@angular/material/select';

type WalletType = 'bank' | 'digital' | 'cash';

@Component({
  selector: 'app-add-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule],
  templateUrl: './add-account-modal.component.html',
  styleUrl: './add-account-modal.component.scss',
})
export class AddAccountModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveAccount = new EventEmitter<{
    name: string;
    type: WalletType;
    provider?: string;
    initialBalance: number;
    currency: string;
  }>();

  private billeteraService: BilleteraService = inject(BilleteraService);

  ngOnInit() {
    // Inicializar cualquier dato necesario
    this.loadData();
  }

  loadData() {
  
  }

  // Estado del formulario
  name = '';
  type: WalletType = 'bank';
  provider = '';
  initialBalance: number | null = null;
  currency = 'ARS';

  // Opciones (pueden mapearse a íconos/colores luego)
  providersByType: Record<WalletType, string[]> = {
    bank: ['Santander', 'BBVA', 'Galicia', 'Macro', 'Provincia'],
    digital: ['Mercado Pago', 'Ualá', 'Naranja X'],
    cash: ['Efectivo'],
  };

  get currentProviders(): string[] {
    return this.providersByType[this.type] || [];
  }

  setType(next: WalletType) {
    this.type = next;
    // Resetear provider si ya no existe en el nuevo tipo
    if (!this.currentProviders.includes(this.provider)) {
      this.provider = '';
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onSave() {
    if (!this.name.trim()) {
      return;
    }
    this.saveAccount.emit({
      name: this.name.trim(),
      type: this.type,
      provider: this.provider || undefined,
      initialBalance: Math.max(0, Math.floor(this.initialBalance ?? 0)),
      currency: this.currency,
    });
    const billeteraData: Billetera = {
      nombre: this.name.trim(),
      type: this.type,
      proveedor: this.provider || 'N/A',
      balance: Math.max(0, Math.floor(this.initialBalance ?? 0)),
      isDefault: false,
      moneda: this.currency,
      ingresoHistorico: 0,
      gastoHistorico: 0
    };

    this.billeteraService.createBilletera(billeteraData).subscribe({
      next: (bill) => {
        console.log('Billetera creada:', bill);
      },
      error: (error) => {
        console.error('Error al crear la billetera:', error);
      },
    });

    this.resetForm();
  }

  private resetForm() {
    this.name = '';
    this.type = 'bank';
    this.provider = '';
    this.initialBalance = null;
    this.currency = 'ARS';
  }
}
