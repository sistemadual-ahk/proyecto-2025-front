import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos la interfaz actualizada (que ahora tiene 'description')
import { CategoryModalComponent, EditableCategory } from '../../components/category-modal/category-modal.component';

interface UiCategory {
  name: string;
  description: string; // <-- 1. Añadimos 'description' a tu interfaz local
  icon: string; // mdi icon name
  color: string; // background color for the circle
  iconColor: string; // icon color
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, CategoryModalComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  activeTab: 'Ingreso' | 'Gasto' = 'Ingreso';
  showCategoryModal = false;
  editMode = false;
  editingIndex: number | null = null;
  // <-- 2. Actualizamos el valor por defecto de 'modalCategory'
  modalCategory: EditableCategory = { name: '', description: '', icon: 'mdi-cash', color: '#E5E7EB', iconColor: '#111827' };

  // <-- 3. Añadimos 'description' a tus categorías de ejemplo
  incomeCategories: UiCategory[] = [
    { name: 'Salario', description: 'Sueldo mensual', icon: 'mdi-cash', color: '#CFFAEA', iconColor: '#10B981' },
    { name: 'Regalo', description: 'Dinero recibido', icon: 'mdi-gift', color: '#EAFBF3', iconColor: '#34D399' },
    { name: 'Interes', description: 'Ganancias de inversiones', icon: 'mdi-percent', color: '#E5F6FF', iconColor: '#60A5FA' },
  ];

  expenseCategories: UiCategory[] = [
    { name: 'Supermercado', description: 'Compras de almacén', icon: 'mdi-cart', color: '#FFE7EA', iconColor: '#DC2626' },
    { name: 'Comida', description: 'Restaurantes y delivery', icon: 'mdi-silverware-fork-knife', color: '#FFF3D6', iconColor: '#F59E0B' },
    { name: 'Nafta', description: 'Combustible auto', icon: 'mdi-gas-station', color: '#E6F1FF', iconColor: '#2563EB' },
    { name: 'Salud', description: 'Farmacia u hospital', icon: 'mdi-heart-pulse', color: '#FFE7EA', iconColor: '#EF4444' },
    { name: 'Hogar', description: 'Servicios o arreglos', icon: 'mdi-home', color: '#E7F9EB', iconColor: '#22C55E' },
    { name: 'Ocio', description: 'Cine, salidas, etc.', icon: 'mdi-food', color: '#EEF2F6', iconColor: '#111827' }, // (Cambié este duplicado de "Comida" a "Ocio")
  ];

  setTab(tab: 'Ingreso' | 'Gasto') {
    this.activeTab = tab;
  }

  get categoriesToShow(): UiCategory[] {
    return this.activeTab === 'Ingreso' ? this.incomeCategories : this.expenseCategories;
  }

  openCreateCategory() {
    this.editMode = false;
    this.editingIndex = null;
    // <-- 4. Añadimos 'description' al crear una nueva categoría
    this.modalCategory = { name: '', description: '', icon: 'mdi-cash', color: '#E5E7EB', iconColor: '#111827' };
    this.showCategoryModal = true;
  }

  openEditCategory(index: number) {
    this.editMode = true;
    this.editingIndex = index;
    const cat = this.categoriesToShow[index];
    // <-- 5. Pasamos la 'description' existente al modal para editar
    this.modalCategory = { 
        name: cat.name, 
        description: cat.description, // <-- Añadido
        icon: cat.icon, 
        color: cat.color, 
        iconColor: cat.iconColor 
    };
    this.showCategoryModal = true;
  }

  saveCategory(value: EditableCategory) {
    const normalizedName = (value.name || '').trim() || 'Nueva categoría';
    const normalizedIcon = (value.icon || '').trim();
    const iconClass = normalizedIcon.startsWith('mdi-') ? normalizedIcon : `mdi-${normalizedIcon}`;
    // <-- 6. Leemos la 'description' que viene del modal
    const description = (value.description || '').trim();
    
    // <-- 7. Guardamos el objeto actualizado (con 'description')
    const updated = { 
        name: normalizedName, 
        description: description, // <-- Añadido
        icon: iconClass, 
        color: value.color, 
        iconColor: value.iconColor 
    };

    if (this.activeTab === 'Ingreso') {
      if (this.editingIndex === null) {
        this.incomeCategories = [
          ...this.incomeCategories,
          updated,
        ];
      } else {
        this.incomeCategories = this.incomeCategories.map((c, i) =>
          i === this.editingIndex ? updated : c
        );
      }
    } else {
      if (this.editingIndex === null) {
        this.expenseCategories = [
          ...this.expenseCategories,
          updated,
        ];
      } else {
        this.expenseCategories = this.expenseCategories.map((c, i) =>
          i === this.editingIndex ? updated : c
        );
      }
    }
    this.closeCategoryModal();
  }

  deleteCategory() {
    if (this.editingIndex === null) return;
    const list = this.activeTab === 'Ingreso' ? this.incomeCategories : this.expenseCategories;
    list.splice(this.editingIndex, 1);
    this.closeCategoryModal();
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.editingIndex = null;
  }
}