import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoObjetivo } from '../../../models/objetivo.model';
import { Operacion } from '../../../models/operacion.model';

@Component({
  selector: 'app-add-goal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-goal-modal.component.html',
  styleUrl: './add-goal-modal.component.scss',
})
export class AddGoalModalComponent {
  @Input() edit: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() delete = new EventEmitter<void>();

  amount: number | null = null;
  category: string = '';
  color: string = '#E5E7EB';
  startDate: string = '';
  endDate: string = '';
  title: string = '';
  estado: EstadoObjetivo = EstadoObjetivo.PENDIENTE;
  operaciones: Operacion[] = [];

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit({ 
      amount: this.amount, 
      category: this.category, 
      color: this.color, 
      startDate: this.startDate, 
      endDate: this.endDate, 
      title: this.title,
      estado: this.estado,
      operaciones: this.operaciones
    });
  }

  onDelete() {
    this.delete.emit();
  }

  toggleEstado() {
    this.estado = this.estado === EstadoObjetivo.COMPLETADO 
      ? EstadoObjetivo.PENDIENTE 
      : EstadoObjetivo.COMPLETADO;
  }

  isCompleted(): boolean {
    return this.estado === EstadoObjetivo.COMPLETADO;
  }

  getStatusLabel(): string {
    return this.estado === EstadoObjetivo.COMPLETADO ? 'Completado' : 'Pendiente';
  }
}


