import { OnInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { BilleteraService } from '../../services/billetera.service';
import { Billetera } from '../../../models/billetera.model';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { OperacionService } from '../../services/operacion.service';
import { Operacion } from '../../../models/operacion.model';
import { MatSelectModule } from '@angular/material/select';

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toLocalISOString = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Construir la fecha directamente en UTC al mediodía para evitar corrimientos por huso horario
  const utcDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1, 12, 0, 0));
  return utcDate.toISOString();
};

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

  // --- ESTADO DEL FORMULARIO ---
  transactionType: 'income' | 'expense' = 'expense';
  amount: number | null = null;
  description: string = '';
  date: string = '';
  wallet: string = ''; // Almacena el NOMBRE de la billetera seleccionada
  category: string = ''; // Almacena el NOMBRE de la categoría seleccionada

  // --- DATOS CARGADOS DEL BACKEND ---
  categorias: Categoria[] = [];
  billeteras: Billetera[] = [];

  constructor() { }

  ngOnInit(): void {
    this.date = formatLocalDate(new Date());
    this.loadData();
  }

  loadData(): void {
    // Carga de Categorías
    this.categoriaService.getCategorias().subscribe((data) => {
      this.categorias = data.filter(categoria => categoria.type === this.transactionType);
      console.log('Categorías filtradas:', this.categorias);
    });


    // Carga de Billeteras (filtrar la General id:0 ya que no existe en el backend)
    this.billeteraService.getBilleteras().subscribe(data => {
      // Filtrar billeteras reales (excluir cualquier billetera sin ID o con ID "0")
      this.billeteras = data.filter(bill => bill.id && bill.id !== 0);
      console.log('Billeteras cargadas:', this.billeteras);

      if (this.billeteras.length === 0) {
        console.warn('⚠️ No hay billeteras disponibles. Crea una primero.');
      }
    });
  }

  toggleTransactionType(type: 'income' | 'expense'): void {
    this.transactionType = type;
    this.loadData();
  }

  onClose(): void {
    this.resetForm();
    this._bottomSheetRef.dismiss();
  }

  onSave(): void {
    console.log('Intentando guardar operación...');
    console.log('Formulario:', {
      amount: this.amount,
      description: this.description,
      wallet: this.wallet,
      category: this.category,
      date: this.date,
      type: this.transactionType
    });

    // 1. Validar categoría (obligatoria)
    const selectedCategory = this.categorias.find(c => c.nombre === this.category);
    let selectedWallet = this.billeteras.find(b => b.nombre === this.wallet);

    if (!selectedCategory) {
      console.error('❌ No se seleccionó una categoría válida');
      alert('Debes seleccionar una categoría');
      return;
    }

    if (this.amount == null || this.amount <= 0) {
      console.error('❌ El monto debe ser mayor a 0');
      alert('El monto debe ser mayor a 0');
      return;
    }

    // 2. Mapear billetera: si no se seleccionó, usar la primera disponible o null

    if (!selectedWallet && this.billeteras.length > 0) {
      selectedWallet = this.billeteras[0];
      console.log('⚠️ No se seleccionó billetera, usando la primera disponible:', selectedWallet.nombre);
    }

    console.log('Billetera seleccionada:', selectedWallet);
    console.log('Categoría seleccionada:', selectedCategory);

    // 3. Construir el objeto para el backend (el servicio espera 'billetera' y 'categoria', no los del DTO)
    const operacionData: any = {
      monto: Math.abs(this.amount!),
      billeteraId: selectedWallet ? selectedWallet.id : null,
      descripcion: this.description,
      fecha: toLocalISOString(this.date),
      tipo: this.transactionType === 'income' ? 'income' : 'expense', // El servicio traduce income/expense a Ingreso/Egreso
      categoriaId: selectedCategory.id, // El servicio espera 'categoria'
    };

    // Agregar billetera solo si existe
    if (selectedWallet && selectedWallet.id) {
      operacionData.billetera = selectedWallet.id.toString(); // El servicio espera 'billetera'
    }

    console.log('Datos a enviar:', operacionData);

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
    const hasCategory = !!this.category;
    const hasDate = !!this.date;

    // La billetera ya no es obligatoria
    return hasAmount && hasDescription && hasCategory && hasDate;
  }

  private resetForm(): void {
    this.transactionType = 'expense';
    this.amount = null;
    this.description = '';
    this.date = formatLocalDate(new Date());
    this.wallet = '';
    this.category = '';
  }
}
