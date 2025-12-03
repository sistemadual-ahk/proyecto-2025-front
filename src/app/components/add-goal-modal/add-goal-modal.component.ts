import { Component, EventEmitter, Input, Output, OnInit, HostBinding } from '@angular/core';
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
export class AddGoalModalComponent implements OnInit {
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

  getSelectedCategory(): Categoria | undefined {
    return this.categorias.find(c => c.id === this.categoriaId);
  }

  get isFormValid(): boolean {
    return !!this.titulo.trim() && 
           !!this.montoObjetivo && 
           this.montoObjetivo > 0 && 
           !!this.fechaInicio && 
           !!this.fechaEsperadaFinalizacion;
  }

  ngOnInit() {
    // Cargar categorías
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.categorias = [];
      }
    });

    if (this.edit && this.objetivo) {
      // Cargar datos del objetivo existente
      this.titulo = this.objetivo.titulo;
      this.montoObjetivo = this.objetivo.montoObjetivo;
      this.montoActual = this.objetivo.montoActual;
      this.categoriaId = this.objetivo.categoriaId || '';
      this.billeteraId = this.objetivo.billeteraId || '';
      this.color = this.objetivo.color || this.colorOptions[0];
      this.fechaInicio = this.objetivo.fechaInicio;
      this.fechaEsperadaFinalizacion = this.objetivo.fechaEsperadaFinalizacion;
      this.fechaFin = this.objetivo.fechaFin;
      this.estado = this.objetivo.estado;
      this.operaciones = this.objetivo.operaciones || [];
    } else {
      // Establecer fecha de inicio como hoy y color por defecto para nuevos objetivos
      this.fechaInicio = new Date().toISOString().split('T')[0];
      this.color = this.colorOptions[0];
    }
  }

  onClose() {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
    }, 300);
  }

  onSave() {
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

  onDelete() {
    this.delete.emit();
  }

  // Métodos para manejar el estado
  toggleEstado() {
    this.estado = this.estado === EstadoObjetivo.COMPLETADO 
      ? EstadoObjetivo.PENDIENTE 
      : EstadoObjetivo.COMPLETADO;
    
    // Si se marca como completado, establecer fecha de fin
    if (this.estado === EstadoObjetivo.COMPLETADO && !this.fechaFin) {
      this.fechaFin = new Date().toISOString().split('T')[0];
    } else if (this.estado === EstadoObjetivo.PENDIENTE) {
      this.fechaFin = undefined;
    }
  }

  isCompleted(): boolean {
    return this.estado === EstadoObjetivo.COMPLETADO;
  }

  // Método para seleccionar color
  selectColor(selectedColor: string) {
    this.color = selectedColor;
  }

  // Métodos para operaciones
  getRecentOperations(): Operacion[] {
    if (!this.operaciones || this.operaciones.length === 0) {
      return [];
    }
    // Ordenar por fecha descendente y tomar las últimas 5
    return [...this.operaciones]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }

  formatDate(fecha: string): string {
    const date = new Date(fecha);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Resetear horas para comparación
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Hoy';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  }

  getStatusLabel(): string {
    return this.isCompleted() ? 'Completado' : 'Pendiente';
  }

  // Método para calcular el progreso
  getProgress(): number {
    if (!this.montoObjetivo || this.montoObjetivo === 0) return 0;
    return Math.min((this.montoActual / this.montoObjetivo) * 100, 100);
  }

  // Control de edición
  editingIndex: number | null = null;

  // Método para agregar nueva operación
  addOperacion() {
    const newOperacion: Operacion = {
      tipo: 'Ingreso',
      monto: 0,
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
    };
    this.operaciones.push(newOperacion);
    this.editingIndex = this.operaciones.length - 1;
  }

  // Método para toggle del tipo de operación
  toggleTipo(operacion: Operacion) {
    operacion.tipo = operacion.tipo === 'Ingreso' ? 'Egreso' : 'Ingreso';
  }

  // Método para iniciar edición de operación
  startEditOperacion(index: number) {
    this.editingIndex = index;
  }

  // Método para guardar operación
  saveOperacion() {
    this.updateMontoActual();
    this.editingIndex = null;
  }

  // Método para eliminar operación
  deleteOperacion(index: number) {
    this.operaciones.splice(index, 1);
    this.editingIndex = null;
    this.updateMontoActual();
  }

  // Método para actualizar el monto actual basado en las operaciones
  updateMontoActual() {
    this.montoActual = this.operaciones.reduce((total, op) => {
      if (op.tipo === 'Ingreso' || op.tipo === 'income') {
        return total + (op.monto || 0);
      } else {
        return total - (op.monto || 0);
      }
    }, 0);
  }

  // Método para verificar si es ingreso
  isIngreso(operacion: Operacion): boolean {
    return operacion.tipo === 'Ingreso' || operacion.tipo === 'income';
  }
}


