import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-saving-goals',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  templateUrl: './saving-goals.component.html',
  styleUrl: './saving-goals.component.scss'
})
export class SavingGoalsComponent {
  // Estado del menú
  isMenuOpen = false;
  
  // Datos de los objetivos de ahorro
  savingGoals = [
    {
      id: 1,
      title: 'Viaje a Brasil',
      currentAmount: 1200,
      targetAmount: 3000,
      progress: 40, // 1200/3000 * 100
      color: 'var(--gastify-purple)'
    },
    {
      id: 2,
      title: 'Comprar guitarra',
      currentAmount: 750,
      targetAmount: 1200,
      progress: 62.5, // 750/1200 * 100
      color: 'var(--gastify-green)'
    }
  ];

  // Tips de ahorro
  savingTips = [
    {
      id: 1,
      icon: 'mdi-bell-ring',
      title: 'Intenta ahorrar automáticamente',
      description: 'Programa transferencias periódicas a tus objetivos para alcanzarlos más rápidamente'
    },
    {
      id: 2,
      icon: 'mdi-thought-bubble',
      title: 'Reduce las compras impulsivas',
      description: 'Considera una \'espera de 48 horas\' antes de adquirir objetos no esenciales'
    },
    {
      id: 3,
      icon: 'mdi-help-circle',
      title: 'Desafía tus gastos',
      description: '¿Puedes encontrar una alternativa más barata para ciertos servicios?'
    }
  ];

  constructor(private router: Router) {}

  // Métodos de navegación
  goBack() {
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // Métodos para objetivos
  addNewGoal() {
    console.log('Agregar nuevo objetivo');
  }

  // Métodos para tips
  viewTip(tipId: number) {
    console.log('Ver tip:', tipId);
  }
} 