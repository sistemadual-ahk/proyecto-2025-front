import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss'
})
export class ActivityComponent {
  constructor(private router: Router) {}

  // Estado del menú
  isMenuOpen = false;

  // Datos de ejemplo para las transacciones (igual a la imagen)
  transactions = [
    {
      id: 1,
      type: 'expense',
      amount: 4500,
      description: 'Supermercado',
      category: 'Alimentación',
      subcategory: 'Supermercado',
      wallet: 'Mercado Pago',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 2,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 3,
      type: 'expense',
      amount: 3200,
      description: 'Combustible',
      category: 'Transporte',
      subcategory: 'Combustible',
      wallet: 'Mercado Pago',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 4,
      type: 'expense',
      amount: 4500,
      description: 'Supermercado',
      category: 'Alimentación',
      subcategory: 'Supermercado',
      wallet: 'Mercado Pago',
      date: '2024-01-14',
      time: '08:15'
    },
    {
      id: 5,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-14',
      time: '08:15'
    },
    {
      id: 6,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-11-28',
      time: '09:00'
    },
    {
      id: 7,
      type: 'expense',
      amount: 3200,
      description: 'Combustible',
      category: 'Transporte',
      subcategory: 'Combustible',
      wallet: 'Mercado Pago',
      date: '2024-11-28',
      time: '09:00'
    },
    {
      id: 8,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 9,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 10,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id:11,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 12,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '14:30'
    },
    {
      id: 13,
      type: 'income',
      amount: 45000,
      description: 'Salario',
      category: 'Ingresos',
      subcategory: 'Salario',
      wallet: 'Santander',
      date: '2024-01-15',
      time: '14:30'
    },
         {
       id: 14,
       type: 'income',
       amount: 45000,
       description: 'Salario',
       category: 'Ingresos',
       subcategory: 'Salario',
       wallet: 'Santander',
       date: '2024-01-15',
       time: '14:30'
     },
     {
       id: 15,
       type: 'expense',
       amount: 1500,
       description: 'Café',
       category: 'Alimentación',
       subcategory: 'Café',
       wallet: 'Mercado Pago',
       date: '2024-01-13',
       time: '09:15'
     },
     {
       id: 16,
       type: 'expense',
       amount: 800,
       description: 'Almuerzo',
       category: 'Alimentación',
       subcategory: 'Restaurante',
       wallet: 'Mercado Pago',
       date: '2024-01-13',
       time: '12:30'
     },
     {
       id: 17,
       type: 'expense',
       amount: 2500,
       description: 'Uber',
       category: 'Transporte',
       subcategory: 'Taxi',
       wallet: 'Mercado Pago',
       date: '2024-01-12',
       time: '18:45'
     },
     {
       id: 18,
       type: 'expense',
       amount: 1200,
       description: 'Farmacia',
       category: 'Salud',
       subcategory: 'Medicamentos',
       wallet: 'Mercado Pago',
       date: '2024-01-12',
       time: '16:20'
     },
     {
       id: 19,
       type: 'expense',
       amount: 3500,
       description: 'Cine',
       category: 'Entretenimiento',
       subcategory: 'Cine',
       wallet: 'Mercado Pago',
       date: '2024-01-11',
       time: '20:00'
     },
     {
       id: 20,
       type: 'expense',
       amount: 1800,
       description: 'Cena',
       category: 'Alimentación',
       subcategory: 'Restaurante',
       wallet: 'Mercado Pago',
       date: '2024-01-11',
       time: '21:30'
     }
  ];

  // Getter para transacciones agrupadas por fecha
  get groupedTransactions() {
    const groups: { [key: string]: any[] } = {};
    
    this.transactions.forEach(transaction => {
      const dateKey = this.formatDate(transaction.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.keys(groups)
      .map(date => ({
        date: date,
        transactions: groups[date]
      }))
      .sort((a, b) => {
        const dateA = new Date(this.transactions.find(t => this.formatDate(t.date) === a.date)?.date || '');
        const dateB = new Date(this.transactions.find(t => this.formatDate(t.date) === b.date)?.date || '');
        return dateB.getTime() - dateA.getTime();
      });
  }

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

  // Métodos para el menú
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout(): void {
    console.log('Logout');
    this.router.navigate(['/']);
  }

  // Métodos para acciones
  openNotifications() {
    console.log('Abrir notificaciones');
  }

  openProfile() {
    console.log('Abrir perfil');
  }

  // Métodos para navegación
  openGoals() {
    console.log('Abrir objetivos');
    this.router.navigate(['/saving-goals']);
  }

  openWallets() {
    console.log('Abrir billeteras');
    this.router.navigate(['/wallets']);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
