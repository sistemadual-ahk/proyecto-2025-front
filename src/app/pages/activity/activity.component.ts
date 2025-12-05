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
import { EditOperationModal } from '../../components/edit-operation-modal/edit-operation-modal.component';

type OperacionVista = Operacion & {
  categoriaNombre: string;
  categoriaColor: string;
  categoriaIcono: string;
};

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    SidebarComponent, 
    PageTitleComponent,
    EditOperationModal
  ],
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
  
  // Modal de edición
  showEditModal = false;
  selectedOperacion: OperacionVista | null = null;


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

          // 🔽 Ordenar por fecha DESC antes de agrupar
          const ordenadas = operacionesVista
            .slice()
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

          this.allOperaciones = ordenadas; // útil si usás búsqueda
          this.groupedOperaciones = this.groupOperacionesByDate(ordenadas);
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

    // Agrupar por fecha "formateada" para header visual,
    // pero conservar dentro del grupo el orden del array (ya está descendente)
    operaciones.forEach((op) => {
      const dateKey = formatDate(op.fecha.toString()); // ej: "Hoy", "Ayer" o "25 nov 2025"
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(op);
    });

    // Convertir a array y ordenar grupos por fecha real desc:
    // Tomamos el máximo timestamp de cada grupo para ordenarlos.
    return Object.keys(groups)
      .map((date) => ({
        date,
        operaciones: groups[date],
        // timestamp máximo del grupo:
        _maxTs: Math.max(...groups[date].map((g) => new Date(g.fecha).getTime())),
      }))
      .sort((a, b) => b._maxTs - a._maxTs)
      .map(({ date, operaciones }) => ({ date, operaciones }));
  }


  formatearFecha(dateString: string): string {
    return formatDate(dateString);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  openEditOperationModal(operacion: OperacionVista): void {
    console.log('Abriendo modal con operación:', operacion);
    console.log('ID de operación:', operacion._id || operacion.id);
    this.selectedOperacion = operacion;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedOperacion = null;
  }

  onOperationUpdated(): void {
    this.loadOperaciones();
  }

  onOperationDeleted(): void {
    this.loadOperaciones();
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
