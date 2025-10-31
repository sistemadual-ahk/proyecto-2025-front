import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UiCategory {
  name: string;
  icon: string; // mdi icon name
  color: string; // background color for the circle
  iconColor: string; // icon color
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  activeTab: 'Ingreso' | 'Gasto' = 'Ingreso';

  incomeCategories: UiCategory[] = [
    { name: 'Salario', icon: 'mdi-cash', color: '#CFFAEA', iconColor: '#10B981' },
    { name: 'Regalo', icon: 'mdi-gift', color: '#EAFBF3', iconColor: '#34D399' },
    { name: 'Interes', icon: 'mdi-percent', color: '#E5F6FF', iconColor: '#60A5FA' },
  ];

  expenseCategories: UiCategory[] = [
    { name: 'Supermercado', icon: 'mdi-cart', color: '#FFE7EA', iconColor: '#DC2626' },
    { name: 'Comida', icon: 'mdi-silverware-fork-knife', color: '#FFF3D6', iconColor: '#F59E0B' },
    { name: 'Nafta', icon: 'mdi-gas-station', color: '#E6F1FF', iconColor: '#2563EB' },
    { name: 'Salud', icon: 'mdi-heart-pulse', color: '#FFE7EA', iconColor: '#EF4444' },
    { name: 'Hogar', icon: 'mdi-home', color: '#E7F9EB', iconColor: '#22C55E' },
    { name: 'Comida', icon: 'mdi-food', color: '#EEF2F6', iconColor: '#111827' },
  ];

  setTab(tab: 'Ingreso' | 'Gasto') {
    this.activeTab = tab;
  }

  get categoriesToShow(): UiCategory[] {
    return this.activeTab === 'Ingreso' ? this.incomeCategories : this.expenseCategories;
  }
}


