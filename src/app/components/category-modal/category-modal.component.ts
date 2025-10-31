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

  ngOnInit() {
    this.temp = { ...this.value };
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
}