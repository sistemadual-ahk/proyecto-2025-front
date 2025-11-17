import { OnInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { BilleteraService, Billetera } from '../../services/billetera.service';
import { CategoriaService, Categoria } from '../../services/categoria.service';
import { OperacionService } from '../../services/operacion.service';
import { Operacion } from '../../../models/operacion.model';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'add-operation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatBottomSheetModule, MatSelectModule],
  templateUrl: './add-operation-modal.component.html',
  styleUrls: ['./add-operation-modal.component.scss'],
})
export class TransactionBottomSheet implements OnInit {
  // --- INYECCIÓN DE DEPENDENCIAS ---
  private _bottomSheetRef = inject<MatBottomSheetRef<TransactionBottomSheet>>(MatBottomSheetRef);
  private operacionService: OperacionService = inject(OperacionService);
  private billeteraService: BilleteraService = inject(BilleteraService);
  private categoriaService: CategoriaService = inject(CategoriaService);
  private http: HttpClient = inject(HttpClient);

  // --- ESTADO DEL FORMULARIO ---
  transactionType: 'income' | 'expense' = 'expense';
  amount: number | null = null;
  description: string = '';
  date: string = new Date().toISOString().split('T')[0];
  wallet: string = ''; // Almacena el NOMBRE de la billetera seleccionada
  category: string = ''; // Almacena el NOMBRE de la categoría seleccionada

  // --- DATOS CARGADOS DEL BACKEND ---
  categorias: Categoria[] = [];
  billetera: Billetera[] = [];
  nombresCategorias: string[] = [];
  nombresBilleteras: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Carga de Categorías
    this.categoriaService.getCategorias().subscribe((data) => {
      this.categorias = data;
      this.nombresCategorias = data.map((cat) => cat.nombre);
    });

    // Carga de Billeteras
    this.billeteraService.getBilleteras().subscribe(data => {
      this.billetera = data;
      this.nombresBilleteras = data.map(bill => bill.nombre);
    });
  }

  toggleTransactionType(type: 'income' | 'expense'): void {
    this.transactionType = type;
  }

  onClose(): void {
    this.resetForm();
    this._bottomSheetRef.dismiss();
  }

  onSave(): void {
    // 1. Mapear NOMBRES (del ngModel) a IDs (para el backend)
    const selectedWallet = this.billetera.find(b => b.nombre === this.wallet);
    const selectedCategory = this.categorias.find(c => c.nombre === this.category);

    if (!selectedWallet || !selectedCategory || this.amount == null || this.amount <= 0) {
      console.error(
        'Validación fallida: El monto debe ser > 0 y debe seleccionar billetera/categoría.'
      );
      return;
    }

    // 2. Construir el objeto para el backend (usando IDs)
    const operacionData: any = {
      monto: Math.abs(this.amount!),
      descripcion: this.description,
      fecha: new Date(this.date).toISOString(),
      tipo: this.transactionType, // Send 'income' or 'expense' as backend expects
      billetera: selectedWallet.id?.toString(), // Backend expects 'billetera'
      categoria: selectedCategory.id, // Backend expects 'categoria'
    };

    // 3. Llamada al servicio
    this.operacionService.createOperacion(operacionData).subscribe({
      next: (response) => {
        console.log('Operación guardada exitosamente:', response);
        this._bottomSheetRef.dismiss(response); // Devolver la respuesta al cerrar
      },
      error: (error) => {
        console.error('Error al guardar la operación:', error);
      },
    });
  }

  openDatePicker(input: HTMLInputElement): void {
    if (!input) return;
    const anyInput = input as any;
    if (typeof anyInput.showPicker === 'function') {
      anyInput.showPicker();
    } else {
      // Fallback para navegadores sin showPicker
      input.focus();
      input.click();
    }
  }

  get descriptionPlaceholder(): string {
    return this.transactionType === 'income'
      ? '¿Qué ingreso recibiste? (ej: Salario, Devolución, etc.)'
      : '¿Qué compraste? (ej: Almuerzo, Gasolina, etc.)';
  }

  get isFormValid(): boolean {
    const hasAmount = this.amount !== null && this.amount > 0;
    const hasDescription = this.description.trim().length > 0;
    const hasWallet = !!this.wallet;
    const hasCategory = !!this.category;
    const hasDate = !!this.date;

    return hasAmount && hasDescription && hasWallet && hasCategory && hasDate;
  }

  private resetForm(): void {
    this.transactionType = 'expense';
    this.amount = null;
    this.description = '';
    this.date = new Date().toISOString().split('T')[0];
    this.wallet = '';
    this.category = '';
  }
}
