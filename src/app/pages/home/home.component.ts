import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal.component';
import { TransactionService, Transaction } from '../../services/transaction.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TransactionModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Hacer Math disponible en el template
  Math = Math;

  // Estado del menú
  isMenuOpen = false;
  
  // Estado del modal de transacciones
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

  constructor(
    private router: Router,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.subscribeToTransactions();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadData(): void {
    // Cargar estadísticas
    const stats = this.transactionService.getStats();
    this.income = stats.income;
    this.expenses = stats.expenses;
    this.availableBalance = stats.balance;

    // Cargar movimientos recientes
    this.recentMovements = this.transactionService.getRecentMovements();
  }

  private subscribeToTransactions(): void {
    // Suscribirse a cambios en las transacciones
    this.subscription.add(
      this.transactionService.transactions$.subscribe(() => {
        this.loadData();
      })
    );
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

  openWallets() {
    console.log('Abrir billeteras');
    this.router.navigate(['/wallets']);
  }

  openAnalysis() {
    console.log('Abrir análisis');
    this.router.navigate(['/analysis']);
    this.closeMenu();
  }

  addTransaction() {
    console.log('Agregar transacción');
    this.showTransactionModal = true;
  }

  closeTransactionModal() {
    this.showTransactionModal = false;
  }

  saveTransaction(transaction: any) {
    console.log('Transacción guardada:', transaction);
    
    // Agregar la transacción usando el servicio
    this.transactionService.addTransaction({
      type: transaction.type,
      amount: Math.abs(transaction.amount),
      description: transaction.description || transaction.category,
      category: transaction.category,
      subcategory: transaction.subcategory,
      wallet: transaction.wallet,
      date: transaction.date
    });
    
    this.closeTransactionModal();
  }




} 