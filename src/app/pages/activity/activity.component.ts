import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { Subscription } from 'rxjs';
import { OperacionService } from '../../services/operacion.service';
import { Operacion } from '../../../models/operacion.model';
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
    private operacionService: OperacionService
  ) {}

  // Estado del menú
  isMenuOpen = false;

  // Suscripciones
  private subscription = new Subscription();

  // Operaciones agrupados
  groupedOperaciones: { date: string; operaciones: Operacion[] }[] = [];

  ngOnInit(): void {
    this.loadOperaciones();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadOperaciones(): void {
    // Cargar operaciones desde la API
    this.subscription.add(
      this.operacionService.getAllOperaciones().subscribe({
        next: (op) => {
          this.groupedOperaciones = this.groupOperacionesByDate(op);
        },
        error: (error) => {
          console.error('Error al cargar operaciones:', error);
        },
      })
    );
  }

  private groupOperacionesByDate(operaciones: Operacion[]): { date: string; operaciones: Operacion[] }[] {
    const groups: { [key: string]: Operacion[] } = {};

    operaciones.forEach((op) => {
      const dateKey = formatDate(op.fecha.toString());
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(op);
    });

    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.keys(groups)
      .map((date) => ({
        date: date,
        operaciones: groups[date],
      }))
      .sort((a, b) => {
        const dateA = new Date(
          operaciones.find((g) => formatDate(g.fecha.toString()) === a.date)?.fecha || ''
        );
        const dateB = new Date(
          operaciones.find((g) => formatDate(g.fecha.toString()) === b.date)?.fecha || ''
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
