import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule],
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.scss',
  animations: [
    trigger('modalOverlay', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalContent', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('220ms 40ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TransactionModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveTransaction = new EventEmitter<any>();
  selectedValue = null;

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

  // Estado para gesto de arrastre hacia abajo
  private startY: number | null = null;
  private currentY: number | null = null;
  isDragging: boolean = false;
  dragTranslateY: number = 0;
  private readonly closeThreshold: number = 120; // px

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

  // Gesto táctil
  onTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    this.isDragging = true;
    this.startY = event.touches[0].clientY;
    this.currentY = this.startY;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || this.startY === null) return;
    this.currentY = event.touches[0].clientY;
    const delta = this.currentY - this.startY;
    this.dragTranslateY = Math.max(0, delta);
  }

  onTouchEnd() {
    if (!this.isDragging) return;
    const dragged = (this.currentY ?? 0) - (this.startY ?? 0);
    if (dragged > this.closeThreshold) {
      this.onClose();
    }
    this.isDragging = false;
    this.startY = null;
    this.currentY = null;
    this.dragTranslateY = 0;
  }

  // Gesto con mouse (desktop)
  onMouseDown(event: MouseEvent) {
    // Solo botón izquierdo
    if (event.button !== 0) return;
    this.isDragging = true;
    this.startY = event.clientY;
    this.currentY = this.startY;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || this.startY === null) return;
    this.currentY = event.clientY;
    const delta = this.currentY - this.startY;
    this.dragTranslateY = Math.max(0, delta);
  }

  onMouseUp() {
    if (!this.isDragging) return;
    const dragged = (this.currentY ?? 0) - (this.startY ?? 0);
    if (dragged > this.closeThreshold) {
      this.onClose();
    }
    this.isDragging = false;
    this.startY = null;
    this.currentY = null;
    this.dragTranslateY = 0;
  }
} 