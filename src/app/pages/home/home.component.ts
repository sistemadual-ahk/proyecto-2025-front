import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal.component';
import { GastoService } from '../../services/gasto.service';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'; 
import { Gasto } from '../../../models/gasto.model';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TransactionModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private doc = inject(DOCUMENT);

  Math = Math;

  // Estado del menú
  isMenuOpen = false;

  // Estado del modal de gastos
  showTransactionModal = false;
  // Suscripciones
  private subscription = new Subscription();

  // Datos del dashboard
  currentViewDate: Date = new Date();
  currentMonth = this.formatMonthTitle(this.currentViewDate);
  income = 0;
  expenses = 4500;
  availableBalance = 37300;
  balanceChange = '+$200 vs mes anterior';

  // Movimientos recientes
  recentMovements: any[] = [];
  
  // Gastos del usuario
  gastos: Gasto[] = [];

  // Array de tarjetas con datos dinámicos
  cards = [
    {
      typeLabel: 'Mercado Pago',
      icon: 'mdi-credit-card',
      number: '**** **** **** 1234',
      holder: 'Titular',
      balance: '$15,000',
      background: 'linear-gradient(135deg, #009EE3, #0078BE)'
    },
    {
      typeLabel: 'Santander',
      icon: 'mdi-bank',
      number: '**** **** **** 5678',
      holder: 'Titular',
      balance: '$18,000',
      background: 'linear-gradient(135deg, #EC0000, #CC0000)'
    },
    {
      typeLabel: 'Efectivo',
      icon: 'mdi-cash-multiple',
      number: 'Disponible',
      holder: 'En mano',
      balance: '$4,300',
      background: 'linear-gradient(135deg, #51CF66, #40C057)'
    }
  ];

  // Flag de animación
  isAnimating = false;

  constructor(
    private router: Router,
    private gastoService: GastoService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadData(): void {
    // Cargar gastos desde la API
    this.subscription.add(
      this.gastoService.getAllGastos().subscribe({
        next: (gastos) => {
          this.gastos = gastos;
          this.calculateStats();
          this.loadRecentMovements();
        },
        error: (error) => {
          console.error('Error al cargar gastos:', error);
        }
      })
    );
  }

  private calculateStats(): void {
    // Calcular estadísticas desde los gastos
    const ingresos = this.gastos.filter(g => g.tipo === 'income');
    const gastosData = this.gastos.filter(g => g.tipo === 'expense');
    
    this.income = ingresos.reduce((sum, g) => sum + g.monto, 0);
    this.expenses = gastosData.reduce((sum, g) => sum + g.monto, 0);
    this.availableBalance = this.income - this.expenses;
  }

  private loadRecentMovements(): void {
    // Obtener los últimos 3 gastos como movimientos recientes
    const recentGastos = this.gastos
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
      .slice(0, 3);

    this.recentMovements = recentGastos.map(gasto => ({
      id: gasto._id,
      type: gasto.tipo,
      category: gasto.categoria?.nombre || 'Sin categoría',
      description: gasto.descripcion,
      subcategory: gasto.categoria?.nombre || '',
      icon: this.getIconForCategory(gasto.categoria?.nombre || ''),
      amount: gasto.tipo === 'income' ? gasto.monto : -gasto.monto,
      date: this.formatDateForHome(gasto.datetime.toString()),
      color: gasto.tipo === 'income' ? '#10b981' : this.getColorForCategory(gasto.categoria?.nombre || '')
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

logout(): void {
    this.auth.logout({
        logoutParams: {
            // Usar window.location.origin es la forma más directa.
            returnTo: window.location.origin, 
        }
    });
    // Nota: El navegador será redirigido por Auth0, el console.log y el router.navigate 
    // después de la redirección de Auth0 son inalcanzables.
    // Los puedes dejar, pero no se ejecutarán.
    console.log('Logout'); 
    this.router.navigate(['/']); 
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

  // Métodos para acciones
  openNotifications() {
    console.log('Abrir notificaciones');
  }

  openProfile() {
    console.log('Abrir perfil');
  }

  viewAllMovements() {
    console.log('Ver todos los movimientos');
    this.router.navigate(['/activity']);
  }

  // Métodos para botones inferiores
  openGoals() {
    console.log('Abrir objetivos');
    this.router.navigate(['/saving-goals']);
  }

  openAnalysis() {
    console.log('Abrir análisis');
    this.router.navigate(['/analysis']);
    this.closeMenu();
  }

  // Rotación de tarjetas con animación
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

  // Estilos dinámicos por índice
  getCardStyle(index: number) {
    const total = this.cards.length;
    const effectiveIndex = this.isAnimating ? (index - 1 + total) % total : index;

    // Cálculo genérico: cada nivel desciende 10px, reduce escala 0.05 y opacidad 0.1
    const translateY = Math.min(effectiveIndex * 10, 40); // límite suave
    const scale = Math.max(1 - effectiveIndex * 0.05, 0.8);
    const opacity = Math.max(1 - effectiveIndex * 0.1, 0.6);
    const zIndex = total - effectiveIndex;

    return {
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity: opacity,
      zIndex: zIndex
    };
  }

  addTransaction() {
    console.log('Agregar gasto');
    this.showTransactionModal = true;
  }

  closeTransactionModal() {
    this.showTransactionModal = false;
  }

  saveTransaction(transaction: any) {
    console.log('Gasto guardado:', transaction);

    // Crear el gasto usando el servicio
    const gastoData = {
      monto: Math.abs(transaction.amount),
      descripcion: transaction.description || transaction.category,
      tipo: transaction.type,
      datetime: new Date(transaction.date),
      userId: 'user-id', // TODO: Obtener del usuario autenticado
      billetera: transaction.wallet,
      categoria: {
        _id: '',
        userId: 'user-id',
        nombre: transaction.category,
        descripcion: transaction.subcategory
      }
    };

    this.subscription.add(
      this.gastoService.createGasto(gastoData).subscribe({
        next: (gasto) => {
          console.log('Gasto creado:', gasto);
          this.loadData(); // Recargar datos
          this.closeTransactionModal();
        },
        error: (error) => {
          console.error('Error al crear gasto:', error);
        }
      })
    );
  }

  // Métodos auxiliares para iconos y colores
  private getIconForCategory(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Alimentación': 'mdi-cart',
      'Transporte': 'mdi-car',
      'Entretenimiento': 'mdi-movie',
      'Salud': 'mdi-medical-bag',
      'Educación': 'mdi-school',
      'Vivienda': 'mdi-home',
      'Ingresos': 'mdi-cash-plus',
      'Otros': 'mdi-dots-horizontal'
    };
    return iconMap[category] || 'mdi-cash';
  }

  private getColorForCategory(category: string): string {
    const colorMap: { [key: string]: string } = {
      'Alimentación': '#f59e0b',
      'Transporte': '#3b82f6',
      'Entretenimiento': '#8b5cf6',
      'Salud': '#ef4444',
      'Educación': '#10b981',
      'Vivienda': '#6366f1',
      'Ingresos': '#3DCD99',
      'Otros': '#6b7280'
    };
    return colorMap[category] || '#6b7280';
  }

  // Formateo del título del mes
  private formatMonthTitle(date: Date): string {
    const monthYear = date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
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
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ', ' + 
             date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
  }

} 
