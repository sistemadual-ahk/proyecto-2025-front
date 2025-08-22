import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss'
})
export class ActivityComponent {
  // Datos de ejemplo para las transacciones
  transactions = [
    {
      id: 1,
      type: 'expense',
      amount: 2500,
      description: 'Supermercado Carrefour',
      category: 'Alimentación',
      subcategory: 'Supermercado',
      wallet: 'Mercado Pago',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 2,
      type: 'income',
      amount: 150000,
      description: 'Salario Enero',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '09:00'
    },
    {
      id: 3,
      type: 'expense',
      amount: 800,
      description: 'Combustible Shell',
      category: 'Transporte',
      subcategory: 'Combustible',
      wallet: 'Mercado Pago',
      date: '2024-01-14',
      time: '18:45'
    },
    {
      id: 4,
      type: 'expense',
      amount: 1200,
      description: 'Almuerzo McDonald\'s',
      category: 'Alimentación',
      subcategory: 'Restaurante',
      wallet: 'Uala',
      date: '2024-01-14',
      time: '13:15'
    },
    {
      id: 5,
      type: 'expense',
      amount: 3500,
      description: 'Netflix',
      category: 'Entretenimiento',
      subcategory: 'Streaming',
      wallet: 'Santander',
      date: '2024-01-13',
      time: '20:00'
    },
    {
      id: 6,
      type: 'income',
      amount: 25000,
      description: 'Freelance Diseño',
      category: 'Ingresos',
      subcategory: 'Freelance',
      wallet: 'Mercado Pago',
      date: '2024-01-13',
      time: '16:30'
    }
  ];

  // Función para formatear la fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }

  // Función para obtener el ícono de la categoría
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Alimentación': 'mdi-food',
      'Transporte': 'mdi-car',
      'Entretenimiento': 'mdi-movie',
      'Salud': 'mdi-medical-bag',
      'Educación': 'mdi-school',
      'Vivienda': 'mdi-home',
      'Ingresos': 'mdi-cash-plus',
      'Otros': 'mdi-dots-horizontal'
    };
    return icons[category] || 'mdi-dots-horizontal';
  }

  // Función para obtener el color de la categoría
  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Alimentación': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Entretenimiento': '#45B7D1',
      'Salud': '#96CEB4',
      'Educación': '#FFEAA7',
      'Vivienda': '#DDA0DD',
      'Ingresos': '#3DCD99',
      'Otros': '#A8A8A8'
    };
    return colors[category] || '#A8A8A8';
  }
}
