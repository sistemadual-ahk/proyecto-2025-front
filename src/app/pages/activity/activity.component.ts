import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionService, Transaction } from '../../services/transaction.service';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss'
})
export class ActivityComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private transactionService: TransactionService
  ) {}

  // Estado del menú
  isMenuOpen = false;

  // Suscripciones
  private subscription = new Subscription();

  // Transacciones agrupadas
  groupedTransactions: { date: string; transactions: Transaction[] }[] = [];

  ngOnInit(): void {
    this.loadTransactions();
    this.subscribeToTransactions();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadTransactions(): void {
    // Cargar transacciones agrupadas
    this.groupedTransactions = this.transactionService.getGroupedTransactions();
  }

  private subscribeToTransactions(): void {
    // Suscribirse a cambios en las transacciones
    this.subscription.add(
      this.transactionService.transactions$.subscribe(() => {
        this.groupedTransactions = this.transactionService.getGroupedTransactions();
      })
    );
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
    // Agregar clase de transición antes de navegar
    document.body.classList.add('page-transition');
    
    setTimeout(() => {
      this.router.navigate(['/home']);
      // Remover la clase después de la navegación
      setTimeout(() => {
        document.body.classList.remove('page-transition');
      }, 300);
    }, 150);
  }
}
