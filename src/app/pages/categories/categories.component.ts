import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../services/category.service';
import { CategoryModalComponent } from '../../components/category-modal/category-modal.component';
import { EditableCategory } from '../../../models/editable-category.model';
import { Categoria } from '../../../models/categoria.model'; // <--- usa tu modelo "bueno"

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
  imports: [CommonModule, CategoryModalComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  defaultIncomeCategories: UiCategory[] = [];
  defaultExpenseCategories: UiCategory[] = [];

  customIncomeCategories: UiCategory[] = [];
  customExpenseCategories: UiCategory[] = [];

  private subscription: Subscription = new Subscription();

  constructor(private categoriasService: CategoryService) {
    this.loadData();
  }

  private loadData(): void {
    this.subscription.add(
      this.categoriasService.getAllCategories().subscribe({
        next: (cat) => {
          console.log('Categorías cargadas:', cat);

          const uiCategories: UiCategory[] = cat.map((c: any) => ({
            id: c._id || c.id,
            name: c.nombre,
            description: c.descripcion || '',
            color: c.color || '#E5E7EB',
            icon: c.icono || 'mdi-cash',
            iconColor: c.iconColor || '#111827',
            isDefault: c.isDefault ?? false,
            type: c.type ?? 'expense',
          }));

          this.defaultIncomeCategories = uiCategories.filter(
            (c) => c.type === 'income'
          );

          this.defaultExpenseCategories = uiCategories.filter(
            (c) => c.type === 'expense'
          );

          console.log('Income categories UI:', this.defaultIncomeCategories);
          console.log('Expense categories UI:', this.defaultExpenseCategories);
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
        },
      })
    );
  }

  activeTab: 'Ingreso' | 'Gasto' = 'Ingreso';
  showCategoryModal = false;
  editMode = false;
  editingIndex: number | null = null;

  modalCategory: EditableCategory = {
    name: '',
    description: '',
    icon: 'mdi-cash',
    color: '#E5E7EB',
    iconColor: '#111827',
  };

  setTab(tab: 'Ingreso' | 'Gasto') {
    this.activeTab = tab;
  }

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

  isCategoryDefault(index: number): boolean {
    const defaultCategoriesCount =
      this.activeTab === 'Ingreso'
        ? this.defaultIncomeCategories.length
        : this.defaultExpenseCategories.length;

    return index < defaultCategoriesCount;
  }

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
    const isDefault = this.isCategoryDefault(index);
    const cat = this.categoriesToShow[index];

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

  saveCategory(value: EditableCategory) {
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

    if (this.editingIndex === null) {
      console.log('Creando categoría...', payload);

      this.categoriasService.createCategory(payload).subscribe({
        next: (created) => {
          console.log('Categoría creada en backend:', created);

          const ui: UiCategory = {
            id: (created as any)._id || created.id,
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

      return;
    }

    const editingDefaultOffset =
      this.activeTab === 'Ingreso'
        ? this.defaultIncomeCategories.length
        : this.defaultExpenseCategories.length;

    const customIndex = this.editingIndex - editingDefaultOffset;
    if (customIndex < 0) {
      console.warn('Intento de editar una categoría default. Ignorado.');
      return;
    }

    const list = this.activeTab === 'Ingreso'
      ? this.customIncomeCategories
      : this.customExpenseCategories;

    const catToUpdate = list[customIndex];
    if (!catToUpdate?.id) {
      console.error('No se encontró el id de la categoría a actualizar');
      return;
    }

    console.log('Actualizando categoría...', catToUpdate.id, payload);

    this.categoriasService.updateCategory(catToUpdate.id, payload).subscribe({
      next: (updated) => {
        console.log('Categoría actualizada en backend:', updated);

        const ui: UiCategory = {
          id: (updated as any)._id || updated.id,
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

  deleteCategory() {
    if (this.editingIndex === null) return;

    if (this.isCategoryDefault(this.editingIndex)) {
      console.warn('No se puede eliminar una categoría default.');
      return;
    }

    const editingDefaultOffset =
      this.activeTab === 'Ingreso'
        ? this.defaultIncomeCategories.length
        : this.defaultExpenseCategories.length;

    const customIndex = this.editingIndex - editingDefaultOffset;
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
