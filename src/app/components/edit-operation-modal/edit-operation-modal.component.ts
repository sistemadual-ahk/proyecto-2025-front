import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { BilleteraService } from '../../services/billetera.service';
import { Billetera } from '../../../models/billetera.model';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { OperacionService } from '../../services/operacion.service';
import { Operacion } from '../../../models/operacion.model';

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toLocalISOString = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const now = new Date();
  const mixedDate = new Date(
    year,
    (month || 1) - 1,
    day || 1,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  );
  return mixedDate.toISOString();
};

@Component({
  selector: 'edit-operation-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './edit-operation-modal.component.html',
  styleUrl: './edit-operation-modal.component.scss',
})
export class EditOperationModal {
  @Input() operacion!: Operacion;
  @Output() closeModal = new EventEmitter<void>();
  @Output() operationUpdated = new EventEmitter<void>();
  @Output() operationDeleted = new EventEmitter<void>();

  private categoriaService: CategoriaService = inject(CategoriaService);
  private billeteraService: BilleteraService = inject(BilleteraService);
  private operacionService: OperacionService = inject(OperacionService);

  transactionType: 'income' | 'expense' = 'expense';
  amount: number = 0;
  description: string = '';
  date: string = formatLocalDate(new Date());
  category: Categoria | null = null;
  wallet: Billetera | null = null;
  isSaving = false;
  isDeleting = false;

  categorias: Categoria[] = [];
  billeteras: Billetera[] = [];

  ngOnInit() {
    // Validar que la operación tenga un ID
    if (!this.operacion._id && !this.operacion.id) {
      console.error('La operación no tiene un ID válido:', this.operacion);
      alert('Error: La operación no tiene un ID válido');
      this.closeModal.emit();
      return;
    }

    this.loadOperationData();
    this.loadData();
  }

  private loadOperationData(): void {
    // Cargar datos de la operación
    this.transactionType = this.operacion.tipo === 'Ingreso' || this.operacion.tipo === 'income' 
      ? 'income' 
      : 'expense';
    this.amount = this.operacion.monto;
    this.description = this.operacion.descripcion || '';
    this.date = formatLocalDate(new Date(this.operacion.fecha));
    
    // La categoría y billetera se cargarán después de obtener las listas
  }

  private loadData(): void {
    // Cargar categorías
    this.categoriaService.getCategorias().subscribe(data => {
      this.categorias = data
        .filter(categoria => categoria.type === this.transactionType)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      // Buscar y asignar la categoría actual
      if (typeof this.operacion.categoria === 'object' && this.operacion.categoria !== null) {
        const catId = (this.operacion.categoria as any).id || (this.operacion.categoria as any)._id;
        this.category = this.categorias.find(c => c.id === catId) || null;
      } else if (this.operacion.categoriaId) {
        this.category = this.categorias.find(c => c.id === this.operacion.categoriaId) || null;
      }
    });

    // Cargar billeteras
    this.billeteraService.getBilleteras().subscribe(data => {
      this.billeteras = data
        .filter(bill => bill.id && bill.id !== '0')
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      // Buscar y asignar la billetera actual
      if (typeof this.operacion.billetera === 'object' && this.operacion.billetera !== null) {
        const billId = (this.operacion.billetera as any).id || (this.operacion.billetera as any)._id;
        this.wallet = this.billeteras.find(b => b.id === billId) || null;
      } else if (this.operacion.billeteraId) {
        this.wallet = this.billeteras.find(b => b.id === this.operacion.billeteraId) || null;
      }
    });
  }

  toggleTransactionType(type: 'income' | 'expense'): void {
    this.transactionType = type;
    this.category = null;
    
    // Recargar categorías del nuevo tipo
    this.categoriaService.getCategorias().subscribe(data => {
      this.categorias = data
        .filter(categoria => categoria.type === this.transactionType)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSave(): void {
    if (!this.amount || this.amount <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    if (!this.description || !this.description.trim()) {
      alert('Por favor ingresa una descripción');
      return;
    }

    if (!this.category) {
      alert('Por favor selecciona una categoría');
      return;
    }

    const selectedWallet = this.wallet || (this.billeteras.length > 0 ? this.billeteras[0] : null);

    if (!selectedWallet) {
      alert('No hay billeteras disponibles. Crea una billetera primero.');
      return;
    }

    const operacionData: Partial<Operacion> = {
      tipo: this.transactionType === 'income' ? 'Ingreso' : 'Egreso',
      monto: this.amount,
      descripcion: this.description.trim(),
      fecha: toLocalISOString(this.date),
      categoriaId: this.category.id,
      billeteraId: selectedWallet.id?.toString() || '',
    };

    // Obtener el ID correcto (puede ser _id o id)
    const operacionId = this.operacion._id || this.operacion.id;
    
    if (!operacionId) {
      console.error('No se pudo obtener el ID de la operación:', this.operacion);
      alert('Error: No se pudo identificar la operación');
      return;
    }

    this.isSaving = true;
    this.operacionService.updateOperacion(operacionId, operacionData).subscribe({
      next: () => {
        this.isSaving = false;
        this.operationUpdated.emit();
        this.closeModal.emit();
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error al actualizar operación:', error);
        alert('Error al actualizar la operación');
      },
    });
  }

  onDelete(): void {
    if (!confirm('¿Estás seguro de que quieres eliminar esta operación?')) {
      return;
    }

    // Obtener el ID correcto (puede ser _id o id)
    const operacionId = this.operacion._id || this.operacion.id;
    
    if (!operacionId) {
      console.error('No se pudo obtener el ID de la operación:', this.operacion);
      alert('Error: No se pudo identificar la operación');
      return;
    }

    this.isDeleting = true;
    this.operacionService.deleteOperacion(operacionId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.operationDeleted.emit();
        this.closeModal.emit();
      },
      error: (error) => {
        this.isDeleting = false;
        console.error('Error al eliminar operación:', error);
        alert('Error al eliminar la operación');
      },
    });
  }
}
