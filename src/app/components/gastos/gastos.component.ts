import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Gasto } from '../../../models/gasto.model';
import { CategoryService } from '../../services/category.service';
import { Categoria } from '../../../models/categoria.model';

@Component({
  selector: 'app-add-gasto-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.component.html',
  styleUrl: './gastos.component.scss'
})
export class AddGastoModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveGasto = new EventEmitter<Partial<Gasto>>();

  descripcion = '';
  monto: number | null = null;
  categoria: Categoria | null = null;

  // Datos de prueba para las categorías (idealmente vendrían de un servicio)
  /*categoriasDisponibles = [
    { id: '651d8d21c380f2d8471c9a81', nombre: 'Comida' },
    { id: '651d8d21c380f2d8471c9a82', nombre: 'Transporte' },
    { id: '651d8d21c380f2d8471c9a83', nombre: 'Entretenimiento' },
    { id: '651d8d21c380f2d8471c9a80', nombre: 'Hogar' }
  ];*/
  categoriasDisponibles: Categoria[] = [];

  constructor(private categoriaService: CategoryService) {
    this.categoriaService.getAllCategories().subscribe((categorias) => {
      this.categoriasDisponibles = categorias;
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  onSave() {
    // Validar que los campos no estén vacíos
    if (!this.descripcion.trim() || this.monto === null || this.categoria === null) {
      console.error('La descripción, el monto y la categoría son obligatorios.');
      return;
    }

    this.saveGasto.emit({
      descripcion: this.descripcion.trim(),
      monto: Math.max(0, this.monto),
      categoria: this.categoria
    });

    this.resetForm();
  }

  private resetForm() {
    this.descripcion = '';
    this.monto = null;
    this.categoria = null;
  }
}
