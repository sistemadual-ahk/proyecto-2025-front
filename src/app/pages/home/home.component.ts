import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { OperacionService } from '../../services/operacion.service';
import { Operacion } from '../../../models/operacion.model';
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
  cards = [
    {
      typeLabel: 'Mercado Pago',
      icon: 'mdi-credit-card',
      number: '**** **** **** 1234',
      holder: 'Titular',
      balance: '$15,000',
      background: 'linear-gradient(135deg, #009EE3, #0078BE)',
    },
    {
      typeLabel: 'Santander',
      icon: 'mdi-bank',
      number: '**** **** **** 5678',
      holder: 'Titular',
      balance: '$18,000',
      background: 'linear-gradient(135deg, #EC0000, #CC0000)',
    },
    {
      typeLabel: 'Efectivo',
      icon: 'mdi-cash-multiple',
      number: 'Disponible',
      holder: 'En mano',
      balance: '$4,300',
      background: 'linear-gradient(135deg, #51CF66, #40C057)',
    },
  ];

  // Flag de animación
  isAnimating = false;

  private _transactionBottomSheet = inject(MatBottomSheet);

  constructor(
    private router: Router,
    private operacionesService: OperacionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadData(): void {
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
    // Calcular estadísticas desde los gastos
    const ingresos = this.operaciones.filter((g) => g.tipo === 'Ingreso');
    const operacionesData = this.operaciones.filter((g) => g.tipo === 'Egreso');

    this.income = ingresos.reduce((sum, g) => sum + g.monto, 0);
    this.expenses = operacionesData.reduce((sum, g) => sum + g.monto, 0);
    this.availableBalance = this.income - this.expenses;
  }

  private loadRecentMovements(): void {
    const operacionesRecientes = this.operaciones
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
  }

  nextMonth() {
    this.currentViewDate = new Date(
      this.currentViewDate.getFullYear(),
      this.currentViewDate.getMonth() + 1,
      1
    );
    this.currentMonth = this.formatMonthTitle(this.currentViewDate);
  }

  viewAllMovements() {
    this.router.navigate(['/activity']);
  }

  // Métodos para botones inferiores
  openGoals() {
    this.router.navigate(['/saving-goals']);
  }

  openAnalysis() {
    console.log('Abrir análisis');
    this.router.navigate(['/analysis']);
    this.closeMenu();
  }

  rotateCards() {
    if (this.cards.length <= 1) return;
    if (this.isAnimating) return;
    this.isAnimating = true;
    // Espera a que termine la transición CSS
    setTimeout(() => {
      const first = this.cards.shift();
      if (first) this.cards.push(first);
      this.isAnimating = false;
    }, 300);
  }

  getCardStyle(index: number) {
    const total = this.cards.length;
    const effectiveIndex = this.isAnimating ? (index - 1 + total) % total : index;

    const translateY = Math.min(effectiveIndex * 10, 40); // límite suave
    const scale = Math.max(1 - effectiveIndex * 0.05, 0.8);
    const opacity = Math.max(1 - effectiveIndex * 0.1, 0.6);
    const zIndex = total - effectiveIndex;

    return {
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity: opacity,
      zIndex: zIndex,
    };
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
}
