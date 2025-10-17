import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type WalletType = 'bank' | 'digital' | 'cash';

@Component({
  selector: 'app-add-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-account-modal.component.html',
  styleUrl: './add-account-modal.component.scss',
})
export class AddAccountModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveAccount = new EventEmitter<{
    name: string;
    type: WalletType;
    provider?: string;
    initialBalance: number;
  }>();

  // Estado del formulario
  name = '';
  type: WalletType = 'bank';
  provider = '';
  initialBalance = 0;

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
      initialBalance: Math.max(0, Math.floor(this.initialBalance)),
    });
    this.resetForm();
  }

  private resetForm() {
    this.name = '';
    this.type = 'bank';
    this.provider = '';
    this.initialBalance = 0;
  }
}
