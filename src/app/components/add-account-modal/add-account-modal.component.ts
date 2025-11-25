import { Component, EventEmitter, OnInit, OnChanges, SimpleChanges, Output, Input, inject } from '@angular/core';
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
export class AddAccountModalComponent implements OnInit, OnChanges {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveAccount = new EventEmitter<{
    wallet: Billetera;
    type: WalletType;
    mode: 'create' | 'edit';
    payload: Partial<Billetera>;
  }>();
  @Input() walletToEdit: Billetera | null = null;
  @Input() mode: 'create' | 'edit' = 'create';

  private billeteraService: BilleteraService = inject(BilleteraService);

  ngOnInit() {
    // Inicializar cualquier dato necesario
    this.loadData();
    this.syncFormWithWallet();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['walletToEdit']) {
      this.syncFormWithWallet();
    }
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
  walletTypeIcons: Record<WalletType, string> = {
    bank: 'mdi-bank',
    digital: 'mdi-credit-card',
    cash: 'mdi-cash-multiple',
  };
  isSubmitting = false;

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
    const payload: Partial<Billetera> = {
      nombre: this.name.trim(),
      type: this.type,
      proveedor: this.provider || 'N/A',
      balance: Math.max(0, Math.floor(this.initialBalance ?? 0)),
      isDefault: false,
      moneda: this.currency,
      color: this.cardColor,
      ingresoHistorico: 0,
      gastoHistorico: 0,
      icon: this.getIconClass(this.type),
    };

    this.isSubmitting = true;

    if (this.mode === 'edit' && this.walletToEdit?.id) {
      this.isSubmitting = false;
      this.saveAccount.emit({
        wallet: this.walletToEdit,
        type: this.type,
        mode: 'edit',
        payload,
      });
      this.onClose();
    } else {
      this.billeteraService.createBilletera(payload).subscribe({
        next: (bill) => {
          this.isSubmitting = false;
          this.saveAccount.emit({
            wallet: bill,
            type: this.type,
            mode: 'create',
            payload,
          });
          this.resetForm();
          this.onClose();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error al crear la billetera:', error);
        },
      });
    }
  }

  private resetForm() {
    this.name = '';
    this.type = 'bank';
    this.provider = '';
    this.initialBalance = null;
    this.currency = 'ARS';
    this.cardColor = 'linear-gradient(135deg, #667EEA, #764BA2)';
  }

  private getIconClass(type: WalletType): string {
    const icon = this.walletTypeIcons[type];
    if (!icon) {
      return 'mdi mdi-wallet';
    }
    return icon.startsWith('mdi ') ? icon : `mdi ${icon}`;
  }

  private syncFormWithWallet() {
    if (this.mode === 'edit' && this.walletToEdit) {
      this.name = this.walletToEdit.nombre || '';
      this.type = (this.walletToEdit.type as WalletType) || 'bank';
      this.provider = this.walletToEdit.proveedor || '';
      this.initialBalance = this.walletToEdit.balance ?? 0;
      this.currency = this.walletToEdit.moneda || 'ARS';
      this.cardColor = this.walletToEdit.color || this.cardColor;
    }
  }
}
