import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
    AddAccountModalComponent,
    HeaderComponent,
    SidebarComponent,
    PageTitleComponent,
  ],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
})
export class WalletsComponent implements OnInit {
  // Estado del menú
  isMenuOpen = false;
  showAddAccountModal = false;
  showWalletPopup = false;

  // --- SELECCIÓN ---
  // selectedWallet ahora usa la interfaz Billetera
  selectedWallet: Billetera | null = null;

  // --- DATOS DINÁMICOS ---
  // Inyectamos el servicio
  private billeteraService: BilleteraService = inject(BilleteraService);
  // billeteras (del backend) es AHORA la fuente de datos principal
  billeteras: Billetera[] = [];

  // --- LÓGICA DE ÍCONOS Y COLORES (Movida aquí para ser reutilizable) ---
  private iconByType: Record<'bank' | 'digital' | 'cash', string> = {
    bank: 'mdi-bank',
    digital: 'mdi-credit-card',
    cash: 'mdi-cash-multiple',
  };

  private colorByType: Record<'bank' | 'digital' | 'cash', string> = {
    bank: '#ef4444',
    digital: '#3b82f6',
    cash: '#f59e0b',
  };

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadData();
  }

  /**
   * Carga o recarga las billeteras desde el servicio.
   */
  loadData(): void {
    this.billeteraService.getBilleteras().subscribe(data => {
      this.billeteras = data;
      console.log('Billeteras cargadas:', this.billeteras);
    });
  }

  // --- CÁLCULOS ---
  /**
   * Calcula el balance total sumando las billeteras del backend.
   */
  get totalBalance(): number {
    return this.billeteras.reduce((total, wallet) => total + wallet.balance, 0);
  }

  // --- MÉTODOS DE UI ---
  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }
  goBack() { this.router.navigate(['/home']); }
  openTransferHistory() { console.log('Abrir historial de transferencias'); }
  openNewTransfer() { console.log('Abrir nueva transferencia'); }
  addAccount() { this.showAddAccountModal = true; }
  closeAddAccountModal() { this.showAddAccountModal = false; }

  // --- ACCIONES CRUD (Modificadas para usar el Servicio) ---

  /**
   * Guarda la nueva cuenta llamando al servicio y recarga los datos.
   */
  saveAccount(newAccount: {
    name: string;
    tipo: 'bank' | 'digital' | 'cash';
    provider?: string; // Asumimos que el backend maneja 'provider'
    initialBalance: number;
  }) {

    // 1. Mapea los datos del modal al formato del backend
    // Asumimos que el backend espera 'nombre', 'balance', 'type', y 'color'
    const billeteraParaCrear: Partial<Billetera> = {
      nombre: newAccount.name,
      balance: newAccount.initialBalance,
      tipo: newAccount.tipo,
    };

    // 2. Llama al servicio (asumiendo que tienes 'createBilletera')
    this.billeteraService.createBilletera(billeteraParaCrear).subscribe({
      next: () => {
        console.log('Billetera creada');
        this.loadData(); // Recarga la lista
        this.closeAddAccountModal();
      },
      error: (err) => console.error('Error al crear billetera:', err)
    });
  }

  /**
   * Elimina la billetera seleccionada llamando al servicio y recarga los datos.
   */
  deleteWallet() {
    console.log('Eliminar billetera:', this.selectedWallet?.nombre);
  }

  setAsDefault() {
    console.log('Establecer como predeterminada:', this.selectedWallet?.nombre);
  }

  openWalletPopup(wallet: Billetera) {
    this.selectedWallet = wallet;
    this.showWalletPopup = true;
  }

  closeWalletPopup() {
    this.showWalletPopup = false;
    this.selectedWallet = null;
  }

  openWalletTransfer() { console.log('Abrir transferencia para:', this.selectedWallet?.nombre); }
  openWalletHistory() { console.log('Abrir historial para:', this.selectedWallet?.nombre); }
  openWalletSettings() { console.log('Abrir ajustes para:', this.selectedWallet?.nombre); }
  editWallet() { console.log('Editar billetera:', this.selectedWallet?.nombre); }


  // --- HELPERS (Funciones de ayuda) ---

  /**
   * Obtiene el ícono MDI basado en el tipo de billetera.
   * Tu HTML deberá llamar a esta función: <i [class]="getWalletIcon(billetera.type)"></i>
   */
  getWalletIcon(tipo: 'bank' | 'digital' | 'cash'): string {
    return this.iconByType[tipo] || 'mdi-wallet'; // Devuelve un ícono por defecto
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
