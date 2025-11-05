import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AddAccountModalComponent } from '../../components/add-account-modal/add-account-modal.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { BilleteraService, Billetera } from '../../services/billetera.service';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAccountModalComponent,
    HeaderComponent,
    SidebarComponent,
    PageTitleComponent,
  ],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
})
export class WalletsComponent implements OnInit {
  private subscription = new Subscription();
  // Estado del menú
  isMenuOpen = false;
  showAddAccountModal = false;
  showWalletPopup = false;
  showTransferModal = false;
  showTransferHistory = false;
  transferMode: 'from' | 'to' = 'from';
  transferForm = {
    originId: '',
    originAmount: 0,
    destinationId: '',
    destinationAmount: 0,
  };
  selectedWallet: any = null;

  billeteras: Billetera[] = [];
  billeterasCargadas: any[] = [];
  totalBalanceLoaded: number = 0;
  
  // Datos de las billeteras
  wallets = [
    {
      id: 1,
      nombre: 'Principal',
      type: 'bank',
      icon: 'mdi-wallet',
      color: 'var(--gastify-green)',
      balance: 1250000,
      ingresosHistoricos: 2600000,
      gastosHistoricos: 1350000,
      isDefault: true,
    },
    {
      id: 2,
      nombre: 'Mercado Pago',
      type: 'digital',
      icon: 'mdi-credit-card',
      color: '#3b82f6',
      balance: 150000,
      ingresosHistoricos: 450000,
      gastosHistoricos: 300000,
    },
    {
      id: 3,
      nombre: 'Banco Santander',
      type: 'bank',
      icon: 'mdi-bank',
      color: '#ef4444',
      balance: 180000,
      ingresosHistoricos: 800000,
      gastosHistoricos: 620000,
    },
    {
      id: 4,
      nombre: 'Efectivo',
      type: 'cash',
      icon: 'mdi-cash-multiple',
      color: '#f59e0b',
      balance: 43000,
      ingresosHistoricos: 90000,
      gastosHistoricos: 47000,
    },
  ];

  constructor(
  private router: Router,
  private billeteraService: BilleteraService
  ) { }

  // Método de inicialización
  ngOnInit(): void {
    this.loadData();
  }

  private loadBilleteras(): void {
    const billeteras = this.billeteras;

    this.billeterasCargadas = billeteras.map((bill) => ({
      id: bill.id,
      type: bill.type,
      category: bill.balance,
      icon: "hola",
      nombre: bill.nombre,
      balance: bill.balance,
      color: bill.color || '#000000',
      isDefault: bill.isDefault || false
    }));
  }

  // Cargar datos
  private loadData(): void {
    this.subscription.add(
      this.billeteraService.getBilleteras().subscribe({
        next: (bill) => {
          this.billeteras = bill;
          this.loadBilleteras();
          this.totalBalanceLoaded = this.billeteras.reduce((total, wallet) => total + wallet.balance, 0);
        },
        error: (error) => {
          console.error('Error al cargar egresos:', error);
        },
      })
    )
  }
  
  // Calcular total
  get totalBalance(): number {
    return this.wallets.reduce((total, wallet) => total + wallet.balance, 0);
  }

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
    this.openTransfer('from');
  }

  addAccount() {
    this.showAddAccountModal = true;
  }

  closeAddAccountModal() {
    this.showAddAccountModal = false;
  }

  saveAccount(newAccount: {
    name: string;
    type: 'bank' | 'digital' | 'cash';
    provider?: string;
    initialBalance: number;
  }) {
    const iconByType: Record<'bank' | 'digital' | 'cash', string> = {
      bank: 'mdi-bank',
      digital: 'mdi-credit-card',
      cash: 'mdi-cash-multiple',
    };
    const colorByType: Record<'bank' | 'digital' | 'cash', string> = {
      bank: '#ef4444',
      digital: '#3b82f6',
      cash: '#f59e0b',
    };

    this.showAddAccountModal = false;
    console.log("Nueva billetera creada");
    this.loadData();
  }

  // Métodos del popup de billetera
  openWalletPopup(wallet: any) {
    this.selectedWallet = wallet;
    this.showWalletPopup = true;
  }

  closeWalletPopup() {
    this.showWalletPopup = false;
    this.selectedWallet = null;
  }

  openWalletTransfer() {
    this.openTransfer('from');
  }

  openWalletHistory() {
    this.showTransferHistory = true;
    // Si hay backend de operaciones, podríamos cargar aquí
    // Por ahora, se muestra modal y se podría integrar OperacionService
  }

  openWalletSettings() {
    this.openTransfer('to');
  }

  setAsDefault() {
    if (this.selectedWallet) {
      const updateData = { isDefault: true };

      this.billeteraService.patchBilletera(this.selectedWallet.id, updateData).subscribe({
        next: (response) => {
          console.log('Billetera actualizada a predeterminada:', response);
          this.loadData();
          this.closeWalletPopup();
        },
        error: (err) => {
          console.error('Error al actualizar la billetera:', err);
        }
      });
    }
  }

  editWallet() {
    console.log('Editar billetera:', this.selectedWallet?.name);
    // Aquí puedes implementar la lógica para editar la billetera
  }

  deleteWallet() {
    if (this.selectedWallet && confirm('¿Estás seguro de que quieres eliminar esta billetera?')) {
      const index = this.billeterasCargadas.findIndex((w) => w.id === this.selectedWallet.id);
      console.log("Billetera eliminada: ", this.selectedWallet);
      console.log(this.selectedWallet.id);
      this.billeteraService.deleteBilletera(this.selectedWallet.id).subscribe({
          next: (response) => {
            console.log('Billetera eliminada exitosamente:', response);
            this.loadData();
            this.billeterasCargadas.splice(index, 1);
            this.closeWalletPopup();  
          },
          error: (err) => {
            // 3. Error: Mostrar un error en la consola
            console.error('Error al eliminar billetera:', err);
          }
        });
    }
  }

  getWalletTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      bank: 'Cuenta bancaria',
      digital: 'Billetera digital',
      cash: 'Efectivo',
    };
    return typeLabels[type] || type;
  }

  getLastUpdate(): string {
    return new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // Formatear números
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // --- Transfer modal helpers ---
  openTransfer(mode: 'from' | 'to') {
    this.transferMode = mode;
    // Preseleccionar origen/destino con la billetera actual
    const currentId = this.selectedWallet?.id ?? this.billeteras[0]?.id ?? this.wallets[0]?.id;
    if (mode === 'from') {
      this.transferForm.originId = currentId;
      this.transferForm.destinationId = '';
    } else {
      this.transferForm.destinationId = currentId;
      this.transferForm.originId = '';
    }
    this.transferForm.originAmount = 0;
    this.transferForm.destinationAmount = 0;
    this.showTransferModal = true;
  }

  closeTransferModal() {
    this.showTransferModal = false;
  }

  submitTransfer() {
    // Aquí podríamos llamar a un endpoint de transferencia si existiera
    console.log('Transferencia enviada:', this.transferMode, this.transferForm);
    this.showTransferModal = false;
  }

  closeTransferHistory() {
    this.showTransferHistory = false;
  }
}
