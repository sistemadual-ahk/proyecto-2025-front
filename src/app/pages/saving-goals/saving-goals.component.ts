import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { AddGoalModalComponent } from '../../components/add-goal-modal/add-goal-modal.component';
import { Objetivo, EstadoObjetivo } from '../../../models/objetivo.model';
import { Operacion } from '../../../models/operacion.model';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';

@Component({
  selector: 'app-saving-goals',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, PageTitleComponent, AddGoalModalComponent],
  templateUrl: './saving-goals.component.html',
  styleUrl: './saving-goals.component.scss',
})
export class SavingGoalsComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  
  // Estado del menú
  isMenuOpen = false;
  showAddGoal = false;
  isEditMode = false;
  selectedGoalId?: string;
  selectedGoal?: Objetivo;
  
  categorias: Categoria[] = [];

  // Datos de los objetivos de ahorro
  savingGoals: Objetivo[] = [
    {
      id: '1',
      titulo: 'Viaje a Brasil',
      montoActual: 1200,
      montoObjetivo: 3000,
      fechaInicio: '2024-01-01',
      fechaEsperadaFinalizacion: '2024-12-31',
      estado: EstadoObjetivo.PENDIENTE,
      operaciones: [] as Operacion[],
      color: 'var(--gastify-purple)',
    },
    {
      id: '2',
      titulo: 'Comprar guitarra',
      montoActual: 750,
      montoObjetivo: 1200,
      fechaInicio: '2024-02-01',
      fechaEsperadaFinalizacion: '2024-08-31',
      estado: EstadoObjetivo.COMPLETADO,
      operaciones: [] as Operacion[],
      color: 'var(--gastify-green)',
    },
  ];

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
      description: "Considera una 'espera de 48 horas' antes de adquirir objetos no esenciales",
    },
    {
      id: 3,
      icon: 'mdi-help-circle',
      title: 'Desafía tus gastos',
      description: '¿Puedes encontrar una alternativa más barata para ciertos servicios?',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.categoriaService.getCategorias().subscribe(cats => {
      this.categorias = cats;
    });
  }

  getCategory(id?: string): Categoria | undefined {
    if (!id) return undefined;
    return this.categorias.find(c => c.id === id);
  }

  // Métodos de navegación
  goBack() {
    this.router.navigate(['/home']);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // Métodos para objetivos
  addNewGoal() {
    this.isEditMode = false;
    this.selectedGoal = undefined;
    this.showAddGoal = true;
  }

  onCloseAddGoal() {
    this.showAddGoal = false;
    this.selectedGoal = undefined;
  }

  // Desplegable por objetivo
  toggleGoalMenu(goalId: string) {
    this.selectedGoalId = this.selectedGoalId === goalId ? undefined : goalId;
  }

  editGoal(goalId: string) {
    this.isEditMode = true;
    this.selectedGoal = this.savingGoals.find(g => g.id === goalId);
    this.showAddGoal = true;
    this.selectedGoalId = undefined;
  }

  deleteGoal(goalId: string) {
    this.savingGoals = this.savingGoals.filter(g => g.id !== goalId);
    this.selectedGoalId = undefined;
  }

  onDeleteGoal() {
    if (this.isEditMode && this.selectedGoal?.id) {
      this.deleteGoal(this.selectedGoal.id);
    }
    this.onCloseAddGoal();
  }

  onSaveGoal(goal: Objetivo) {
    if (this.isEditMode && this.selectedGoal?.id) {
      // Actualizar objetivo existente
      const index = this.savingGoals.findIndex(g => g.id === this.selectedGoal!.id);
      if (index !== -1) {
        this.savingGoals[index] = { ...goal, id: this.selectedGoal.id };
      }
    } else {
      // Crear nuevo objetivo
      const newGoal: Objetivo = {
        ...goal,
        id: Date.now().toString(),
      };
      this.savingGoals.push(newGoal);
    }
    this.onCloseAddGoal();
  }

  // Método para calcular el progreso
  getProgress(goal: Objetivo): number {
    if (goal.montoObjetivo <= 0 || goal.montoActual < 0) {
      return 0;
    }
    const progress = (goal.montoActual / goal.montoObjetivo) * 100;
    return Math.min(progress, 100);
  }

  // Método para alternar el estado del objetivo
  toggleGoalStatus(goal: Objetivo, event: Event) {
    event.stopPropagation();
    goal.estado = goal.estado === EstadoObjetivo.COMPLETADO 
      ? EstadoObjetivo.PENDIENTE 
      : EstadoObjetivo.COMPLETADO;
    
    // Si se marca como completado, establecer fecha de fin
    if (goal.estado === EstadoObjetivo.COMPLETADO && !goal.fechaFin) {
      goal.fechaFin = new Date().toISOString().split('T')[0];
    } else if (goal.estado === EstadoObjetivo.PENDIENTE) {
      goal.fechaFin = undefined;
    }
  }

  // Método para verificar si está completado
  isCompleted(goal: Objetivo): boolean {
    return goal.estado === EstadoObjetivo.COMPLETADO;
  }

  // Métodos para tips
  viewTip(tipId: number) {
    console.log('Ver tip:', tipId);
  }
}
