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
  cardColor = 'linear-gradient(135deg, #667EEA, #764BA2)';

  colorOptions = [
    { gradient: 'linear-gradient(135deg, #667EEA, #764BA2)' },
    { gradient: 'linear-gradient(135deg, #009EE3, #0078BE)' },
    { gradient: 'linear-gradient(135deg, #EC0000, #CC0000)' },
    { gradient: 'linear-gradient(135deg, #51CF66, #40C057)' },
    { gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
    { gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
    { gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' },
    { gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)' },
  ];

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
    
    const billeteraData: Billetera = {
      nombre: this.name.trim(),
      type: this.type,
      proveedor: this.provider || 'N/A',
      balance: Math.max(0, Math.floor(this.initialBalance ?? 0)),
      isDefault: false,
      moneda: this.currency,
      color: this.cardColor,
      ingresoHistorico: 0,
      gastoHistorico: 0
    };

    this.billeteraService.createBilletera(billeteraData).subscribe({
      next: (bill) => {
        console.log('Billetera creada:', bill);
        this.saveAccount.emit({
          name: this.name.trim(),
          type: this.type,
          provider: this.provider || undefined,
          initialBalance: Math.max(0, Math.floor(this.initialBalance ?? 0)),
          currency: this.currency,
        });
        this.resetForm();
        this.onClose();
      },
      error: (error) => {
        console.error('Error al crear la billetera:', error);
      },
    });
  }

  private resetForm() {
    this.name = '';
    this.type = 'bank';
    this.provider = '';
    this.initialBalance = null;
    this.currency = 'ARS';
    this.cardColor = 'linear-gradient(135deg, #667EEA, #764BA2)';
  }
}
