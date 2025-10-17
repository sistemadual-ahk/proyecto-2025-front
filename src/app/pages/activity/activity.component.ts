import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { Subscription } from 'rxjs';
import { GastoService } from '../../services/gasto.service';
import { Gasto } from '../../../models/gasto.model';
import { formatDate } from '../../utils/formatDate';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, PageTitleComponent],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
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
        },
      })
    );
  }

  private groupGastosByDate(gastos: Gasto[]): { date: string; gastos: Gasto[] }[] {
    const groups: { [key: string]: Gasto[] } = {};

    gastos.forEach((gasto) => {
      const dateKey = formatDate(gasto.datetime.toString());
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(gasto);
    });

    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.keys(groups)
      .map((date) => ({
        date: date,
        gastos: groups[date],
      }))
      .sort((a, b) => {
        const dateA = new Date(
          gastos.find((g) => formatDate(g.datetime.toString()) === a.date)?.datetime || ''
        );
        const dateB = new Date(
          gastos.find((g) => formatDate(g.datetime.toString()) === b.date)?.datetime || ''
        );
        return dateB.getTime() - dateA.getTime();
      });
  }

  formatearFecha(dateString: string): string {
    return formatDate(dateString);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
