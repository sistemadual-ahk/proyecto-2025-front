import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { Subscription } from 'rxjs';
import { OperacionService } from '../../services/operacion.service';
import { Operacion } from '../../../models/operacion.model';
import { formatDate } from '../../utils/formatDate';

type OperacionVista = Operacion & {
  categoriaNombre: string;
  categoriaColor: string;
  categoriaIcono: string;
};

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent, PageTitleComponent],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})

export class ActivityComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private operacionService: OperacionService
  ) { }

  // Estado del menú
  isMenuOpen = false;

  // Suscripciones
  private subscription = new Subscription();

  // Operaciones agrupados
  groupedOperaciones: { date: string; operaciones: OperacionVista[] }[] = [];

  //input  
  searchTerm: string = '';


  ngOnInit(): void {
    this.loadOperaciones();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private allOperaciones: OperacionVista[] = [];

  private loadOperaciones(): void {
    this.subscription.add(
      this.operacionService.getAllOperaciones().subscribe({
        next: (op) => {
          const operacionesVista = op.map((operacion) => this.mapOperacionParaVista(operacion));
          this.allOperaciones = operacionesVista;
          this.groupedOperaciones = this.groupOperacionesByDate(operacionesVista);
        },
        error: (error) => {
          console.error('Error al cargar operaciones:', error);
        },
      })
    );
  }


  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.groupedOperaciones = this.groupOperacionesByDate(this.allOperaciones);
      return;
    }


    const filtradas = this.allOperaciones.filter(op =>
      (op.descripcion ?? '').toLowerCase().includes(term) ||
      (op.categoriaNombre ?? '').toLowerCase().includes(term)
    );


    this.groupedOperaciones = this.groupOperacionesByDate(filtradas);
  }


  private groupOperacionesByDate(
    operaciones: OperacionVista[]
  ): { date: string; operaciones: OperacionVista[] }[] {
    const groups: { [key: string]: OperacionVista[] } = {};

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

  private mapOperacionParaVista(op: Operacion): OperacionVista {
    let categoriaNombre = 'Sin categoría';
    let categoriaColor = '#A8A8A8';
    let categoriaIcono = 'mdi mdi-dots-horizontal';

    if (typeof op.categoria === 'object' && op.categoria !== null) {
      const catObj: any = op.categoria;
      categoriaNombre = catObj.nombre || catObj._id || categoriaNombre;
      categoriaColor = catObj.color || categoriaColor;
      categoriaIcono = catObj.icono ? this.ensureMdiClass(catObj.icono) : categoriaIcono;
    } else if (typeof op.categoria === 'string' && op.categoria.trim()) {
      categoriaNombre = op.categoria.trim();
    } else if (op.categoriaId) {
      categoriaNombre = op.categoriaId;
    }

    return {
      ...op,
      categoriaNombre,
      categoriaColor,
      categoriaIcono,
    };
  }

  private ensureMdiClass(icon: string): string {
    if (!icon || !icon.trim()) return 'mdi mdi-dots-horizontal';
    const trimmed = icon.trim();
    if (trimmed.startsWith('mdi ')) return trimmed;
    if (trimmed.startsWith('mdi-')) return `mdi ${trimmed}`;
    return `mdi ${trimmed}`;
  }
}
