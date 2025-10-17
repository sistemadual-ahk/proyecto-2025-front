import { OnInit, Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BilleteraService, NewBilletera } from '../../services/billetera.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { Operacion, OperacionService } from '../../services/operation.service';

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
  isDragging = false;
  dragTranslateY = 0;
  startY = 0;
  currentY = 0;
  closeThreshold = 100;

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
  billetera: NewBilletera[] = [];

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
      this.billetera = data;
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
    const selectedWallet = this.billetera.find(b => b.nombre === this.wallet);
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
      tipo: this.transactionType === 'income' ? 'Ingreso' : 'Egreso',
 
      categoriaId: selectedCategory.id, // ID
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
    this.description = null as any;
    this.date = new Date().toISOString().split('T')[0];
    this.wallet = null as any;
    this.category = null as any;
  }
}