import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Objetivo, EstadoObjetivo } from '../../../models/objetivo.model';
import { Operacion } from '../../../models/operacion.model';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-goal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule],
  templateUrl: './add-goal-modal.component.html',
  styleUrl: './add-goal-modal.component.scss',
})
export class AddGoalModalComponent implements OnInit, OnChanges {
  @Input() edit: boolean = false;
  @Input() objetivo?: Objetivo;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Objetivo>();
  @Output() delete = new EventEmitter<void>();

  @HostBinding('class.closing') isClosing = false;

  // Campos del formulario
  montoObjetivo: number | null = null;
  montoActual: number = 0;
  categoriaId: string = '';
  billeteraId: string = '';
  color: string = '#E5E7EB';
  fechaInicio: string = '';
  fechaEsperadaFinalizacion: string = '';
  fechaFin?: string;
  titulo: string = '';
  estado: EstadoObjetivo = EstadoObjetivo.PENDIENTE;
  operaciones: Operacion[] = [];

  // Lista de categorías
  categorias: Categoria[] = [];

  // Opciones de colores predefinidos
  colorOptions: string[] = [
    '#8B5CF6', // Púrpura
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Ámbar
    '#EF4444', // Rojo
    '#EC4899', // Rosa
  ];

  constructor(private categoriaService: CategoriaService) {}

  // ✅ validación simple del form (ahora categoría es obligatoria)
  get isFormValid(): boolean {
    return (
      !!this.titulo.trim() &&
      !!this.montoObjetivo &&
      this.montoObjetivo > 0 &&
      !!this.fechaInicio &&
      !!this.fechaEsperadaFinalizacion &&
      !!this.categoriaId
    );
  }

  // ===================== CICLO DE VIDA =====================

  ngOnInit(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;

        if (this.edit && this.objetivo) {
          this.patchFromObjetivo(this.objetivo);
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.categorias = [];
      },
    });

    if (this.edit && this.objetivo) {
      this.patchFromObjetivo(this.objetivo);
    } else {
      this.fechaInicio = new Date().toISOString().split('T')[0];
      this.color = this.colorOptions[0];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objetivo'] && this.edit && this.objetivo) {
      this.patchFromObjetivo(this.objetivo);
    }
  }

  // ===================== HELPERS DE MAPEOS =====================

  private normalizeDate(value: any): string {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  private patchFromObjetivo(obj: Objetivo): void {
    const anyObj: any = obj;

    this.titulo = obj.titulo;
    this.montoObjetivo = obj.montoObjetivo;
    this.montoActual = obj.montoActual;

    this.categoriaId =
      (obj as any).categoriaId ||
      anyObj.categoriaId ||
      anyObj.categoria?._id ||
      anyObj.categoria?.id ||
      '';

    this.billeteraId =
      (obj as any).billeteraId ||
      anyObj.billeteraId ||
      anyObj.billetera?._id ||
      anyObj.billetera?.id ||
      '';

    this.color = (obj as any).color || this.colorOptions[0];

    this.fechaInicio = this.normalizeDate(obj.fechaInicio as any);
    this.fechaEsperadaFinalizacion = this.normalizeDate(
      obj.fechaEsperadaFinalizacion as any
    );
    this.fechaFin = obj.fechaFin
      ? this.normalizeDate(obj.fechaFin as any)
      : undefined;

    this.estado = obj.estado;
    this.operaciones = obj.operaciones ? [...obj.operaciones] : [];
  }

  // ===================== ACCIONES PRINCIPALES =====================

  onClose(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
    }, 300);
  }

  onSave(): void {
    const objetoToSave: Objetivo = {
      id: this.objetivo?.id,
      titulo: this.titulo,
      montoObjetivo: this.montoObjetivo || 0,
      montoActual: this.montoActual,
      categoriaId: this.categoriaId,
      billeteraId: this.billeteraId,
      color: this.color,
      fechaInicio: this.fechaInicio,
      fechaEsperadaFinalizacion: this.fechaEsperadaFinalizacion,
      fechaFin: this.fechaFin,
      estado: this.estado,
      operaciones: this.operaciones,
    };

    this.save.emit(objetoToSave);
  }

  onDelete(): void {
    this.delete.emit();
  }

  // ===================== ESTADO / FECHAS =====================

  toggleEstado(): void {
    this.estado =
      this.estado === EstadoObjetivo.COMPLETADO
        ? EstadoObjetivo.PENDIENTE
        : EstadoObjetivo.COMPLETADO;

    if (this.estado === EstadoObjetivo.COMPLETADO && !this.fechaFin) {
      this.fechaFin = new Date().toISOString().split('T')[0];
    } else if (this.estado === EstadoObjetivo.PENDIENTE) {
      this.fechaFin = undefined;
    }
  }

  isCompleted(): boolean {
    return this.estado === EstadoObjetivo.COMPLETADO;
  }

  selectColor(selectedColor: string): void {
    this.color = selectedColor;
  }

  // ===================== OPERACIONES LOCALES =====================

  private buildDefaultDescripcion(tipo: Operacion['tipo']): string {
    const base = this.titulo?.trim() || 'Objetivo';
    const sufijo =
      tipo === 'Ingreso' || tipo === 'income' ? 'Ingreso' : 'Egreso';
    return `${base} ${sufijo}`;
  }

  getRecentOperations(): Operacion[] {
    if (!this.operaciones || this.operaciones.length === 0) {
      return [];
    }
    return [...this.operaciones]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
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

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoy';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  getStatusLabel(): string {
    return this.isCompleted() ? 'Completado' : 'Pendiente';
  }

  getProgress(): number {
    if (!this.montoObjetivo || this.montoObjetivo === 0) return 0;
    return Math.min((this.montoActual / this.montoObjetivo) * 100, 100);
  }

  // --- edición de operaciones ---

  editingIndex: number | null = null;

  addOperacion(): void {
    const defaultTipo: Operacion['tipo'] = 'Egreso';

    const newOperacion: Operacion = {
      tipo: defaultTipo,
      monto: 0,
      descripcion: this.buildDefaultDescripcion(defaultTipo),
      fecha: new Date().toISOString().split('T')[0],
    };
    this.operaciones.push(newOperacion);
    this.editingIndex = this.operaciones.length - 1;
  }

  toggleTipo(operacion: Operacion): void {
    const oldTipo = operacion.tipo;
    const newTipo: Operacion['tipo'] =
      oldTipo === 'Ingreso' || oldTipo === 'income' ? 'Egreso' : 'Ingreso';

    const autoIngreso = this.buildDefaultDescripcion('Ingreso');
    const autoEgreso = this.buildDefaultDescripcion('Egreso');

    const desc = operacion.descripcion || '';

    // Solo pisamos la descripción si era la automática o estaba vacía
    if (!desc || desc === autoIngreso || desc === autoEgreso) {
      operacion.descripcion = this.buildDefaultDescripcion(newTipo);
    }

    operacion.tipo = newTipo;
  }

  startEditOperacion(index: number): void {
    this.editingIndex = index;
  }

  saveOperacion(): void {
    this.updateMontoActual();
    this.editingIndex = null;
  }

  deleteOperacion(index: number): void {
    this.operaciones.splice(index, 1);
    this.editingIndex = null;
    this.updateMontoActual();
  }

  // Egreso  => suma al objetivo
  // Ingreso => resta al objetivo
  updateMontoActual(): void {
    this.montoActual = this.operaciones.reduce((total, op) => {
      const monto = op.monto || 0;
      if (op.tipo === 'Egreso' || op.tipo === 'expense') {
        return total + monto;
      } else {
        return total - monto;
      }
    }, 0);
  }

  isIngreso(operacion: Operacion): boolean {
    return operacion.tipo === 'Egreso' || operacion.tipo === 'expense';
  }

  // ===================== CATEGORÍA =====================

  getSelectedCategory(): Categoria | undefined {
    if (!this.categoriaId) return undefined;
    return this.categorias.find(
      (c) => c.id === this.categoriaId || (c as any)._id === this.categoriaId
    );
  }
}
