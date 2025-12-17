import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { OperacionService } from '../../services/operacion.service';
import { Operacion } from '../../../models/operacion.model';
import { BilleteraService } from '../../services/billetera.service';
import { Billetera } from '../../../models/billetera.model';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { TransactionBottomSheet } from '../../components/add-operation-modal/add-operation-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatBottomSheetModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  private subscription = new Subscription();
  currentViewDate: Date = new Date();
  currentMonth = this.formatMonthTitle(this.currentViewDate);
  income = 0;
  expenses = 0;
  availableBalance = 0;
  balanceChange = '';
  recentMovements: any[] = [];
  operaciones: Operacion[] = [];
  billeteras: Billetera[] = [];
  cards: any[] = [];
  private walletTypeOverrides: Record<string, 'bank' | 'digital' | 'cash'> = {};
  private readonly walletTypeOverridesKey = 'walletTypeOverrides';
  private walletTypeIcons: Record<'bank' | 'digital' | 'cash', string> = {
    bank: 'mdi-bank',
    digital: 'mdi-credit-card',
    cash: 'mdi-cash-multiple',
  };

  // Variables para swipe
  currentIndex = 0;
  touchStartX = 0;
  touchCurrentX = 0;
  isDragging = false;
  isAnimating = false;

  private _transactionBottomSheet = inject(MatBottomSheet);

  constructor(
    private router: Router,
    private operacionesService: OperacionService,
    private billeteraService: BilleteraService
  ) { }

  get visibleCards() {
    if (this.cards.length === 0) return [];
    if (this.cards.length === 1) return [this.cards[0]];

    if (this.cards.length === 2) {
      // Con 2 tarjetas, mostrar la actual y la siguiente en ciclo
      const current = this.currentIndex % 2;
      const next = (this.currentIndex + 1) % 2;
      return [this.cards[current], this.cards[next]];
    }

    const prev = this.currentIndex === 0 ? this.cards.length - 1 : this.currentIndex - 1;
    const next = this.currentIndex === this.cards.length - 1 ? 0 : this.currentIndex + 1;
    return [
      this.cards[prev],
      this.cards[this.currentIndex],
      this.cards[next]
    ];
  }

  isActiveCard(index: number): boolean {
    if (this.cards.length === 1) return true;
    if (this.cards.length === 2) return index === 0; // La primera en visibleCards es la activa
    return index === 1; // En 3+ tarjetas, la del medio es la activa
  }

  isPrevCard(index: number): boolean {
    if (this.cards.length <= 2) return false; // Con 1 o 2 tarjetas no hay previa
    return index === 0;
  }

  isNextCard(index: number): boolean {
    if (this.cards.length === 1) return false;
    if (this.cards.length === 2) return index === 1; // La segunda es la siguiente
    return index === 2; // En 3+ tarjetas, la tercera es la siguiente
  }

  ngOnInit(): void {
    this.loadWalletTypeOverrides();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadData(): void {
    // Guardar el í­ndice actual para restaurarlo después
    const previousIndex = this.currentIndex;
    const previousLength = this.billeteras.length;

    // Cargar billeteras desde el servicio
    this.subscription.add(
      this.billeteraService.getBilleteras().subscribe({
        next: (billeteras) => {
          // Crear billetera General con el total (siempre presente)
          const totalBalance = billeteras.reduce((sum, b) => sum + b.balance, 0);
          const billeteraGeneral: Billetera = {
            id: '0',
            nombre: 'General',
            proveedor: 'Todas las billeteras',
            type: 'digital',
            balance: totalBalance,
            isDefault: true,
            color: 'linear-gradient(135deg, #3dcd99 0%, #2ba87a 50%, #1e7e5b 100%)',
            moneda: 'ARS',
            ingresoHistorico: billeteras.reduce((sum, b) => sum + (b.ingresoHistorico || 0), 0),
            gastoHistorico: billeteras.reduce((sum, b) => sum + (b.gastoHistorico || 0), 0)
          };

          // Agregar billetera General al inicio (siempre, incluso si no hay otras)
          this.billeteras = [billeteraGeneral, ...billeteras];
          this.mapBilleterasToCards();

          // Restaurar el í­ndice si es válido, o ajustar si hay nuevas tarjetas
          if (this.billeteras.length > previousLength) {
            // Se agregaron nuevas billeteras, mantener en la misma posición
            this.currentIndex = Math.min(previousIndex, this.billeteras.length - 1);
          } else if (previousIndex < this.billeteras.length) {
            // Mantener el índice actual si sigue siendo válido
            this.currentIndex = previousIndex;
          } else {
            // Si el índice ya no es válido, volver a la primera tarjeta
            this.currentIndex = 0;
          }
        },
        error: (error) => {
          console.error('Error al cargar billeteras:', error);
          // En caso de error, crear solo la billetera General vací­a
          this.billeteras = [{
            id: '0',
            nombre: 'General',
            proveedor: 'Todas las billeteras',
            type: 'digital',
            balance: 0,
            isDefault: true,
            color: 'linear-gradient(135deg, #3dcd99 0%, #2ba87a 50%, #1e7e5b 100%)',
            moneda: 'ARS',
            ingresoHistorico: 0,
            gastoHistorico: 0
          }];
          this.mapBilleterasToCards();
          this.currentIndex = 0;
        },
      })
    );

    // Cargar gastos desde la API
    this.subscription.add(
      this.operacionesService.getAllOperaciones().subscribe({
        next: (op) => {
          this.operaciones = this.filterOperacionesByMonth(op, this.currentViewDate);
          this.calculateStats();
          this.loadRecentMovements();
          this.mapBilleterasToCards();
        },
        error: (error) => {
          console.error('Error al cargar egresos:', error);
        },
      })
    );
  }

  private calculateStats(): void {
    // Obtener la billetera actual
    const billeteraActual = this.billeteras[this.currentIndex];
    if (!billeteraActual) return;

    console.log('Calculando stats para:', billeteraActual.nombre, 'ID:', billeteraActual.id);

    let operacionesBilletera: Operacion[];

    // Si es la billetera General (id '0'), mostrar todas las operaciones
    if (billeteraActual.id === '0') {
      operacionesBilletera = this.operaciones;
    } else {
      // Filtrar operaciones por la billetera específica
      // El backend puede devolver billetera como string (ID) o como objeto {id, nombre, ...}
      operacionesBilletera = this.operaciones.filter((op) => {
        const billeteraId = typeof op.billetera === 'object' && op.billetera !== null
          ? (op.billetera as any).id || (op.billetera as any)._id
          : op.billetera;

        return billeteraId === billeteraActual.id?.toString() ||
          op.billeteraId === billeteraActual.id?.toString();
      });
      console.log(`Operaciones para stats: ${operacionesBilletera.length}`);
    }

    const ingresos = operacionesBilletera.filter((g) => g.tipo === 'Ingreso' || g.tipo === 'income');
    const egresos = operacionesBilletera.filter((g) => g.tipo === 'Egreso' || g.tipo === 'expense');

    this.income = ingresos.reduce((sum, g) => sum + g.monto, 0);
    this.expenses = egresos.reduce((sum, g) => sum + g.monto, 0);
    this.availableBalance = this.income - this.expenses;

    console.log(`Ingresos: $${this.income}, Gastos: $${this.expenses}`);
  }



  private loadRecentMovements(): void {
    const billeteraActual = this.billeteras[this.currentIndex];
    if (!billeteraActual) {
      this.recentMovements = [];
      return;
    }

    let operacionesBilletera: Operacion[];
    if (billeteraActual.id === '0') {
      operacionesBilletera = this.operaciones;
    } else {
      operacionesBilletera = this.operaciones.filter((op) => {
        const billeteraId =
          typeof op.billetera === 'object' && op.billetera !== null
            ? (op.billetera as any).id ?? (op.billetera as any)._id
            : op.billetera;
        return (
          billeteraId === billeteraActual.id?.toString() ||
          op.billeteraId === billeteraActual.id?.toString()
        );
      });
    }

    // 🔽 ORDENAR POR FECHA DESCENDENTE (más nuevas primero)
    const operacionesRecientes = operacionesBilletera
      .slice()
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 3);

    this.recentMovements = operacionesRecientes.map((operacion) => {
      let categoriaInfo: any = {};
      if (typeof operacion.categoria === 'object' && operacion.categoria !== null) {
        categoriaInfo = operacion.categoria;
      }
      
      // Normalizar el icono para asegurar que tenga el formato correcto
      const normalizeIcon = (icon?: string): string => {
        if (!icon) return 'mdi mdi-cash';
        const trimmed = icon.trim();
        if (trimmed.startsWith('mdi mdi-')) return trimmed;
        if (trimmed.startsWith('mdi-')) return `mdi ${trimmed}`;
        return `mdi mdi-${trimmed}`;
      };
      
      return {
        id: operacion._id,
        type: operacion.tipo,
        category:
          categoriaInfo.nombre ??
          operacion.categoriaId ??
          operacion.categoria ??
          'Sin categoría',
        description: operacion.descripcion,
        icon: normalizeIcon(categoriaInfo.icono),
        amount:
          operacion.tipo === 'Ingreso' || operacion.tipo === 'income'
            ? operacion.monto
            : -operacion.monto,
        date: this.formatDateForHome(operacion.fecha.toString()),
        color: categoriaInfo.color ?? '#6b7280',
      };
    });
  }


  // Métodos para el menú
  toggleMenu() {
    console.log('toggleMenu ejecutado');
    this.isMenuOpen = !this.isMenuOpen;
    console.log('Estado del menú:', this.isMenuOpen);
  }

  closeMenu() {
    console.log('closeMenu ejecutado');
    this.isMenuOpen = false;
  }

  // Métodos para navegación
  previousMonth() {
    this.currentViewDate = new Date(
      this.currentViewDate.getFullYear(),
      this.currentViewDate.getMonth() - 1,
      1
    );
    this.currentMonth = this.formatMonthTitle(this.currentViewDate);
    this.loadData();
  }

  nextMonth() {
    // Solo permitir ir al siguiente mes si no estamos en el mes actual
    if (!this.isCurrentMonth()) {
      this.currentViewDate = new Date(
        this.currentViewDate.getFullYear(),
        this.currentViewDate.getMonth() + 1,
        1
      );
      this.currentMonth = this.formatMonthTitle(this.currentViewDate);
      this.loadData();
    }
  }

  isCurrentMonth(): boolean {
    const today = new Date();
    return this.currentViewDate.getFullYear() === today.getFullYear() &&
      this.currentViewDate.getMonth() === today.getMonth();
  }

  viewAllMovements() {
    const billeteraActual = this.billeteras[this.currentIndex];
    const queryParams: any = {};
    
    // Si hay una billetera seleccionada y no es la General (id '0'), filtrar por ella
    if (billeteraActual && billeteraActual.id !== '0') {
      queryParams.walletId = billeteraActual.id;
    }
    
    this.router.navigate(['/activity'], { queryParams });
  }

  // Métodos para botones inferiores
  openUserComparison() {
    console.log('Abrir comparación de usuarios');
    this.router.navigate(['/user-comparison']);
  }

  openAnalysis() {
    console.log('Abrir análisis');
    this.router.navigate(['/analysis']);
  }

  onTouchStart(event: any) {
    if (this.isAnimating || this.cards.length <= 1) return;
    this.isDragging = true;
    this.touchStartX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
    this.touchCurrentX = this.touchStartX;
  }

  onTouchMove(event: any) {
    if (!this.isDragging || this.isAnimating || this.cards.length <= 1) return;
    this.touchCurrentX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  }

  onTouchEnd(event: any) {
    if (!this.isDragging || this.isAnimating || this.cards.length <= 1) return;
    this.isDragging = false;

    const diff = this.touchCurrentX - this.touchStartX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      this.isAnimating = true;
      if (diff > 0) {
        // Swipe derecha - mostrar tarjeta anterior
        this.currentIndex = this.currentIndex === 0 ? this.cards.length - 1 : this.currentIndex - 1;
      } else {
        // Swipe izquierda - mostrar siguiente tarjeta
        this.currentIndex = this.currentIndex === this.cards.length - 1 ? 0 : this.currentIndex + 1;
      }
      setTimeout(() => {
        this.isAnimating = false;
        // Actualizar datos al cambiar de billetera
        this.updateBilleteraData();
      }, 300);
    }

    this.touchStartX = 0;
    this.touchCurrentX = 0;
  }

  private updateBilleteraData(): void {
    // Recalcular estadí­sticas y movimientos para la billetera actual
    this.calculateStats();
    this.loadRecentMovements();
  }

  getCardTransform(index: number): string {
    const diff = this.isDragging ? this.touchCurrentX - this.touchStartX : 0;

    // Si solo hay 1 tarjeta, centrarla siempre
    if (this.visibleCards.length === 1) {
      return `translateX(0) scale(1)`;
    }

    // Si hay 2 tarjetas, mejorar la animación
    if (this.visibleCards.length === 2) {
      if (index === 0) {
        // Tarjeta activa
        return `translateX(${diff / 2}px) scale(1)`;
      } else {
        // Tarjeta siguiente (fuera de vista a la derecha)
        return `translateX(calc(100% + 20px + ${diff / 2}px)) scale(0.95)`;
      }
    }

    // Si hay 3 o más tarjetas, comportamiento normal
    if (index === 0) {
      // Tarjeta previa
      return `translateX(${-100 + (diff / 3)}%) scale(0.9)`;
    } else if (index === 1) {
      // Tarjeta activa
      return `translateX(${diff / 3}%) scale(1)`;
    } else {
      // Tarjeta siguiente
      return `translateX(${100 + (diff / 3)}%) scale(0.9)`;
    }
  }

  isTransactionModalOpen = false;

  addTransaction(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.isTransactionModalOpen) {
      return;
    }

    this.isTransactionModalOpen = true;
    console.log('Agregar operación');
    const bottomSheetRef = this._transactionBottomSheet.open(TransactionBottomSheet, {
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'bottom-sheet-backdrop',
      panelClass: 'custom-bottom-sheet-container'
    });

    // Manejar el resultado cuando se cierra el bottom sheet
    bottomSheetRef.afterDismissed().subscribe(result => {
      this.isTransactionModalOpen = false;
      if (result) {
        console.log('Transacción guardada:', result);
        // Recargar los datos después de guardar
        this.loadData();
      }
    });
  }

  private formatMonthTitle(date: Date): string {
    const monthYear = date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
    return this.capitalizeFirstLetter(monthYear);
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private formatDateForHome(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }

  redondearAmount(amount: number): number {
    return Math.round(amount);
  }

  private filterOperacionesByMonth(operaciones: Operacion[], referenceDate: Date): Operacion[] {
    const targetMonth = referenceDate.getMonth();
    const targetYear = referenceDate.getFullYear();
    return operaciones.filter((op) => {
      const opDate = new Date(op.fecha);
      return opDate.getMonth() === targetMonth && opDate.getFullYear() === targetYear;
    });
  }

  private mapBilleterasToCards(): void {
    this.cards = this.billeteras.map((billetera) => {
      const overrideType = this.getWalletTypeOverride(billetera.id);
      const walletType = overrideType || this.resolveWalletType(billetera.type as string);
      const walletCurrency = (billetera.moneda || 'ARS').toString().toUpperCase();

      // Determinar el icono basado en el tipo, usando override
      let icon = this.normalizeIcon(
        billetera.icon || this.walletTypeIcons[walletType] || 'mdi-wallet'
      );
      let background = 'linear-gradient(135deg, #667EEA, #764BA2)';

      if (walletType === 'cash') {
        background = 'linear-gradient(135deg, #51CF66, #40C057)';
      } else if (walletType === 'bank') {
        background = 'linear-gradient(135deg, #EC0000, #CC0000)';
      } else if (walletType === 'digital') {
        background = 'linear-gradient(135deg, #009EE3, #0078BE)';
      }

      // Si la billetera tiene un color personalizado, usarlo
      if (billetera.color) {
        background = billetera.color;
      }

      // Calcular balance mensual
      let monthlyBalance = 0;
      let operacionesBilletera: Operacion[] = [];

      if (billetera.id === '0') {
         operacionesBilletera = this.operaciones;
      } else {
         operacionesBilletera = this.operaciones.filter(op => {
            const billeteraId = typeof op.billetera === 'object' && op.billetera !== null
              ? (op.billetera as any).id || (op.billetera as any)._id
              : op.billetera;
            return billeteraId === billetera.id?.toString() || op.billeteraId === billetera.id?.toString();
         });
      }

      const ingresos = operacionesBilletera.filter(op => op.tipo === 'Ingreso' || op.tipo === 'income').reduce((sum, op) => sum + op.monto, 0);
      const egresos = operacionesBilletera.filter(op => op.tipo === 'Egreso' || op.tipo === 'expense').reduce((sum, op) => sum + op.monto, 0);
      monthlyBalance = ingresos - egresos;

      return {
        typeLabel: billetera.nombre,
        icon: icon,
        number: `Total: $${billetera.balance.toLocaleString('es-ES')}`,
        holder: 'Balance Mensual',
        balance: `$${monthlyBalance.toLocaleString('es-ES')}`,
        background: background,
        isGeneral: billetera.id === '0', // Marcar si es la billetera General
      };
    });
  }

  private resolveWalletType(type?: string | null): 'bank' | 'digital' | 'cash' {
    const normalized = (type || '').toString().trim().toLowerCase();
    if (normalized === 'digital') return 'digital';
    if (normalized === 'cash' || normalized === 'efectivo') return 'cash';
    return 'bank';
  }

  private normalizeIcon(icon?: string | null): string {
    if (!icon || !icon.trim()) {
      return 'mdi mdi-wallet';
    }
    const trimmed = icon.trim();
    if (trimmed.startsWith('mdi ')) return trimmed;
    if (trimmed.startsWith('mdi-')) return `mdi ${trimmed}`;
    return `mdi ${trimmed}`;
  }

  private getWalletTypeOverride(id?: string | number | null) {
    if (id === null || id === undefined) {
      return undefined;
    }
    return this.walletTypeOverrides[String(id)];
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

  private canUseLocalStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

}
