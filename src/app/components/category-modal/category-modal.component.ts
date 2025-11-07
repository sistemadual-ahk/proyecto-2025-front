// Archivo: category-modal.component.ts
// REEMPLAZA TU ARCHIVO CON ESTE CÓDIGO

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EditableCategory {
  name: string;
  // NUEVA PROPIEDAD
  description: string; 
  // -----------
  icon: string;
  color: string;
  iconColor: string;
}

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.scss',
})
export class CategoryModalComponent implements OnInit {
  @Input() title: string = 'Editar categoría';
  @Input() edit: boolean = false;
  // Actualiza el 'value' por defecto para incluir description
  @Input() value: EditableCategory = { name: '', description: '', icon: '', color: '#E5E7EB', iconColor: '#111827' };
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EditableCategory>();
  @Output() delete = new EventEmitter<void>();

  // Actualiza 'temp' para incluir description
  public temp: EditableCategory = { name: '', description: '', icon: '', color: '#FFFFFF', iconColor: '#000000' };

  // Opciones de íconos (clases de @mdi/font)
  public iconOptions: Array<{ name: string; class: string }> = [
    { name: 'Cartera', class: 'mdi-wallet' },
    { name: 'Comida', class: 'mdi-food' },
    { name: 'Supermercado', class: 'mdi-cart' },
    { name: 'Hogar', class: 'mdi-home' },
    { name: 'Transporte', class: 'mdi-bus' },
    { name: 'Coche', class: 'mdi-car' },
    { name: 'Combustible', class: 'mdi-fuel' },
    { name: 'Salud', class: 'mdi-heart-pulse' },
    { name: 'Medicamentos', class: 'mdi-pill' },
    { name: 'Deporte', class: 'mdi-dumbbell' },
    { name: 'Entretenimiento', class: 'mdi-movie-open' },
    { name: 'Viajes', class: 'mdi-airplane' },
    { name: 'Educación', class: 'mdi-school' },
    { name: 'Teléfono', class: 'mdi-cellphone' },
    { name: 'Internet', class: 'mdi-wifi' },
    { name: 'Regalos', class: 'mdi-gift' },
    { name: 'Ahorro', class: 'mdi-piggy-bank' },
    { name: 'Ingresos', class: 'mdi-cash-plus' },
    { name: 'Gastos', class: 'mdi-cash-minus' },
    { name: 'Tarjeta', class: 'mdi-credit-card' },
    { name: 'Factura', class: 'mdi-receipt' },
    { name: 'Mascotas', class: 'mdi-paw' },
    { name: 'Tecnología', class: 'mdi-laptop' },
    { name: 'Ropa', class: 'mdi-tshirt-crew' },
    { name: 'Belleza', class: 'mdi-lipstick' },
    { name: 'Café', class: 'mdi-coffee' },
    { name: 'Restaurante', class: 'mdi-silverware-fork-knife' },
    { name: 'Impuestos', class: 'mdi-percent' },
    { name: 'Herramientas', class: 'mdi-tools' },
    { name: 'Otro', class: 'mdi-dots-horizontal' },
  ];

  // UI estado para el picker de íconos
  public isIconPickerOpen = false;

  ngOnInit() {
    this.temp = { ...this.value };

    // Si no hay icono seleccionado, establece uno por defecto
    if (!this.temp.icon) {
      this.temp.icon = this.iconOptions[0]?.class || 'mdi-help-circle';
    }
  }

  onClose() { 
    this.close.emit(); 
  }
  
  onSave() { 
    this.save.emit(this.temp); 
  }
  
  onDelete() { 
    this.delete.emit(); 
  }
  // Lista de íconos disponible (sin búsqueda)
  filteredIconOptions(): Array<{ name: string; class: string }> {
    return this.iconOptions;
  }

  // Seleccionar ícono y cerrar el panel
  selectIcon(iconClass: string) {
    this.temp.icon = iconClass;
    this.isIconPickerOpen = false;
  }

  // Nombre legible del ícono actual
  displayNameForIcon(iconClass?: string): string {
    if (!iconClass) return 'Selecciona un ícono';
    const found = this.iconOptions.find(o => o.class === iconClass);
    return found?.name ?? iconClass.replace('mdi-','');
  }

  // Paletas populares de color
  public popularBgColors: string[] = [
    '#F97316', '#22C55E', '#3B82F6', '#EAB308', '#EF4444',
    '#A855F7', '#10B981', '#F59E0B', '#14B8A6', '#6B7280'
  ];
  public popularIconColors: string[] = [
    '#FFFFFF', '#E5E7EB', '#D1D5DB', '#93A3AF', '#111827',
    '#F59E0B', '#22C55E', '#3B82F6', '#A855F7', '#EF4444'
  ];

  // Estado de pickers personalizados
  public showCustomBgPicker = false;
  public showCustomIconPicker = false;

  selectBgColor(color: string) { this.temp.color = color; }
  selectIconColor(color: string) { this.temp.iconColor = color; }
}