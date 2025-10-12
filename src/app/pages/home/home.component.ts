import { Component, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal.component';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private auth = inject(AuthService);
  private doc = inject(DOCUMENT);

  Math = Math;

  // Estado del menú
  isMenuOpen = false;
  
  // Estado del modal de transacciones
  showTransactionModal = false;

  constructor(private router: Router, private http: HttpClient) {
    this.getAllGategorias().subscribe(data => {
      console.log('Categorías obtenidas:', data);

    });
    this.getAllBilleteras().subscribe(data => {
      console.log('Billeteras obtenidas:', data);
    }
    );
  }

  getAllGategorias(): Observable<any> {
      return this.http.get<any[]>(`http://localhost:3000/api/categorias`);
    }


  getAllBilleteras(): Observable<any> {
      return this.http.get<any[]>(`http://localhost:3000/api/billeteras`);
    }

  // Datos del dashboard
  currentMonth = 'Junio 2025';
  income = 0;
  expenses = 4500;
  availableBalance = 37300;
  balanceChange = '+$200 vs mes anterior';



  // Movimientos recientes
  recentMovements = [
    {
      id: 1,
      type: 'expense',
      category: 'Supermercado',
      icon: 'mdi-cart',
      amount: -4500,
      date: 'Hoy, 14:30',
      color: '#FF6B6B'
    },
    {
      id: 2,
      type: 'income',
      category: 'Salario',
      icon: 'mdi-cash',
      amount: 45000,
      date: '28 Nov, 09:00',
      color: '#51CF66'
    },
    {
      id: 3,
      type: 'expense',
      category: 'Combustible',
      icon: 'mdi-gas-station',
      amount: -3200,
      date: 'Ayer, 08:15',
      color: '#74C0FC'
    }
  ];

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
    
    // Agregar la nueva transacción a la lista de movimientos recientes
    const newMovement = {
      id: this.recentMovements.length + 1,
      type: transaction.type,
      category: transaction.category,
      icon: this.getIconForCategory(transaction.category),
      amount: transaction.amount,
      date: this.formatDate(transaction.date),
      color: transaction.type === 'income' ? '#10b981' : this.getColorForCategory(transaction.category)
    };
    
    this.recentMovements.unshift(newMovement);
    
    // Actualizar los totales
    if (transaction.type === 'income') {
      this.income += transaction.amount;
    } else {
      this.expenses += Math.abs(transaction.amount);
    }
    
    this.closeTransactionModal();
  }

  private getIconForCategory(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Alimentación': 'mdi-cart',
      'Transporte': 'mdi-car',
      'Entretenimiento': 'mdi-movie',
      'Salud': 'mdi-medical-bag',
      'Educación': 'mdi-school',
      'Vivienda': 'mdi-home',
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
      'Otros': '#6b7280'
    };
    return colorMap[category] || '#6b7280';
  }

  private formatDate(dateString: string): string {
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