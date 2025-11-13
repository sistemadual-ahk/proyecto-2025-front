import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos la interfaz actualizada (que ahora tiene 'description')
import { CategoryModalComponent, EditableCategory } from '../../components/category-modal/category-modal.component';

interface UiCategory {
  id?: string;
  name: string;
  description: string;
  icon: string; // mdi icon name
  color: string; // background color for the circle
  iconColor: string; // icon color
  isDefault?: boolean; // Para marcar categorías predefinidas
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
  modalCategory: EditableCategory = { name: '', description: '', icon: 'mdi-cash', color: '#E5E7EB', iconColor: '#111827' };

  // Categorías predefinidas de ingresos
  defaultIncomeCategories: UiCategory[] = [
    { 
      id: 'default-salary',
      name: 'Salario', 
      description: 'Sueldo mensual y bonificaciones', 
      icon: 'mdi-cash-plus', 
      color: '#16A34A', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
    { 
      id: 'default-gift',
      name: 'Regalos e Ingresos Extra', 
      description: 'Dinero recibido como regalo', 
      icon: 'mdi-gift', 
      color: '#7C3AED', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
    { 
      id: 'default-investment',
      name: 'Inversiones', 
      description: 'Ganancias de inversiones y dividendos', 
      icon: 'mdi-chart-line', 
      color: '#4F46E5', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
  ];

  // Categorías predefinidas de gastos  
  defaultExpenseCategories: UiCategory[] = [
    { 
      id: 'default-food',
      name: 'Comida y Restaurantes', 
      description: 'Gastos en alimentación, restaurantes y delivery', 
      icon: 'mdi-food', 
      color: '#D97706', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
    { 
      id: 'default-transport',
      name: 'Transporte', 
      description: 'Gastos en transporte público, combustible y estacionamiento', 
      icon: 'mdi-bus', 
      color: '#0891B2', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
    { 
      id: 'default-shopping',
      name: 'Compras y Supermercado', 
      description: 'Compras del hogar, supermercado y productos básicos', 
      icon: 'mdi-cart', 
      color: '#059669', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
    { 
      id: 'default-health',
      name: 'Salud y Medicina', 
      description: 'Gastos médicos, medicamentos y consultas', 
      icon: 'mdi-heart-pulse', 
      color: '#DC2626', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
    { 
      id: 'default-bills',
      name: 'Servicios y Facturas', 
      description: 'Electricidad, agua, gas, internet y telefonía', 
      icon: 'mdi-receipt', 
      color: '#B91C1C', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
    { 
      id: 'default-entertainment',
      name: 'Entretenimiento', 
      description: 'Cine, streaming, juegos y actividades de ocio', 
      icon: 'mdi-movie-open', 
      color: '#7C3AED', 
      iconColor: '#FFFFFF',
      isDefault: true 
    },
  ];

  // Categorías personalizadas del usuario
  customIncomeCategories: UiCategory[] = [];
  customExpenseCategories: UiCategory[] = [];

  setTab(tab: 'Ingreso' | 'Gasto') {
    this.activeTab = tab;
  }

  get categoriesToShow(): UiCategory[] {
    const defaultCategories = this.activeTab === 'Ingreso' ? this.defaultIncomeCategories : this.defaultExpenseCategories;
    const customCategories = this.activeTab === 'Ingreso' ? this.customIncomeCategories : this.customExpenseCategories;
    
    // Primero las categorías por defecto, luego las personalizadas
    return [...defaultCategories, ...customCategories];
  }

  // Método para verificar si una categoría es por defecto
  isCategoryDefault(index: number): boolean {
    const defaultCategoriesCount = this.activeTab === 'Ingreso' 
      ? this.defaultIncomeCategories.length 
      : this.defaultExpenseCategories.length;
    
    return index < defaultCategoriesCount;
  }

  openCreateCategory() {
    this.editMode = false;
    this.editingIndex = null;
    // <-- 4. Añadimos 'description' al crear una nueva categoría
    this.modalCategory = { name: '', description: '', icon: 'mdi-cash', color: '#E5E7EB', iconColor: '#111827' };
    this.showCategoryModal = true;
  }

  openEditCategory(index: number) {
    const isDefault = this.isCategoryDefault(index);
    const cat = this.categoriesToShow[index];
    
    this.editMode = !isDefault; // Solo modo edición si no es por defecto
    this.editingIndex = isDefault ? null : index; // No permitir edición de las por defecto
    
    this.modalCategory = { 
      id: cat.id,
      name: cat.name, 
      description: cat.description,
      icon: cat.icon, 
      color: cat.color, 
      iconColor: cat.iconColor,
      isDefault: cat.isDefault || false
    };
    
    this.showCategoryModal = true;
  }

  saveCategory(value: EditableCategory) {
    // No permitir guardar categorías por defecto
    if (value.isDefault) {
      return;
    }

    const normalizedName = (value.name || '').trim() || 'Nueva categoría';
    const normalizedIcon = (value.icon || '').trim();
    const iconClass = normalizedIcon.startsWith('mdi-') ? normalizedIcon : `mdi-${normalizedIcon}`;
    const description = (value.description || '').trim();
    
    const updated: UiCategory = { 
      id: value.id || `custom-${Date.now()}`,
      name: normalizedName, 
      description: description,
      icon: iconClass, 
      color: value.color, 
      iconColor: value.iconColor,
      isDefault: false
    };

    if (this.activeTab === 'Ingreso') {
      if (this.editingIndex === null) {
        // Agregar nueva categoría personalizada
        this.customIncomeCategories = [...this.customIncomeCategories, updated];
      } else {
        // Editar categoría existente (solo personalizadas)
        const customIndex = this.editingIndex - this.defaultIncomeCategories.length;
        if (customIndex >= 0) {
          this.customIncomeCategories = this.customIncomeCategories.map((c, i) =>
            i === customIndex ? updated : c
          );
        }
      }
    } else {
      if (this.editingIndex === null) {
        // Agregar nueva categoría personalizada
        this.customExpenseCategories = [...this.customExpenseCategories, updated];
      } else {
        // Editar categoría existente (solo personalizadas)
        const customIndex = this.editingIndex - this.defaultExpenseCategories.length;
        if (customIndex >= 0) {
          this.customExpenseCategories = this.customExpenseCategories.map((c, i) =>
            i === customIndex ? updated : c
          );
        }
      }
    }
    this.closeCategoryModal();
  }

  deleteCategory() {
    if (this.editingIndex === null) return;
    
    // No permitir eliminar categorías por defecto
    if (this.isCategoryDefault(this.editingIndex)) {
      return;
    }

    if (this.activeTab === 'Ingreso') {
      const customIndex = this.editingIndex - this.defaultIncomeCategories.length;
      if (customIndex >= 0) {
        this.customIncomeCategories.splice(customIndex, 1);
      }
    } else {
      const customIndex = this.editingIndex - this.defaultExpenseCategories.length;
      if (customIndex >= 0) {
        this.customExpenseCategories.splice(customIndex, 1);
      }
    }
    
    this.closeCategoryModal();
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.editingIndex = null;
  }
}