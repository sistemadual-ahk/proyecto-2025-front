import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { AddGoalModalComponent } from '../../components/add-goal-modal/add-goal-modal.component';
import { GoalOperationsModalComponent } from '../../components/goal-operations-modal/goal-operations-modal.component';

import { Objetivo, EstadoObjetivo } from '../../../models/objetivo.model';
import { Operacion } from '../../../models/operacion.model';
import { ObjetivoService } from '../../services/objetivo.service';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { Billetera } from '../../../models/billetera.model';
import { BilleteraService } from '../../services/billetera.service';
import { OperacionService } from '../../services/operacion.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-saving-goals',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    PageTitleComponent,
    AddGoalModalComponent,
    GoalOperationsModalComponent,
  ],
  templateUrl: './saving-goals.component.html',
  styleUrl: './saving-goals.component.scss',
})
export class SavingGoalsComponent implements OnInit {
  // Estado del menú
  isMenuOpen = false;
  showAddGoal = false;
  isEditMode = false;
  selectedGoalId?: string;
  selectedGoal?: Objetivo;
  showGoalOperations = false;
  selectedGoalForOps?: Objetivo;

  // Datos reales
  savingGoals: Objetivo[] = [];

  // Categorías para icono/color
  categorias: Categoria[] = [];

  // Estado de carga / error simple
  isLoading = false;
  loadError?: string;
  defaultWalletId?: string;

  // Tips de ahorro
  savingTips = [
    {
      id: 1,
      icon: 'mdi-bell-ring',
      title: 'Intenta ahorrar automáticamente',
      description:
        'Programa transferencias periódicas a tus objetivos para alcanzarlos más rápidamente',
    },
    {
      id: 2,
      icon: 'mdi-thought-bubble',
      title: 'Reduce las compras impulsivas',
      description:
        "Considera una 'espera de 48 horas' antes de adquirir objetos no esenciales",
    },
    {
      id: 3,
      icon: 'mdi-help-circle',
      title: 'Desafía tus gastos',
      description:
        '¿Puedes encontrar una alternativa más barata para ciertos servicios?',
    },
  ];

  constructor(
    private router: Router,
    private objetivoService: ObjetivoService,
    private categoriaService: CategoriaService,
    private billeteraService: BilleteraService,
    private operacionService: OperacionService
  ) {}

  ngOnInit(): void {
    this.loadDefaultWallet();
    this.loadGoals();
    this.loadCategorias();
  }

  // ----------------- Helpers internos -----------------

  private normalizeObjetivoFromApi(raw: any): Objetivo {
    return {
      ...raw,
      id: raw.id || raw._id,
      categoriaId:
        raw.categoriaId ||
        raw.categoria?._id ||
        raw.categoria?.id ||
        undefined,
      billeteraId:
        raw.billeteraId ||
        raw.billetera?._id ||
        raw.billetera?.id ||
        undefined,
    } as Objetivo;
  }

  private normalizeOperacionFromApi(raw: any): Operacion {
    const fechaStr =
      typeof raw.fecha === 'string'
        ? raw.fecha.split('T')[0]
        : new Date(raw.fecha).toISOString().split('T')[0];

    return {
      ...raw,
      id: raw.id || raw._id,
      _id: raw._id,
      monto: Number(raw.monto) || 0,
      fecha: fechaStr,
      categoriaId:
        raw.categoriaId ||
        raw.categoria?._id ||
        raw.categoria?.id ||
        undefined,
      billeteraId:
        raw.billeteraId ||
        raw.billetera?._id ||
        raw.billetera?.id ||
        undefined,
    } as Operacion;
  }

  // ----------------- Carga de datos -----------------

  private loadDefaultWallet(): void {
    this.billeteraService.getBilleteras().subscribe({
      next: (billeteras: Billetera[]) => {
        const def = billeteras.find((b) => (b as any).isDefault);
        if (def) {
          this.defaultWalletId = def.id;
        } else if (billeteras.length > 0) {
          // Fallback a la primera billetera si no hay default
          this.defaultWalletId = billeteras[0].id;
          console.warn('No se encontró billetera default, usando la primera disponible:', billeteras[0].nombre);
        } else {
          console.warn('No se encontró billetera default para el usuario');
        }
      },
      error: (err) => {
        console.error('Error al cargar billeteras', err);
      },
    });
  }

  private loadGoals(): void {
    this.isLoading = true;
    this.loadError = undefined;

    this.objetivoService.getObjetivos().subscribe({
      next: (objetivos) => {
        this.savingGoals = (objetivos || []).map((o) =>
          this.normalizeObjetivoFromApi(o)
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar objetivos', err);
        this.loadError = 'No se pudieron cargar los objetivos.';
        this.isLoading = false;
      },
    });
  }

  private loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias || [];
      },
      error: (err) => {
        console.error('Error al cargar categorías', err);
        this.categorias = [];
      },
    });
  }

  // Helper para el template
  getCategory(categoriaId?: string): Categoria | undefined {
    if (!categoriaId) return undefined;
    return this.categorias.find((c) => c.id === categoriaId);
  }

  // ----------------- Navegación -----------------

  goBack() {
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // ----------------- Objetivos -----------------

  addNewGoal() {
    this.isEditMode = false;
    this.selectedGoal = undefined;
    this.showAddGoal = true;
  }

  onCloseAddGoal() {
    this.showAddGoal = false;
    this.selectedGoal = undefined;
    this.loadGoals();
  }

  toggleGoalMenu(goalId: string) {
    this.selectedGoalId = this.selectedGoalId === goalId ? undefined : goalId;
  }

  editGoal(goalId: string) {
    this.isEditMode = true;
    this.showAddGoal = true;
    this.selectedGoalId = undefined;
    this.selectedGoal = undefined;

    this.objetivoService.getObjetivoById(goalId).subscribe({
      next: (resp) => {
        const raw = (resp as any).data ?? resp;

        const objetivo = this.normalizeObjetivoFromApi(raw);
        const opsRaw: any[] = raw.operaciones || [];

        objetivo.operaciones = opsRaw.map((op) =>
          this.normalizeOperacionFromApi(op)
        );

        this.selectedGoal = objetivo;
      },
      error: (err) => {
        console.error('Error al obtener objetivo con operaciones', err);
      },
    });
  }

  openGoalOperations(goalId: string) {
    this.showGoalOperations = true;
    this.selectedGoalForOps = undefined;

    this.objetivoService.getObjetivoById(goalId).subscribe({
      next: (resp) => {
        const raw = (resp as any).data ?? resp;
        const objetivo = this.normalizeObjetivoFromApi(raw);
        const opsRaw: any[] = raw.operaciones || [];

        objetivo.operaciones = opsRaw.map((op) =>
          this.normalizeOperacionFromApi(op)
        );

        this.selectedGoalForOps = objetivo;
      },
      error: (err) => {
        console.error('Error al obtener operaciones del objetivo', err);
        this.showGoalOperations = false;
      },
    });
  }

  deleteGoal(goalId: string) {
    this.objetivoService.deleteObjetivo(goalId).subscribe({
      next: () => {
        this.savingGoals = this.savingGoals.filter((g) => g.id !== goalId);
        this.selectedGoalId = undefined;
      },
      error: (err) => {
        console.error('Error al eliminar objetivo', err);
      },
    });
  }

  onDeleteGoal() {
    if (this.isEditMode && this.selectedGoal?.id) {
      this.deleteGoal(this.selectedGoal.id);
    }
    this.onCloseAddGoal();
  }

  onCloseGoalOperations() {
    this.showGoalOperations = false;
    this.selectedGoalForOps = undefined;
  }

  onSaveGoalOperations(operaciones: Operacion[]) {
    if (!this.selectedGoalForOps?.id) {
      console.warn('No hay objetivo seleccionado para guardar operaciones');
      this.onCloseGoalOperations();
      return;
    }

    this.syncOperacionesForObjetivo(this.selectedGoalForOps, operaciones);
    this.onCloseGoalOperations();
  }

  // ----------------- GUARDAR OBJETIVO + OPERACIONES -----------------

  onSaveGoal(goal: Objetivo) {
    if (this.isEditMode && this.selectedGoal?.id) {
      const payload: any = {
        titulo: goal.titulo,
        montoObjetivo: goal.montoObjetivo,
        categoriaId: goal.categoriaId,
        billeteraId: goal.billeteraId,
        fechaInicio: goal.fechaInicio,
        fechaEsperadaFinalizacion: goal.fechaEsperadaFinalizacion,
        fechaFin: goal.fechaFin,
        estado: goal.estado,
      };

      this.objetivoService
        .updateObjetivo(this.selectedGoal.id, payload)
        .subscribe({
          next: (updated) => {
            const rawData = (updated as any).data ?? updated;
            
            if (!rawData) {
              console.warn('Respuesta vacía al actualizar objetivo');
              this.onCloseAddGoal();
              return;
            }
            
            const objetivoActualizado = this.normalizeObjetivoFromApi(rawData);
            
            if (!objetivoActualizado || !objetivoActualizado.id) {
              console.warn('No se pudo normalizar el objetivo actualizado');
              this.onCloseAddGoal();
              return;
            }

            const index = this.savingGoals.findIndex(
              (g) => g.id === this.selectedGoal!.id
            );
            if (index !== -1) {
              this.savingGoals[index] = objetivoActualizado;
            }
            this.onCloseAddGoal();
          },
          error: (err) => {
            console.error('Error al actualizar objetivo', err);
          },
        });
    } else {
      const billeteraId = goal.billeteraId || this.defaultWalletId;

      if (!billeteraId) {
        alert('No se puede crear el objetivo porque no tienes ninguna billetera registrada. Por favor crea una billetera primero.');
        console.error(
          'No hay billeteraId para crear objetivo (ni seleccionada ni default)'
        );
        return;
      }

      if (!goal.categoriaId) {
        alert('Debes seleccionar una categoría para el objetivo.');
        console.error('Debe seleccionar una categoría para el objetivo');
        return;
      }

      const payload: any = {
        titulo: goal.titulo,
        montoObjetivo: goal.montoObjetivo,
        billeteraId,
        categoriaId: goal.categoriaId,
        fechaInicio: goal.fechaInicio,
        fechaEsperadaFinalizacion: goal.fechaEsperadaFinalizacion,
        fechaFin: goal.fechaFin,
      };

      this.objetivoService.createObjetivo(payload).subscribe({
        next: (created) => {
          const rawData = (created as any).data ?? created;
          
          if (!rawData) {
            console.warn('Respuesta vacía al crear objetivo');
            this.onCloseAddGoal();
            return;
          }
          
          const objetivoCreado = this.normalizeObjetivoFromApi(rawData);
          
          if (!objetivoCreado || !objetivoCreado.id) {
            console.warn('No se pudo normalizar el objetivo creado');
            this.onCloseAddGoal();
            return;
          }

          this.savingGoals.push(objetivoCreado);
          this.onCloseAddGoal();
        },
        error: (err) => {
          console.error('Error al crear objetivo', err);
        },
      });
    }
  }

  /**
   * Sincroniza las operaciones del objetivo:
   * - Crea operaciones nuevas (sin _id)
   * - Elimina operaciones que fueron borradas (compara con las del objetivo original)
   * Al terminar, refrescamos el objetivo desde el back
   */
  private syncOperacionesForObjetivo(
    objetivo: Objetivo,
    operaciones: Operacion[]
  ): void {
    if (!objetivo.id) return;

    const createOps$: any[] = [];
    const deleteOps$: any[] = [];

    // Operaciones originales (las que estaban antes)
    const originalOpIds = (objetivo.operaciones || [])
      .map((op) => op._id || op.id)
      .filter((id) => id);

    // Operaciones actuales (las que hay ahora)
    const currentOpIds = operaciones
      .map((op) => op._id || op.id)
      .filter((id) => id);

    // Detectar operaciones eliminadas (estaban antes pero ya no están)
    const deletedOpIds = originalOpIds.filter((id) => !currentOpIds.includes(id));

    // Crear solicitudes de eliminación para operaciones borradas
    for (const deletedId of deletedOpIds) {
      if (deletedId) {
        deleteOps$.push(this.operacionService.deleteOperacion(deletedId));
      }
    }

    // Crear solicitudes de creación para operaciones nuevas
    for (const op of operaciones) {
      // Si ya existe en back, no la recreamos
      if (op._id || (op as any).id) continue;

      const categoriaId = op.categoriaId || objetivo.categoriaId;
      const billeteraId = op.billeteraId || objetivo.billeteraId;

      if (!categoriaId) {
        console.warn(
          'No se puede crear operación del objetivo porque no tiene categoriaId ni la del objetivo',
          op
        );
        continue;
      }

      if (!billeteraId) {
        console.warn(
          'No se puede crear operación del objetivo porque no tiene billeteraId ni la del objetivo',
          op
        );
        continue;
      }

      const payload: Partial<Operacion> = {
        monto: op.monto,
        tipo: op.tipo,
        descripcion: op.descripcion,
        categoriaId,
        billeteraId,
        objetivo: objetivo.id,
      };

      createOps$.push(this.operacionService.createOperacion(payload));
    }

    // Combinar todas las solicitudes (crear + eliminar)
    const allOps$ = [...createOps$, ...deleteOps$];

    // Si no hay operaciones que crear ni eliminar, solo refrescar
    if (allOps$.length === 0) {
      this.refreshObjetivoAfterSync(objetivo.id);
      return;
    }

    forkJoin(allOps$).subscribe({
      next: () => {
        this.refreshObjetivoAfterSync(objetivo.id!);
      },
      error: (err) => {
        console.error('Error al sincronizar operaciones del objetivo', err);
      },
    });
  }

  private refreshObjetivoAfterSync(objetivoId: string): void {
    this.objetivoService.getObjetivoById(objetivoId).subscribe({
      next: (resp) => {
        const rawObj = (resp as any).data ?? resp;

        if (!rawObj) {
          console.warn('Respuesta vacía al refrescar objetivo');
          return;
        }

        const objetivoActualizado = this.normalizeObjetivoFromApi(rawObj);

        if (!objetivoActualizado || !objetivoActualizado.id) {
          console.warn('No se pudo normalizar el objetivo actualizado');
          return;
        }

        const opsRaw: any[] = rawObj.operaciones || [];
        objetivoActualizado.operaciones = opsRaw.map((op) =>
          this.normalizeOperacionFromApi(op)
        );

        // Actualizar estado si se completó el objetivo
        if (objetivoActualizado.montoActual >= objetivoActualizado.montoObjetivo) {
          if (objetivoActualizado.estado !== EstadoObjetivo.COMPLETADO) {
            objetivoActualizado.estado = EstadoObjetivo.COMPLETADO;
            // Actualizar en el backend
            this.objetivoService.updateObjetivo(objetivoActualizado.id!, {
              estado: EstadoObjetivo.COMPLETADO
            }).subscribe({
              next: () => console.log('Estado actualizado a COMPLETADO'),
              error: (err) => console.error('Error al actualizar estado', err)
            });
          }
        }

        const idx = this.savingGoals.findIndex(
          (g) => g.id === objetivoActualizado.id
        );

        if (idx !== -1) {
          this.savingGoals[idx] = objetivoActualizado;
        } else {
          this.savingGoals.push(objetivoActualizado);
        }

        if (
          this.selectedGoal &&
          this.selectedGoal.id === objetivoActualizado.id
        ) {
          this.selectedGoal = objetivoActualizado;
        }

        if (
          this.selectedGoalForOps &&
          this.selectedGoalForOps.id === objetivoActualizado.id
        ) {
          this.selectedGoalForOps = objetivoActualizado;
        }
      },
      error: (err) => {
        console.error(
          'Error al refrescar objetivo tras sincronizar operaciones',
          err
        );
      },
    });
  }

  // ----------------- Helpers de UI -----------------

  getProgress(goal: Objetivo): number {
    if (goal.montoObjetivo <= 0) {
      return 0;
    }
    const progress = (goal.montoActual / goal.montoObjetivo) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  isCompleted(goal: Objetivo): boolean {
    const completed = goal.estado === EstadoObjetivo.COMPLETADO;
    console.log('Goal:', goal.titulo, 'Estado:', goal.estado, 'isCompleted:', completed);
    return completed;
  }

  viewTip(tipId: number) {
    console.log('Ver tip:', tipId);
  }
}
