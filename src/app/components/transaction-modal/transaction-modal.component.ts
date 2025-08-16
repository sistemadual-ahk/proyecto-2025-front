import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.scss'
})
export class TransactionModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveTransaction = new EventEmitter<any>();

  // Estado del formulario
  transactionType: 'income' | 'expense' = 'expense';
  amount: number = 0;
  description: string = '';
  date: string = new Date().toISOString().split('T')[0];
  wallet: string = '';
  category: string = '';
  subcategory: string = '';

  // Opciones para los dropdowns
  wallets = [
    'Mercado Pago',
    'Santander',
    'Efectivo'
  ];

  categories = [
    'Alimentación',
    'Transporte',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Vivienda',
    'Otros'
  ];

  subcategories = {
    'Alimentación': ['Supermercado', 'Restaurante', 'Delivery'],
    'Transporte': ['Combustible', 'Transporte público', 'Taxi'],
    'Entretenimiento': ['Cine', 'Conciertos', 'Deportes'],
    'Salud': ['Farmacia', 'Médico', 'Odontólogo'],
    'Educación': ['Libros', 'Cursos', 'Material escolar'],
    'Vivienda': ['Alquiler', 'Servicios', 'Mantenimiento'],
    'Otros': ['Regalos', 'Donaciones', 'Impuestos']
  };

  get currentSubcategories(): string[] {
    return this.subcategories[this.category as keyof typeof this.subcategories] || [];
  }

  // Métodos
  toggleTransactionType(type: 'income' | 'expense') {
    this.transactionType = type;
  }

  onClose() {
    this.closeModal.emit();
  }

  onSave() {
    const transaction = {
      type: this.transactionType,
      amount: this.transactionType === 'expense' ? -Math.abs(this.amount) : Math.abs(this.amount),
      description: this.description,
      date: this.date,
      wallet: this.wallet,
      category: this.category,
      subcategory: this.subcategory
    };
    
    this.saveTransaction.emit(transaction);
    this.resetForm();
  }

  private resetForm() {
    this.transactionType = 'expense';
    this.amount = 0;
    this.description = '';
    this.date = new Date().toISOString().split('T')[0];
    this.wallet = '';
    this.category = '';
    this.subcategory = '';
  }
} 