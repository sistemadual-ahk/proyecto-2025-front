import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Operation } from '../../../models/operation.model';

@Component({
  selector: 'app-operation',
  standalone: true,
  imports: [],
  templateUrl: './operation.component.html',
  styleUrl: './operation.component.scss'
})

export class AddOperationModalComponent {
  // Eventos para interactuar con el componente padre
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveOperation = new EventEmitter<Partial<Operation>>();

  // Estado del formulario
  descripcion = '';
  monto: number | null = null;
  categoria: string | null = null;

  // Datos de prueba para las categorías (idealmente vendrían de un servicio)
  categoriasDisponibles = [
    { id: '651d8d21c380f2d8471c9a81', nombre: 'Comida' },
    { id: '651d8d21c380f2d8471c9a82', nombre: 'Transporte' },
    { id: '651d8d21c380f2d8471c9a83', nombre: 'Entretenimiento' },
    { id: '651d8d21c380f2d8471c9a80', nombre: 'Hogar' }
  ];

  /**
   * Cierra el modal sin guardar los datos.
   */
  onClose() {
    this.closeModal.emit();
  }

  /**
   * Emite los datos del nuevo Operation si el formulario es válido.
   */
  onSave() {
    // Validar que los campos no estén vacíos
    if (!this.descripcion.trim() || this.monto === null || this.categoria === null) {
      console.error('La descripción, el monto y la categoría son obligatorios.');
      return;
    }
    
    this.saveOperation.emit({
      descripcion: this.descripcion.trim(),
      monto: Math.max(0, this.monto), // Aseguramos que el monto no sea negativo
      categoria: this.categoria
    });
    
    this.resetForm();
  }

  /**
   * Reinicia el estado del formulario a sus valores iniciales.
   */
  private resetForm() {
    this.descripcion = '';
    this.monto = null;
    this.categoria = null;
  }
}

