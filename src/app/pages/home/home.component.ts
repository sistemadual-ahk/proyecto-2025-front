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
import {MatButtonModule} from '@angular/material/button';
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
  expenses = 4500;
  availableBalance = 37300;
  balanceChange = '+$200 vs mes anterior';
  recentMovements: any[] = [];
  operaciones: Operacion[] = [];
  billeteras: Billetera[] = [];
  cards: any[] = [];

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
  ) {}

  get visibleCards() {
    const prev = this.currentIndex === 0 ? this.cards.length - 1 : this.currentIndex - 1;
    const next = this.currentIndex === this.cards.length - 1 ? 0 : this.currentIndex + 1;
    return [
      this.cards[prev],
      this.cards[this.currentIndex],
      this.cards[next]
    ];
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadData(): void {
    // Hardcodear billeteras temporalmente para probar el diseño
    this.billeteras = [
      {
        id: 0,
        nombre: 'General',
        proveedor: 'Todas las billeteras',
        type: 'digital' as 'bank' | 'digital' | 'cash',
        balance: 60600, // Suma de todas las billeteras
        isDefault: true,
        color: 'linear-gradient(135deg, #3dcd99, #2ba87a)',
        moneda: 'ARS',
        ingresoHistorico: 180000,
        gastoHistorico: 119400
      },
      {
        id: 1,
        nombre: 'Mercado Pago',
        proveedor: 'Mercado Pago',
        type: 'digital',
        balance: 15000,
        isDefault: true,
        color: 'linear-gradient(135deg, #009EE3, #0078BE)',
        moneda: 'ARS',
        ingresoHistorico: 50000,
        gastoHistorico: 35000
      },
      {
        id: 2,
        nombre: 'Santander',
        proveedor: 'Banco Santander',
        type: 'bank',
        balance: 28500,
        isDefault: false,
        color: 'linear-gradient(135deg, #EC0000, #CC0000)',
        moneda: 'ARS',
        ingresoHistorico: 80000,
        gastoHistorico: 51500
      },
      {
        id: 3,
        nombre: 'Efectivo',
        proveedor: 'Billetera física',
        type: 'cash',
        balance: 4300,
        isDefault: false,
        color: 'linear-gradient(135deg, #51CF66, #40C057)',
        moneda: 'ARS',
        ingresoHistorico: 20000,
        gastoHistorico: 15700
      },
      {
        id: 4,
        nombre: 'Brubank',
        proveedor: 'Brubank Digital',
        type: 'digital',
        balance: 12800,
        isDefault: false,
        color: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        moneda: 'ARS',
        ingresoHistorico: 30000,
        gastoHistorico: 17200
      }
    ];
    this.mapBilleterasToCards();

    // Descomentar cuando la API esté lista
    /* this.subscription.add(
      this.billeteraService.getBilleteras().subscribe({
        next: (billeteras) => {
          this.billeteras = billeteras;
          this.mapBilleterasToCards();
        },
        error: (error) => console.error('Error al cargar billeteras:', error),
      })
    ); */

    // Cargar gastos desde la API
    this.subscription.add(
      this.operacionesService.getAllOperaciones().subscribe({
        next: (op) => {
          this.operaciones = op;
          this.calculateStats();
          this.loadRecentMovements();
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

    let operacionesBilletera: Operacion[];

    // Si es la billetera General (id 0), mostrar todas las operaciones
    if (billeteraActual.id === 0) {
      operacionesBilletera = this.operaciones;
    } else {
      // Filtrar operaciones por la billetera específica
      operacionesBilletera = this.operaciones.filter(
        (op) => op.billeteraId === billeteraActual.id?.toString()
      );
    }

    const ingresos = operacionesBilletera.filter((g) => g.tipo === 'Ingreso');
    const egresos = operacionesBilletera.filter((g) => g.tipo === 'Egreso');

    this.income = ingresos.reduce((sum, g) => sum + g.monto, 0);
    this.expenses = egresos.reduce((sum, g) => sum + g.monto, 0);
    this.availableBalance = this.income - this.expenses;
  }

  private loadRecentMovements(): void {
    // Obtener la billetera actual
    const billeteraActual = this.billeteras[this.currentIndex];
    if (!billeteraActual) {
      this.recentMovements = [];
      return;
    }

    let operacionesBilletera: Operacion[];

    // Si es la billetera General (id 0), mostrar todas las operaciones
    if (billeteraActual.id === 0) {
      operacionesBilletera = this.operaciones;
    } else {
      // Filtrar operaciones por la billetera específica
      operacionesBilletera = this.operaciones.filter(
        (op) => op.billeteraId === billeteraActual.id?.toString()
      );
    }

    const operacionesRecientes = operacionesBilletera
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 3);

    this.recentMovements = operacionesRecientes.map((operacion) => ({
      id: operacion._id,
      type: operacion.tipo,
      category: operacion.categoriaId || 'Sin categoría',
      description: operacion.descripcion,
      icon: operacion.categoriaId || 'mdi-cash',
      amount: operacion.tipo === 'Ingreso' ? operacion.monto : -operacion.monto,
      date: this.formatDateForHome(operacion.fecha.toString()),
      color: operacion.tipo === 'Ingreso' ? '#10b981' : operacion.categoriaId || '#6b7280',
    }));
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
    this.router.navigate(['/activity']);
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
    if (this.isAnimating) return;
    this.isDragging = true;
    this.touchStartX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
    this.touchCurrentX = this.touchStartX;
  }

  onTouchMove(event: any) {
    if (!this.isDragging || this.isAnimating) return;
    this.touchCurrentX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  }

  onTouchEnd(event: any) {
    if (!this.isDragging || this.isAnimating) return;
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
    // Recalcular estadísticas y movimientos para la billetera actual
    this.calculateStats();
    this.loadRecentMovements();
  }

  getCardTransform(index: number): string {
    const diff = this.isDragging ? this.touchCurrentX - this.touchStartX : 0;
    
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

  addTransaction() {
    console.log('Agregar operacion');
    const bottomSheetRef = this._transactionBottomSheet.open(TransactionBottomSheet, {
      disableClose: false,
      hasBackdrop: true,
      backdropClass: 'bottom-sheet-backdrop',
      panelClass: 'custom-bottom-sheet-container'
    });
    
    // Manejar el resultado cuando se cierra el bottom sheet
    bottomSheetRef.afterDismissed().subscribe(result => {
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
      return 'Hoy, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer, ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return (
        date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) +
        ', ' +
        date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      );
    }
  }

  redondearAmount(amount: number): number {
    return Math.round(amount);
  }

  private mapBilleterasToCards(): void {
    this.cards = this.billeteras.map((billetera) => {
      // Determinar el icono basado en el tipo
      let icon = 'mdi-wallet';
      let background = 'linear-gradient(135deg, #667EEA, #764BA2)';

      if (billetera.type === 'cash') {
        icon = 'mdi-cash-multiple';
        background = 'linear-gradient(135deg, #51CF66, #40C057)';
      } else if (billetera.type === 'bank') {
        icon = 'mdi-bank';
        background = 'linear-gradient(135deg, #EC0000, #CC0000)';
      } else if (billetera.type === 'digital') {
        icon = 'mdi-credit-card';
        background = 'linear-gradient(135deg, #009EE3, #0078BE)';
      }

      // Si la billetera tiene un color personalizado, usarlo
      if (billetera.color) {
        background = billetera.color;
      }

      return {
        typeLabel: billetera.nombre,
        icon: icon,
        number: billetera.proveedor || 'Disponible',
        holder: billetera.type === 'cash' ? 'En mano' : 'Titular',
        balance: `$${billetera.balance.toLocaleString('es-ES')}`,
        background: background,
        isGeneral: billetera.id === 0, // Marcar si es la billetera General
      };
    });
  }
}
