import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // Hacer Math disponible en el template
  Math = Math;

  // Datos del dashboard
  currentMonth = 'Junio 2025';
  income = 0;
  expenses = 4500;
  availableBalance = 37300;
  balanceChange = '+$200 vs mes anterior';

  // Movimientos recientes
  recentMovements = [
    {
      id: 1,
      type: 'expense',
      category: 'Supermercado',
      icon: 'mdi-cart',
      amount: -4500,
      date: 'Hoy, 14:30',
      color: '#FF6B6B'
    },
    {
      id: 2,
      type: 'income',
      category: 'Salario',
      icon: 'mdi-cash',
      amount: 45000,
      date: '28 Nov, 09:00',
      color: '#51CF66'
    },
    {
      id: 3,
      type: 'expense',
      category: 'Combustible',
      icon: 'mdi-gas-station',
      amount: -3200,
      date: 'Ayer, 08:15',
      color: '#74C0FC'
    }
  ];

  // Métodos para navegación
  previousMonth() {
    // Lógica para mes anterior
    console.log('Mes anterior');
  }

  nextMonth() {
    // Lógica para mes siguiente
    console.log('Mes siguiente');
  }

  // Métodos para acciones
  openMenu() {
    console.log('Abrir menú');
  }

  openNotifications() {
    console.log('Abrir notificaciones');
  }

  openProfile() {
    console.log('Abrir perfil');
  }

  viewAllMovements() {
    console.log('Ver todos los movimientos');
  }

  // Métodos para botones inferiores
  openGoals() {
    console.log('Abrir objetivos');
  }

  openAnalysis() {
    console.log('Abrir análisis');
  }

  addTransaction() {
    console.log('Agregar transacción');
  }
} 