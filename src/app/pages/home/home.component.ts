import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal.component';
import { GastoService } from '../../services/gasto.service';
import { AuthService } from '@auth0/auth0-angular';
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

  // Hacer Math disponible en el template
  Math = Math;

  // Estado del menú
  isMenuOpen = false;

  // Estado del modal de gastos
  showTransactionModal = false;

  // Suscripciones
  private subscription = new Subscription();

  // Datos del dashboard
  currentMonth = 'Junio 2025';
  income = 0;
  expenses = 0;
  availableBalance = 0;
  balanceChange = '+$200 vs mes anterior';

  // Movimientos recientes
  recentMovements: any[] = [];
  
  // Gastos del usuario
  gastos: Gasto[] = [];

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
    // Aquí iría la lógica de logout (limpiar tokens, etc.)
    this.auth.logout({
      logoutParams: {
        returnTo: this.doc.location.origin,
      }
    })
    console.log('Logout');
    this.router.navigate(['/']);
  }

  // Métodos para navegación
  previousMonth() {
    // Lógica para mes anterior
    console.log('Mes anterior');
  }

  nextMonth() {
    // Lógica para mes siguiente
    console.log('Mes siguiente');
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
    // Agregar clase de transición antes de navegar
    document.body.classList.add('page-transition');

    setTimeout(() => {
      this.router.navigate(['/activity']);
      // Remover la clase después de la navegación
      setTimeout(() => {
        document.body.classList.remove('page-transition');
      }, 300);
    }, 150);
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