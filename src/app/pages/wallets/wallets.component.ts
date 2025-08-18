import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss'
})
export class WalletsComponent {
  // Estado del menú
  isMenuOpen = false;
  
  // Datos de las billeteras
  wallets = [
    {
      id: 1,
      name: 'Principal',
      type: 'bank',
      icon: 'mdi-wallet',
      iconColor: 'var(--gastify-green)',
      balance: 1250000,
      isDefault: true
    },
    {
      id: 2,
      name: 'Mercado Pago',
      type: 'digital',
      icon: 'mdi-credit-card',
      iconColor: '#3b82f6',
      balance: 150000
    },
    {
      id: 3,
      name: 'Banco Santander',
      type: 'bank',
      icon: 'mdi-bank',
      iconColor: '#ef4444',
      balance: 180000
    },
    {
      id: 4,
      name: 'Efectivo',
      type: 'cash',
      icon: 'mdi-cash-multiple',
      iconColor: '#f59e0b',
      balance: 43000
    }
  ];

  // Calcular total
  get totalBalance(): number {
    return this.wallets.reduce((total, wallet) => total + wallet.balance, 0);
  }

  constructor(private router: Router) {}

  // Métodos para el menú
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // Navegación
  goBack() {
    this.router.navigate(['/home']);
  }

  // Acciones de billeteras
  openTransferHistory() {
    console.log('Abrir historial de transferencias');
  }

  openNewTransfer() {
    console.log('Abrir nueva transferencia');
  }

  addAccount() {
    console.log('Agregar nueva cuenta');
  }

  // Métodos del sidebar
  openProfile() {
    console.log('Abrir perfil');
  }

  openHome() {
    this.router.navigate(['/home']);
  }

  openWallets() {
    console.log('Ya estamos en billeteras');
  }

  openActivity() {
    console.log('Abrir actividad');
  }

  openAnalysis() {
    console.log('Abrir análisis');
  }

  openGoals() {
    this.router.navigate(['/saving-goals']);
  }

  openCategories() {
    console.log('Abrir categorías');
  }

  openSettings() {
    console.log('Abrir ajustes');
  }

  logout(): void {
    console.log('Logout');
    this.router.navigate(['/']);
  }

  // Métodos del header
  openNotifications() {
    console.log('Abrir notificaciones');
  }

  openUserProfile() {
    console.log('Abrir perfil de usuario');
  }

  // Formatear números
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

