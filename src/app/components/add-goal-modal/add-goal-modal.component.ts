import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Objetivo, EstadoObjetivo } from '../../../models/objetivo.model';
import { Operacion } from '../../../models/operacion.model';

@Component({
  selector: 'app-add-goal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-goal-modal.component.html',
  styleUrl: './add-goal-modal.component.scss',
})
export class AddGoalModalComponent implements OnInit {
  @Input() edit: boolean = false;
  @Input() objetivo?: Objetivo;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Objetivo>();
  @Output() delete = new EventEmitter<void>();

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

  // Opciones de colores predefinidos
  colorOptions: string[] = [
    '#8B5CF6', // Púrpura
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Ámbar
    '#EF4444', // Rojo
    '#EC4899', // Rosa
  ];

  ngOnInit() {
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
    this.close.emit();
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
}


