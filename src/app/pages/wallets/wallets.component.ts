import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AddAccountModalComponent } from '../../components/add-account-modal/add-account-modal.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { BilleteraService } from '../../services/billetera.service';
import { Billetera } from '../../../models/billetera.model';
import { MatSelectModule } from '@angular/material/select';
type WalletType = 'bank' | 'digital' | 'cash';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAccountModalComponent,
    PageTitleComponent,
    MatSelectModule,
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
  showEditWalletModal = false;
  transferHistory: {
    id: string;
    fromId: string;
    toId: string;
    from: string;
    to: string;
    amount: number;
    currency: 'ARS';
    date: string;
    status: 'Completada' | 'Pendiente';
  }[] = [];
  transferHistoryView:
    | {
      id: string;
      fromId: string;
      toId: string;
      from: string;
      to: string;
      amount: number;
      currency: 'ARS';
      date: string;
      status: 'Completada' | 'Pendiente';
    }[]
    | [] = [];
  transferMode: 'from' | 'to' = 'from';
  transferForm = {
    originId: '',
    originAmount: null as number | null,
    destinationId: '',
    destinationAmount: null as number | null,
  };
  selectedWallet: any = null;
  walletToEdit: Billetera | null = null;
  addAccountMode: 'create' | 'edit' = 'create';

  billeteras: Billetera[] = [];
  billeterasCargadas: any[] = [];
  totalBalanceLoaded: number = 0;
  isSavingWallet = false;
  readonly defaultWalletColor = 'linear-gradient(135deg, #667EEA, #764BA2)';
  private walletTypeOverrides: Record<string, WalletType> = {};
  private readonly walletTypeOverridesKey = 'walletTypeOverrides';
  editWalletForm: {
    id: string | number | null;
    nombre: string;
    balance: number | null;
    type: WalletType;
    proveedor: string;
    moneda: string;
    color: string;
  } = {
      id: null,
      nombre: '',
      balance: null,
      type: 'bank',
      proveedor: '',
      moneda: 'ARS',
      color: this.defaultWalletColor,
    };
  walletTypeOptions = [
    { value: 'bank', label: 'Cuenta bancaria' },
    { value: 'digital', label: 'Billetera digital' },
    { value: 'cash', label: 'Efectivo' },
  ];
  walletTypeIcons: Record<WalletType, string> = {
    bank: 'mdi-bank',
    digital: 'mdi-credit-card',
    cash: 'mdi-cash-multiple',
  };
  providersByType: Record<WalletType, string[]> = {
    bank: ['BBVA', 'Galicia', 'Macro', 'Provincia', 'Santander'],
    digital: ['Mercado Pago', 'Naranja X', 'Uala'],
    cash: ['Efectivo'],
  };
  colorOptions: { gradient: string }[] = [
    { gradient: this.defaultWalletColor },
    { gradient: 'linear-gradient(135deg, #009EE3, #0078BE)' },
    { gradient: 'linear-gradient(135deg, #EC0000, #CC0000)' },
    { gradient: 'linear-gradient(135deg, #51CF66, #40C057)' },
    { gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
    { gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
    { gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' },
    { gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)' },
  ];
  get editProviders(): string[] {
    return (this.providersByType[this.editWalletForm.type] || []).sort((a, b) => a.localeCompare(b));
  }

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
    this.loadWalletTypeOverrides();
    this.loadData();
  }

  private loadBilleteras(): void {
    const billeteras = this.billeteras;

    this.billeterasCargadas = billeteras.map((bill) => ({
      id: this.getWalletId(bill),
      type: bill.type,
      category: bill.balance,
      icon: bill.icon || this.walletTypeIcons[(bill.type as WalletType) || 'bank'],
      nombre: bill.nombre,
      balance: bill.balance,
      ingresoHistorico: bill.ingresoHistorico || 0,
      gastoHistorico: bill.gastoHistorico || 0,
      color: bill.color || '#000000',
      isDefault: bill.isDefault || false
    }));
  }

  // Cargar datos
  private loadData(): void {
    this.subscription.add(
      this.billeteraService.getBilleteras().subscribe({
        next: (bill) => {
          this.billeteras = bill.map((wallet) => this.normalizeWallet(wallet));
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

  get totalBalanceARS(): number {
    return this.billeteras.reduce((total, wallet) => total + wallet.balance, 0);
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
    this.loadTransferHistory();
    if (!this.selectedWallet && this.billeteras.length) {
      this.selectedWallet = this.withWalletIcon(this.billeteras[0]);
    }
    this.showTransferHistory = true;
  }

  openNewTransfer() {
    this.openTransfer('from');
  }

  addAccount() {
    this.addAccountMode = 'create';
    this.walletToEdit = null;
    this.closeWalletPopup();
    this.showAddAccountModal = true;
  }

  closeAddAccountModal() {
    this.showAddAccountModal = false;
    this.addAccountMode = 'create';
    this.walletToEdit = null;
  }

  handleAccountSaved(event: { wallet: Billetera; type: WalletType; mode: 'create' | 'edit'; payload: Partial<Billetera> }) {
    const walletId = this.getWalletId(event.wallet);
    this.showAddAccountModal = false;
    this.addAccountMode = 'create';
    this.walletToEdit = null;
    this.setWalletTypeOverride(walletId, event.type);

    if (event.mode === 'edit') {
      if (!walletId) {
        console.error('No se pudo determinar el ID de la billetera para editar.');
        return;
      }
      this.isSavingWallet = true;
      this.billeteraService.updateBilletera(walletId, event.payload).subscribe({
        next: () => {
          this.isSavingWallet = false;
          console.log('Billetera actualizada');
          this.loadData();
        },
        error: (err) => {
          this.isSavingWallet = false;
          console.error('Error al actualizar la billetera:', err);
        }
      });
    } else {
      console.log('Nueva billetera creada');
      this.loadData();
    }
  }

  // Métodos del popup de billetera
  openWalletPopup(wallet: any) {
    // Asegurarnos de usar la versión más reciente de la billetera (si está en el arreglo cargado)
    const synced = this.billeteras.find(
      (w) => this.getWalletId(w) === this.getWalletId(wallet)
    );
    this.selectedWallet = this.withWalletIcon(synced || wallet);
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
    this.loadTransferHistory();
    if (!this.selectedWallet && this.billeteras.length) {
      this.selectedWallet = this.withWalletIcon(this.billeteras[0]);
    }
    this.transferHistoryView = this.filterHistoryForSelected();
    this.showTransferHistory = true;
  }

  openWalletSettings() {
    this.openTransfer('to');
  }

  private withWalletIcon(wallet: Billetera): Billetera {
    const overrideType = this.getWalletTypeOverride(wallet.id);
    const walletType = overrideType || this.resolveWalletType(wallet.type as string);
    const walletIcon = this.normalizeIcon(wallet.icon || this.walletTypeIcons[walletType]);
    return {
      ...wallet,
      type: walletType,
      moneda: 'ARS',
      icon: walletIcon,
    };
  }

  private resolveWalletType(type?: string | null): WalletType {
    const normalized = (type || '').toString().trim().toLowerCase();
    if (normalized === 'digital') {
      return 'digital';
    }
    if (normalized === 'cash' || normalized === 'efectivo') {
      return 'cash';
    }
    return 'bank';
  }

  private normalizeIcon(icon?: string | null): string {
    if (!icon || !icon.trim()) {
      return 'mdi mdi-wallet';
    }
    const trimmed = icon.trim();
    if (trimmed.startsWith('mdi ')) {
      return trimmed;
    }
    if (trimmed.startsWith('mdi-')) {
      return `mdi ${trimmed}`;
    }
    return `mdi ${trimmed}`;
  }

  private getWalletTypeOverride(id?: string | number | null): WalletType | undefined {
    if (id === null || id === undefined) {
      return undefined;
    }
    return this.walletTypeOverrides[String(id)];
  }

  private setWalletTypeOverride(id: string | number | null | undefined, type: WalletType) {
    if (id === null || id === undefined) {
      return;
    }
    this.walletTypeOverrides[String(id)] = type;
    this.persistWalletTypeOverrides();
  }

  private loadWalletTypeOverrides() {
    if (!this.canUseLocalStorage()) {
      this.walletTypeOverrides = {};
      return;
    }
    try {
      const stored = window.localStorage.getItem(this.walletTypeOverridesKey);
      this.walletTypeOverrides = stored ? JSON.parse(stored) : {};
    } catch {
      this.walletTypeOverrides = {};
    }
  }

  private persistWalletTypeOverrides() {
    if (!this.canUseLocalStorage()) {
      return;
    }
    try {
      window.localStorage.setItem(
        this.walletTypeOverridesKey,
        JSON.stringify(this.walletTypeOverrides)
      );
    } catch {
      // Ignorar errores de almacenamiento
    }
  }

  private canUseLocalStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  private getWalletId(wallet: any): string {
    if (!wallet) return '';
    return (
      (wallet.id && wallet.id.toString()) ||
      (wallet._id && wallet._id.toString()) ||
      ''
    );
  }

  private getWalletCurrencyValue(wallet: Partial<Billetera>): 'ARS' {
    return 'ARS';
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

  setEditWalletType(type: WalletType) {
    this.editWalletForm.type = type;
    if (type === 'cash') {
      this.editWalletForm.proveedor = 'Efectivo';
    } else if (!this.editProviders.includes(this.editWalletForm.proveedor)) {
      this.editWalletForm.proveedor = this.editProviders[0] ?? '';
    }
  }

  selectEditWalletColor(gradient: string) {
    this.editWalletForm.color = gradient;
  }

  private ensureColorOption(color: string | undefined) {
    if (!color) {
      return;
    }
    const exists = this.colorOptions.some((option) => option.gradient === color);
    if (!exists) {
      this.colorOptions = [{ gradient: color }, ...this.colorOptions];
    }
  }

  private ensureProviderOption(type: WalletType, provider: string | undefined) {
    if (!provider || type === 'cash') {
      return;
    }
    const providers = this.providersByType[type];
    if (providers && !providers.includes(provider)) {
      this.providersByType[type] = [provider, ...providers];
    }
  }

  editWallet() {
    if (!this.selectedWallet) {
      return;
    }
    this.walletToEdit = this.withWalletIcon(this.selectedWallet);
    this.addAccountMode = 'edit';
    this.closeWalletPopup();
    this.showAddAccountModal = true;
  }

  closeEditWalletModal() {
    this.showEditWalletModal = false;
    this.isSavingWallet = false;
    this.resetEditWalletForm();
  }

  submitWalletEdit() {
    const walletId = this.editWalletForm.id ?? this.selectedWallet?.id;
    if (!walletId || !this.editWalletForm.nombre.trim()) {
      return;
    }
    const existsInList = this.billeteras.some(
      (w) => this.getWalletId(w) === String(walletId)
    );
    if (!existsInList) {
      console.warn('La billetera seleccionada no está en la lista local, se recarga.');
      this.loadData();
      return;
    }

    const billeteraId = this.getWalletId({ id: walletId });
    const sanitizedBalance = Math.max(
      0,
      Math.floor(Number(this.editWalletForm.balance ?? 0))
    );
    const updateData: Partial<Billetera> = {
      nombre: this.editWalletForm.nombre.trim(),
      balance: sanitizedBalance,
      type: this.editWalletForm.type,
      proveedor:
        this.editWalletForm.type === 'cash'
          ? 'Efectivo'
          : this.editWalletForm.proveedor || '',
      moneda: this.editWalletForm.moneda,
      color: this.editWalletForm.color,
      icon: this.normalizeIcon(this.walletTypeIcons[this.editWalletForm.type]),
    };

    this.isSavingWallet = true;
    this.billeteraService.updateBilletera(billeteraId, updateData).subscribe({
      next: () => {
        this.isSavingWallet = false;
        this.setWalletTypeOverride(billeteraId, this.editWalletForm.type);
        this.loadData();
        this.closeEditWalletModal();
        if (this.selectedWallet) {
          const nextType = this.resolveWalletType(
            (updateData.type as string) ?? (this.selectedWallet.type as string)
          );
          this.selectedWallet = {
            ...this.selectedWallet,
            ...updateData,
            type: nextType,
            icon: this.normalizeIcon(this.walletTypeIcons[nextType]),
          };
        }
      },
      error: (err) => {
        this.isSavingWallet = false;
        console.error('Error al actualizar la billetera:', err);
      },
    });
  }

  private resetEditWalletForm() {
    this.editWalletForm = {
      id: null,
      nombre: '',
      balance: null,
      type: 'bank',
      proveedor: '',
      moneda: 'ARS',
      color: this.defaultWalletColor,
    };
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
  formatCurrency(amount: number, currency: 'ARS' = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getWalletCurrency(wallet: Partial<Billetera>): 'ARS' {
    return 'ARS';
  }

  private normalizeWallet(wallet: Billetera): Billetera {
    const withIcon = this.withWalletIcon(wallet);
    const gasto = withIcon.gastoHistorico || 0;
    const ingreso = withIcon.ingresoHistorico ?? (withIcon.balance || 0) + gasto;
    return {
      ...withIcon,
      ingresoHistorico: ingreso,
      gastoHistorico: gasto,
    };
  }

  private normalizeCurrency(moneda?: string | null): 'ARS' {
    return 'ARS';
  }

  // --- Transfer modal helpers ---
  openTransfer(mode: 'from' | 'to') {
    // Cerrar otros popups para que el overlay no bloquee los selects
    this.showWalletPopup = false;
    this.showEditWalletModal = false;
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
    this.transferForm.originAmount = null;
    this.transferForm.destinationAmount = null;
    this.showTransferModal = true;
  }

  closeTransferModal() {
    this.showTransferModal = false;
  }


  getFilteredTransferWallets(target: 'origin' | 'destination'): Billetera[] {
    const otherId =
      target === 'origin' ? this.transferForm.destinationId : this.transferForm.originId;

    return this.billeteras.filter((w) => {
      const sameCurrency = !otherId || this.getWalletCurrencyValue(w) === this.getWalletCurrencyValue(
        this.billeteras.find((bw) => this.getWalletId(bw) === String(otherId)) || w
      );
      const notSameWallet = this.getWalletId(w) !== String(otherId);
      return sameCurrency && notSameWallet;
    });
  }


  // Aquí podríamos llamar a un endpoint de transferencia si existiera
  submitTransfer() {
    const originId = this.transferForm.originId;
    const destinationId = this.transferForm.destinationId;
    const amount = Number(this.transferForm.originAmount || 0);

    if (!originId || !destinationId || originId === destinationId) {
      return;
    }
    if (!amount || amount <= 0) {
      return;
    }

    const originIndex = this.billeteras.findIndex((w) => this.getWalletId(w) === String(originId));
    const destIndex = this.billeteras.findIndex((w) => this.getWalletId(w) === String(destinationId));
    if (originIndex === -1 || destIndex === -1) {
      return;
    }

    const origin = this.billeteras[originIndex];
    const dest = this.billeteras[destIndex];
    const currency = this.getWalletCurrencyValue(origin);

    origin.balance = (origin.balance || 0) - amount;
    origin.gastoHistorico = (origin.gastoHistorico || 0) + amount;
    dest.balance = (dest.balance || 0) + amount;
    dest.ingresoHistorico = (dest.ingresoHistorico || 0) + amount;

    this.syncLoadedWalletBalance(
      origin.id,
      origin.balance,
      origin.moneda,
      origin.ingresoHistorico,
      origin.gastoHistorico
    );
    this.syncLoadedWalletBalance(
      dest.id,
      dest.balance,
      dest.moneda,
      dest.ingresoHistorico,
      dest.gastoHistorico
    );

    if (this.selectedWallet && this.getWalletId(this.selectedWallet) === this.getWalletId(origin)) {
      this.selectedWallet = {
        ...this.selectedWallet,
        balance: origin.balance,
        gastoHistorico: origin.gastoHistorico,
        ingresoHistorico: origin.ingresoHistorico,
      };
    }
    if (this.selectedWallet && this.getWalletId(this.selectedWallet) === this.getWalletId(dest)) {
      this.selectedWallet = {
        ...this.selectedWallet,
        balance: dest.balance,
        gastoHistorico: dest.gastoHistorico,
        ingresoHistorico: dest.ingresoHistorico,
      };
    }

    this.transferHistory = [
      {
        id: `${originId}-${destinationId}-${Date.now()}`,
        fromId: String(originId),
        toId: String(destinationId),
        from: origin.nombre,
        to: dest.nombre,
        amount,
        currency,
        date: new Date().toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        status: 'Completada',
      },
      ...this.transferHistory,
    ];

    this.totalBalanceLoaded = this.billeteras.reduce((total, wallet) => total + wallet.balance, 0);
    this.transferForm.originAmount = null;
    this.transferForm.destinationAmount = null;
    this.transferHistoryView = this.filterHistoryForSelected();
    this.showTransferModal = false;
  }

  closeTransferHistory() {
    this.showTransferHistory = false;
  }

  private loadTransferHistory() {
    // reemplazar aca con OperacionService
    this.transferHistory = [...this.transferHistory];
    this.transferHistoryView = this.filterHistoryForSelected();
  }

  private syncLoadedWalletBalance(
    id: any,
    balance: number,
    moneda?: string,
    ingresoHistorico?: number,
    gastoHistorico?: number
  ) {
    const targetId = this.getWalletId({ id });
    const idx = this.billeterasCargadas.findIndex((w) => String(w.id) === targetId);
    if (idx !== -1) {
      this.billeterasCargadas[idx] = {
        ...this.billeterasCargadas[idx],
        balance,
        moneda,
        ingresoHistorico:
          ingresoHistorico !== undefined
            ? ingresoHistorico
            : this.billeterasCargadas[idx].ingresoHistorico,
        gastoHistorico:
          gastoHistorico !== undefined
            ? gastoHistorico
            : this.billeterasCargadas[idx].gastoHistorico,
      };
    }
  }

  private filterHistoryForSelected() {
    const selectedId = this.selectedWallet ? this.getWalletId(this.selectedWallet) : null;
    if (!selectedId) {
      return [...this.transferHistory];
    }
    return this.transferHistory.filter(
      (t) => t.fromId === selectedId || t.toId === selectedId
    );
  }
}
