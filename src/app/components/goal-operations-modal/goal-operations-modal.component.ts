import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { Objetivo } from '../../../models/objetivo.model';
import { Operacion } from '../../../models/operacion.model';
import { BilleteraService } from '../../services/billetera.service';
import { Billetera } from '../../../models/billetera.model';

@Component({
  selector: 'app-goal-operations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule],
  templateUrl: './goal-operations-modal.component.html',
  styleUrl: './goal-operations-modal.component.scss',
})
export class GoalOperationsModalComponent implements OnInit, OnChanges {
  @Input() objetivo?: Objetivo;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Operacion[]>();

  @HostBinding('class.closing') isClosing = false;

  private billeteraService = inject(BilleteraService);
  operaciones: Operacion[] = [];
  billeteras: Billetera[] = [];
  editingIndex: number | null = null;

  ngOnInit(): void {
    if (this.objetivo) {
      this.patchFromObjetivo(this.objetivo);
    }
    this.loadBilleteras();
  }

  private loadBilleteras(): void {
    this.billeteraService.getBilleteras().subscribe((data) => {
      this.billeteras = data.filter(b => b.id !== '0'); // Excluir general si es necesario
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objetivo'] && this.objetivo) {
      this.patchFromObjetivo(this.objetivo);
    }
  }

  onClose(): void {
    this.isClosing = true;
    setTimeout(() => this.close.emit(), 300);
  }

  onSave(): void {
    this.save.emit(this.operaciones);
  }

  get pendingDelta(): number {
    return this.operaciones.reduce((total, op) => {
      if (op._id || op.id) return total;
      const monto = op.monto || 0;
      // Ingreso suma al objetivo, Egreso resta del objetivo
      if (op.tipo === 'Ingreso' || op.tipo === 'income') {
        return total + monto;
      }
      return total - monto;
    }, 0);
  }

  get previewMontoActual(): number {
    const base = this.objetivo?.montoActual || 0;
    return base + this.pendingDelta;
  }

  get hasPendingOperations(): boolean {
    return this.operaciones.some((op) => !op._id && !op.id);
  }

  formatDate(fecha: string): string {
    const date = new Date(fecha);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (dateOnly.getTime() === todayOnly.getTime()) return 'Hoy';
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return 'Ayer';
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  addOperacion(): void {
    const defaultTipo: Operacion['tipo'] = 'Ingreso';
    // Obtener la fecha local correcta de Argentina (ART: UTC-3)
    const today = new Date();
    const argentinaTime = new Date(today.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const year = argentinaTime.getFullYear();
    const month = String(argentinaTime.getMonth() + 1).padStart(2, '0');
    const day = String(argentinaTime.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;
    
    // Billetera por defecto (la primera o la marcada como default)
    const defaultWallet = this.billeteras.find(b => b.isDefault) || this.billeteras[0];

    const newOperacion: Operacion = {
      tipo: defaultTipo,
      monto: 0,
      descripcion: '',
      fecha: localDateString,
      billeteraId: defaultWallet?.id,
      billetera: defaultWallet?.id // Para compatibilidad
    };
    this.operaciones.push(newOperacion);
    this.editingIndex = this.operaciones.length - 1;
  }

  startEditOperacion(index: number): void {
    this.editingIndex = index;
  }

  saveOperacion(): void {
    this.editingIndex = null;
  }

  deleteOperacion(index: number): void {
    this.operaciones.splice(index, 1);
    this.editingIndex = null;
    // Fuerza la detección de cambios
    this.operaciones = [...this.operaciones];
  }

  toggleTipo(operacion: Operacion): void {
    const oldTipo = operacion.tipo;
    const newTipo: Operacion['tipo'] =
      oldTipo === 'Ingreso' || oldTipo === 'income' ? 'Egreso' : 'Ingreso';

    const autoIngreso = this.buildDefaultDescripcion('Ingreso');
    const autoEgreso = this.buildDefaultDescripcion('Egreso');

    const desc = operacion.descripcion || '';
    if (!desc || desc === autoIngreso || desc === autoEgreso) {
      operacion.descripcion = this.buildDefaultDescripcion(newTipo);
    }

    operacion.tipo = newTipo;
  }

  onMontoFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    // Selecciona todo el contenido para permitir reescribir fácilmente
    input.select();
  }

  onDateChange(operacion: Operacion): void {
    // Asegurarse de que la fecha está en formato YYYY-MM-DD
    if (operacion.fecha) {
      const date = new Date(operacion.fecha);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      operacion.fecha = `${year}-${month}-${day}`;
    }
  }

  isIngreso(operacion: Operacion): boolean {
    return operacion.tipo === 'Ingreso' || operacion.tipo === 'income';
  }

  private patchFromObjetivo(obj: Objetivo): void {
    this.operaciones = obj.operaciones
      ? obj.operaciones.map((op) => {
          const operacion = { ...op, monto: Number(op.monto) || 0 };
          // Normalizar fecha a formato YYYY-MM-DD
          if (operacion.fecha) {
            const date = new Date(operacion.fecha);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            operacion.fecha = `${year}-${month}-${day}`;
          }
          return operacion;
        })
      : [];
    this.editingIndex = null;
  }

  private buildDefaultDescripcion(tipo: Operacion['tipo']): string {
    const base = this.objetivo?.titulo?.trim() || 'Objetivo';
    const sufijo =
      tipo === 'Ingreso' || tipo === 'income' ? 'Ingreso' : 'Egreso';
    return `${base} ${sufijo}`;
  }
}
