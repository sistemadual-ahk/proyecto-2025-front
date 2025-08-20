import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddAccountModalComponent } from '../../components/add-account-modal/add-account-modal.component';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule, AddAccountModalComponent],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss'
})
export class WalletsComponent {
  // Estado del menú
  isMenuOpen = false;
  showAddAccountModal = false;
  
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
    this.showAddAccountModal = true;
  }

  closeAddAccountModal() {
    this.showAddAccountModal = false;
  }

  saveAccount(newAccount: { name: string; type: 'bank' | 'digital' | 'cash'; provider?: string; initialBalance: number; }) {
    const iconByType: Record<'bank' | 'digital' | 'cash', string> = {
      bank: 'mdi-bank',
      digital: 'mdi-credit-card',
      cash: 'mdi-cash-multiple'
    };
    const colorByType: Record<'bank' | 'digital' | 'cash', string> = {
      bank: '#ef4444',
      digital: '#3b82f6',
      cash: '#f59e0b'
    };

    this.wallets.unshift({
      id: this.wallets.length + 1,
      name: newAccount.name,
      type: newAccount.type,
      icon: iconByType[newAccount.type],
      iconColor: colorByType[newAccount.type],
      balance: newAccount.initialBalance,
      isDefault: false
    });

    this.showAddAccountModal = false;
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

