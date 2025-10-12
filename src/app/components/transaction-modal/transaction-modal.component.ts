import { OnInit, Component, EventEmitter, Injectable, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { privateDecrypt } from 'crypto';
import { HttpClient } from '@angular/common/http';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { BilleteraService } from '../../services/billetera.service';



@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.scss'
})
export class TransactionModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveTransaction = new EventEmitter<any>();

  // 1. Declara una propiedad para guardar el arreglo de objetos
  categorias: Categoria[] = []; 
  nombresCategorias: string[] = [];

  ngOnInit(): void {
    // Es mejor suscribirse en ngOnInit que en el constructor
    this.categoriaService.getCategorias().subscribe(data => {
      // 'data' es ahora el arreglo de objetos (gracias al 'map' en el servicio)
      this.categorias = data; 
      console.log('Arreglo completo guardado:', this.categorias);
      
      // Si SÓLO quieres una lista de nombres (Opción 2)
      this.nombresCategorias = data.map(cat => cat.nombre);
      console.log('Solo nombres:', this.nombresCategorias);
    });
  }

  // Estado del formulario
  transactionType: 'income' | 'expense' = 'expense';
  amount: number = 0;
  description: string = '';
  date: string = new Date().toISOString().split('T')[0];
  wallet: string = '';
  category: string = '';
  subcategory: string = '';

  // Opciones para los dropdowns
  constructor(private billeteraService: BilleteraService ,private categoriaService: CategoriaService, private http: HttpClient) {
      this.categoriaService.getCategorias().subscribe(data => {
      console.log('Categorías obtenidas:', data);

    });
    this.billeteraService.getBilleteras().subscribe(data => {
      console.log('Billeteras obtenidas:', data);
    }
    );
  }

  getAllGategorias(): Observable<any> {
      return this.http.get<any[]>(`http://localhost:3000/api/categorias`);
    }

  getAllBilleteras(): Observable<any> {
      return this.http.get<any[]>(`http://localhost:3000/api/billeteras`);
    }

  wallets = [
    'Mercado Pago',
    'Santander',
    'Efectivo'
  ];

  categories = this.nombresCategorias;

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