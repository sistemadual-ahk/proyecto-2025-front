import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { CategoryModalComponent } from '../../components/category-modal/category-modal.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { EditableCategory } from '../../../models/editable-category.model';
import { Categoria } from '../../../models/categoria.model';

interface UiCategory {
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  iconColor?: string;
  isDefault?: boolean;
  type?: 'income' | 'expense';
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, CategoryModalComponent, PageTitleComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  // Categorías globales por tipo
  defaultIncomeCategories: UiCategory[] = [];
  defaultExpenseCategories: UiCategory[] = [];

  // Categorías personalizadas del usuario (también cargadas del backend)
  customIncomeCategories: UiCategory[] = [];
  customExpenseCategories: UiCategory[] = [];

  private subscription: Subscription = new Subscription();

  // Estado de UI
  activeTab: 'Ingreso' | 'Gasto' = 'Ingreso';
  showCategoryModal = false;
  editMode = false;
  editingIndex: number | null = null;

  // Datos que viajan al modal
  modalCategory: EditableCategory = {
    name: '',
    description: '',
    icon: 'mdi-cash',
    color: '#E5E7EB',
    iconColor: '#111827',
  };

  constructor(
    private router: Router,
    private categoriasService: CategoryService
  ) {
    this.loadData();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  // =======================
  //  CARGA DESDE BACKEND
  // =======================
  private loadData(): void {
    this.subscription.add(
      this.categoriasService.getAllCategories().subscribe({
        next: (cat: Categoria[]) => {
          console.log('Categorías cargadas desde backend:', cat);

          // 1) Mapear lo que viene del backend a UiCategory
          const uiCategories: UiCategory[] = cat.map((c: Categoria) => ({
            id: c.id,
            name: c.nombre,
            description: c.descripcion || '',
            color: c.color || '#E5E7EB',
            icon: c.icono || 'mdi-cash',
            iconColor: c.iconColor || '#111827',
            isDefault: c.isDefault ?? false,
            type: c.type ?? 'expense',
          }));

          // 2) Separar por tipo
          const incomeCats = uiCategories.filter((c) => c.type === 'income');
          const expenseCats = uiCategories.filter((c) => c.type === 'expense');

          // 3) Dentro de cada tipo, separar default vs custom
          this.defaultIncomeCategories = incomeCats.filter((c) => c.isDefault);
          this.customIncomeCategories = incomeCats.filter((c) => !c.isDefault);

          this.defaultExpenseCategories = expenseCats.filter((c) => c.isDefault);
          this.customExpenseCategories = expenseCats.filter((c) => !c.isDefault);

          console.log('Income default:', this.defaultIncomeCategories);
          console.log('Income custom:', this.customIncomeCategories);
          console.log('Expense default:', this.defaultExpenseCategories);
          console.log('Expense custom:', this.customExpenseCategories);
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
        },
      })
    );
  }

  // =======================
  //  TABS / LISTAS
  // =======================

  setTab(tab: 'Ingreso' | 'Gasto') {
    this.activeTab = tab;
  }

  // Lista total a mostrar según la pestaña:
  // primero default (no editables), después custom (editables)
  get categoriesToShow(): UiCategory[] {
    const defaultCategories =
      this.activeTab === 'Ingreso'
        ? this.defaultIncomeCategories
        : this.defaultExpenseCategories;

    const customCategories =
      this.activeTab === 'Ingreso'
        ? this.customIncomeCategories
        : this.customExpenseCategories;

    return [...defaultCategories, ...customCategories];
  }

  // Saber si una categoría visible en categoriesToShow es default
  isCategoryDefault(index: number): boolean {
    const cat = this.categoriesToShow[index];
    return !!cat?.isDefault;
  }

  // =======================
  //  MODAL CREAR / EDITAR
  // =======================

  openCreateCategory() {
    this.editMode = false;
    this.editingIndex = null;

    this.modalCategory = {
      name: '',
      description: '',
      icon: 'mdi-cash',
      color: '#E5E7EB',
      iconColor: '#111827',
      isDefault: false,
    };

    this.showCategoryModal = true;
  }

  openEditCategory(index: number) {
    const cat = this.categoriesToShow[index];
    const isDefault = this.isCategoryDefault(index);

    // Si es default → solo lectura (no se puede editar ni borrar)
    this.editMode = !isDefault;
    this.editingIndex = isDefault ? null : index;

    this.modalCategory = {
      id: cat.id,
      name: cat.name ?? '',
      description: cat.description ?? '',
      icon: cat.icon ?? 'mdi-cash',
      color: cat.color ?? '#E5E7EB',
      iconColor: cat.iconColor ?? '#111827',
      isDefault: cat.isDefault,
    };

    this.showCategoryModal = true;
  }

  // =======================
  //  GUARDAR (CREAR / EDITAR)
  // =======================

  saveCategory(value: EditableCategory) {
    // Nunca permitir guardar cambios sobre default
    if (value.isDefault) {
      console.warn('Intento de guardar una categoría default. Ignorado.');
      return;
    }

    const normalizedName = (value.name || '').trim() || 'Nueva categoría';
    const normalizedIcon = (value.icon || '').trim();
    const iconClass = normalizedIcon.startsWith('mdi-')
      ? normalizedIcon
      : `mdi-${normalizedIcon}`;
    const description = (value.description || '').trim();

    const payload: Partial<Categoria> = {
      nombre: normalizedName,
      descripcion: description,
      icono: iconClass,
      color: value.color,
      iconColor: value.iconColor,
      isDefault: false,
      type: this.activeTab === 'Ingreso' ? 'income' : 'expense',
    };

    // 👇 Si no hay editingIndex → estamos creando
    if (this.editingIndex === null) {
      console.log('Creando categoría...', payload);

      this.categoriasService.createCategory(payload).subscribe({
        next: (created: Categoria) => {
          console.log('Categoría creada en backend:', created);

          const ui: UiCategory = {
            id: created.id || created.id,
            name: created.nombre,
            description: created.descripcion,
            icon: created.icono,
            color: created.color,
            iconColor: created.iconColor,
            isDefault: created.isDefault,
            type: created.type,
          };

          if (ui.type === 'income') {
            this.customIncomeCategories = [...this.customIncomeCategories, ui];
          } else {
            this.customExpenseCategories = [...this.customExpenseCategories, ui];
          }

          this.closeCategoryModal();
        },
        error: (err) => {
          console.error('Error al crear categoría:', err);
        },
      });

      return; // importante
    }

    // 👇 Si hay editingIndex → queremos EDITAR una categoría CUSTOM
    const defaultCount =
      this.activeTab === 'Ingreso'
        ? this.defaultIncomeCategories.length
        : this.defaultExpenseCategories.length;

    // Restamos las default para obtener el índice dentro del array de custom
    const customIndex = this.editingIndex - defaultCount;
    if (customIndex < 0) {
      console.warn('Intento de editar una categoría default. Ignorado.');
      return;
    }

    const list =
      this.activeTab === 'Ingreso'
        ? this.customIncomeCategories
        : this.customExpenseCategories;

    const catToUpdate = list[customIndex];
    if (!catToUpdate?.id) {
      console.error('No se encontró el id de la categoría a actualizar');
      return;
    }

    console.log('Actualizando categoría...', catToUpdate.id, payload);

    this.categoriasService.updateCategory(catToUpdate.id, payload).subscribe({
      next: (updated: Categoria) => {
        console.log('Categoría actualizada en backend:', updated);

        const ui: UiCategory = {
          id: updated.id || updated.id,
          name: updated.nombre,
          description: updated.descripcion,
          icon: updated.icono,
          color: updated.color,
          iconColor: updated.iconColor,
          isDefault: updated.isDefault,
          type: updated.type,
        };

        if (this.activeTab === 'Ingreso') {
          this.customIncomeCategories = this.customIncomeCategories.map(
            (c, i) => (i === customIndex ? ui : c)
          );
        } else {
          this.customExpenseCategories = this.customExpenseCategories.map(
            (c, i) => (i === customIndex ? ui : c)
          );
        }

        this.closeCategoryModal();
      },
      error: (err) => {
        console.error('Error al actualizar categoría:', err);
      },
    });
  }

  // =======================
  //  ELIMINAR
  // =======================

  deleteCategory() {
    if (this.editingIndex === null) return;

    // Por si acaso: seguridad extra, no borrar default
    if (this.isCategoryDefault(this.editingIndex)) {
      console.warn('No se puede eliminar una categoría default.');
      return;
    }

    const defaultCount =
      this.activeTab === 'Ingreso'
        ? this.defaultIncomeCategories.length
        : this.defaultExpenseCategories.length;

    const customIndex = this.editingIndex - defaultCount;
    if (customIndex < 0) return;

    const list =
      this.activeTab === 'Ingreso'
        ? this.customIncomeCategories
        : this.customExpenseCategories;

    const catToDelete = list[customIndex];

    if (!catToDelete?.id) {
      console.error('No se encontró id para eliminar categoría');
      return;
    }

    console.log('Eliminando categoría...', catToDelete.id);

    this.categoriasService.deleteCategory(catToDelete.id).subscribe({
      next: () => {
        if (this.activeTab === 'Ingreso') {
          this.customIncomeCategories = this.customIncomeCategories.filter(
            (_c, i) => i !== customIndex
          );
        } else {
          this.customExpenseCategories = this.customExpenseCategories.filter(
            (_c, i) => i !== customIndex
          );
        }
        this.closeCategoryModal();
      },
      error: (err) => {
        console.error('Error al eliminar categoría:', err);
      },
    });
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
    this.editingIndex = null;
    this.editMode = false;
  }
}
