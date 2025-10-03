import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { Subscription } from 'rxjs';
import { GastoService } from '../../services/gasto.service';
import { Gasto } from '../../../models/gasto.model';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss'
})
export class ActivityComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private gastoService: GastoService
  ) {}

  // Estado del menú
  isMenuOpen = false;

  // Suscripciones
  private subscription = new Subscription();

  // Gastos agrupados
  groupedGastos: { date: string; gastos: Gasto[] }[] = [];

  ngOnInit(): void {
    this.loadGastos();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadGastos(): void {
    // Cargar gastos desde la API
    this.subscription.add(
      this.gastoService.getAllGastos().subscribe({
        next: (gastos) => {
          this.groupedGastos = this.groupGastosByDate(gastos);
        },
        error: (error) => {
          console.error('Error al cargar gastos:', error);
        }
      })
    );
  }

  private groupGastosByDate(gastos: Gasto[]): { date: string; gastos: Gasto[] }[] {
    const groups: { [key: string]: Gasto[] } = {};
    
    gastos.forEach(gasto => {
      const dateKey = this.formatDate(gasto.datetime.toString());
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(gasto);
    });
    
    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.keys(groups)
      .map(date => ({
        date: date,
        gastos: groups[date]
      }))
      .sort((a, b) => {
        const dateA = new Date(gastos.find(g => this.formatDate(g.datetime.toString()) === a.date)?.datetime || '');
        const dateB = new Date(gastos.find(g => this.formatDate(g.datetime.toString()) === b.date)?.datetime || '');
        return dateB.getTime() - dateA.getTime();
      });
  }

  // Función para formatear la fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  }

  // Función para obtener el ícono de la categoría
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Alimentación': 'mdi-food',
      'Transporte': 'mdi-car',
      'Entretenimiento': 'mdi-movie',
      'Salud': 'mdi-medical-bag',
      'Educación': 'mdi-school',
      'Vivienda': 'mdi-home',
      'Ingresos': 'mdi-cash-plus',
      'Otros': 'mdi-dots-horizontal'
    };
    return icons[category] || 'mdi-dots-horizontal';
  }

  // Función para obtener el color de la categoría
  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Alimentación': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Entretenimiento': '#45B7D1',
      'Salud': '#96CEB4',
      'Educación': '#FFEAA7',
      'Vivienda': '#DDA0DD',
      'Ingresos': '#3DCD99',
      'Otros': '#A8A8A8'
    };
    return colors[category] || '#A8A8A8';
  }

  // Métodos para el menú
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout(): void {
    console.log('Logout');
    this.router.navigate(['/']);
  }

  // Métodos para acciones
  openNotifications() {
    console.log('Abrir notificaciones');
  }

  openProfile() {
    console.log('Abrir perfil');
  }

  // Métodos para navegación
  openGoals() {
    console.log('Abrir objetivos');
    this.router.navigate(['/saving-goals']);
  }

  openWallets() {
    console.log('Abrir billeteras');
    this.router.navigate(['/wallets']);
  }

  goBack() {
    // Agregar clase de transición antes de navegar
    document.body.classList.add('page-transition');
    
    setTimeout(() => {
      this.router.navigate(['/home']);
      // Remover la clase después de la navegación
      setTimeout(() => {
        document.body.classList.remove('page-transition');
      }, 300);
    }, 150);
  }
}
