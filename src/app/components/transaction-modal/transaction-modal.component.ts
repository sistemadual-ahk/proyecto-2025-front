import { OnInit, Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BilleteraService, Billetera } from '../../services/billetera.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { Operacion, OperacionService } from '../../services/operation.service';
import { Observable } from 'rxjs';

//hola

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  // Mantenemos FormsModule para soportar [(ngModel)]
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.scss']
})
export class TransactionModalComponent implements OnInit {

  // --- INYECCIÓN DE DEPENDENCIAS ---
  private operacionService: OperacionService = inject(OperacionService);
  private billeteraService: BilleteraService = inject(BilleteraService);
  private categoriaService: CategoriaService = inject(CategoriaService);
  private http: HttpClient = inject(HttpClient); // Dejamos la inyección aunque no se use directamente

  // --- OUTPUTS ---
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveTransaction = new EventEmitter<any>();

  // --- ESTADO DEL FORMULARIO (Template-Driven requiere estas variables) ---
  transactionType: 'income' | 'expense' = 'expense';
  amount: number = 0;
  description: string = '';
  date: string = new Date().toISOString().split('T')[0];
  wallet: string = ''; // Almacena el NOMBRE de la billetera seleccionada
  category: string = ''; // Almacena el NOMBRE de la categoría seleccionada

  // --- DATOS CARGADOS DEL BACKEND ---
  // Estos arrays guardan el objeto completo (con ID)
  categorias: Categoria[] = [];
  billeteras: Billetera[] = [];

  // Estos arrays guardan SÓLO los nombres para iterar en el HTML
  nombresCategorias: string[] = [];
  nombresBilleteras: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Carga de Categorías
    this.categoriaService.getCategorias().subscribe(data => {
      this.categorias = data;
      this.nombresCategorias = data.map(cat => cat.nombre);
    });

    // Carga de Billeteras
    this.billeteraService.getBilleteras().subscribe(data => {
      this.billeteras = data;
      this.nombresBilleteras = data.map(bill => bill.nombre);
    });
  }

  // --- LÓGICA AUXILIAR ---


  toggleTransactionType(type: 'income' | 'expense'): void {
    this.transactionType = type;
  }

  onClose(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  onSave(): void {
    // 1. Mapear NOMBRES (del ngModel) a IDs (para el backend)
    const selectedWallet = this.billeteras.find(b => b.nombre === this.wallet);
    const selectedCategory = this.categorias.find(c => c.nombre === this.category);

    if (!selectedWallet || !selectedCategory || this.amount <= 0) {
      console.error("Validación fallida: El monto debe ser > 0 y debe seleccionar billetera/categoría.");
      return;
    }

    // 2. Construir el objeto para el backend (usando IDs)
    const operacionData: Omit<Operacion, '_id' | 'user'> = {
      monto: Math.abs(this.amount),
      descripcion: this.description,
      fecha: new Date(this.date).toISOString(),
      tipo: this.transactionType,
      billetera: selectedWallet.id, // ID
      categoria: selectedCategory.id, // ID
    };

    // 3. Llamada al servicio
    this.operacionService.createOperacion(operacionData).subscribe({
      next: (response) => {
        console.log('Operación guardada exitosamente:', response);
        this.saveTransaction.emit(response);
        this.onClose();
      },
      error: (error) => {
        console.error('Error al guardar la operación:', error);
      }
    });
  }

  private resetForm(): void {
    this.transactionType = 'expense';
    this.amount = 0;
    this.description = '';
    this.date = new Date().toISOString().split('T')[0];
    this.wallet = '';
    this.category = '';
  }
}



/* import { OnInit, Component, EventEmitter, Injectable, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { privateDecrypt } from 'crypto';
import { HttpClient } from '@angular/common/http';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { Billetera, BilleteraService } from '../../services/billetera.service';
import { Operacion, OperacionService } from '../../services/operation.service';

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

  billeteras: Billetera[] = [];
  nombresBilleteras: string[] = [];

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

    this.billeteraService.getBilleteras().subscribe(data => {
      this.billeteras = data;
      console.log('Billeteras obtenidas:', data);

      this.nombresBilleteras = this.billeteras.map(bill => bill.nombre);
      console.log('Nombres de billeteras:', this.nombresBilleteras);
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
    console.log('Transacción a guardar:', transaction);

    // Llama al servicio para crear la operación
    this.operacionService.createOperacion(operacionData).subscribe({
    next: (response) => {
      console.log('Operación guardada exitosamente:', response);
      // **IMPORTANTE:** Aquí deberías iniciar la recarga de datos en el HomeComponent.
      this.closeModal(); // Cerrar al éxito
    },
    error: (error) => {
      console.error('Error al guardar la operación en el backend:', error);
      // Aquí puedes implementar lógica para mostrar un mensaje de error al usuario
    }
  });
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
} */