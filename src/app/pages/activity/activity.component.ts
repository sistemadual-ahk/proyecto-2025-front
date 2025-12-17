import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { Subscription } from 'rxjs';
import { OperacionService } from '../../services/operacion.service';
import { Operacion } from '../../../models/operacion.model';
import { BilleteraService } from '../../services/billetera.service';
import { Billetera } from '../../../models/billetera.model';
import { formatDate } from '../../utils/formatDate';
import { EditOperationModal } from '../../components/edit-operation-modal/edit-operation-modal.component';
import { MatSelectModule } from '@angular/material/select';

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
    EditOperationModal,
    MatSelectModule
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})

export class ActivityComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private operacionService: OperacionService,
    private billeteraService: BilleteraService
  ) { }

  // Estado del menú
  isMenuOpen = false;

  // Suscripciones
  private subscription = new Subscription();

  // Operaciones agrupados
  groupedOperaciones: { date: string; operaciones: OperacionVista[] }[] = [];

  //input  
  searchTerm: string = '';
  
  // Filtros
  filterType: 'all' | 'income' | 'expense' = 'all';
  filterTime: 'historic' | 'month' | 'week' = 'month';
  filterWalletId: string = 'all';
  wallets: Billetera[] = [];

  // Paginación
  itemsToShow: number = 20;
  itemsIncrement: number = 20;
  isLoadingMore: boolean = false;
  hasMoreItems: boolean = true;
  private filteredOperaciones: OperacionVista[] = [];

  // Modal de edición
  showEditModal = false;
  selectedOperacion: OperacionVista | null = null;


  ngOnInit(): void {
    this.loadWallets();
    
    // Leer parámetros de consulta para filtro inicial
    this.subscription.add(
      this.route.queryParams.subscribe(params => {
        if (params['walletId']) {
          this.filterWalletId = params['walletId'];
        }
        this.loadOperaciones();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private allOperaciones: OperacionVista[] = [];

  private loadWallets(): void {
    this.subscription.add(
      this.billeteraService.getBilleteras().subscribe({
        next: (wallets) => {
          this.wallets = wallets;
        },
        error: (err) => console.error('Error loading wallets', err)
      })
    );
  }

  private loadOperaciones(): void {
    this.subscription.add(
      this.operacionService.getAllOperaciones().subscribe({
        next: (op) => {
          const operacionesVista = op.map((operacion) => this.mapOperacionParaVista(operacion));

          // 🔽 Ordenar por fecha DESC antes de agrupar
          const ordenadas = operacionesVista
            .slice()
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

          this.allOperaciones = ordenadas; 
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error al cargar operaciones:', error);
        },
      })
    );
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.allOperaciones;

    // 1. Filtro de búsqueda
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      filtered = filtered.filter(op =>
        (op.descripcion ?? '').toLowerCase().includes(term) ||
        (op.categoriaNombre ?? '').toLowerCase().includes(term)
      );
    }

    // 2. Filtro de tipo
    if (this.filterType !== 'all') {
      const typeMap: Record<string, string> = {
        'income': 'Ingreso',
        'expense': 'Egreso'
      };
      // Manejar tanto 'Ingreso'/'Egreso' como 'income'/'expense'
      filtered = filtered.filter(op => {
        const opType = op.tipo === 'income' ? 'Ingreso' : (op.tipo === 'expense' ? 'Egreso' : op.tipo);
        return opType === typeMap[this.filterType];
      });
    }

    // 3. Filtro de tiempo
    const now = new Date();
    if (this.filterTime === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(op => new Date(op.fecha) >= oneWeekAgo);
    } else if (this.filterTime === 'month') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filtered = filtered.filter(op => new Date(op.fecha) >= oneMonthAgo);
    }

    // 4. Filtro de billetera
    if (this.filterWalletId !== 'all') {
      filtered = filtered.filter(op => {
        const walletId = typeof op.billetera === 'object' && op.billetera !== null
          ? (op.billetera as any).id || (op.billetera as any)._id
          : op.billetera;
        return walletId === this.filterWalletId || op.billeteraId === this.filterWalletId;
      });
    }

    this.filteredOperaciones = filtered;
    this.itemsToShow = this.itemsIncrement; // Reset pagination
    this.updateGroupedOperaciones();
  }

  loadMore(): void {
    if (this.isLoadingMore || !this.hasMoreItems) return;
    
    this.isLoadingMore = true;
    // Simular carga para UX
    setTimeout(() => {
      this.itemsToShow += this.itemsIncrement;
      this.updateGroupedOperaciones();
      this.isLoadingMore = false;
    }, 500);
  }

  private updateGroupedOperaciones(): void {
    const visibleOps = this.filteredOperaciones.slice(0, this.itemsToShow);
    this.hasMoreItems = this.itemsToShow < this.filteredOperaciones.length;
    this.groupedOperaciones = this.groupOperacionesByDate(visibleOps);
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

  getBilleteraNombre(operacion: OperacionVista): string {
    if (typeof operacion.billetera === 'object' && operacion.billetera !== null) {
      const nombre = (operacion.billetera as any).nombre;
      if (nombre) return nombre;
    }

    const walletId = typeof operacion.billetera === 'object' && operacion.billetera !== null
      ? (operacion.billetera as any).id || (operacion.billetera as any)._id
      : operacion.billetera || operacion.billeteraId;

    if (!walletId) return 'Sin billetera';

    const wallet = this.wallets.find(w => w.id === walletId || (w as any)._id === walletId);
    return wallet?.nombre || 'Sin billetera';
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
