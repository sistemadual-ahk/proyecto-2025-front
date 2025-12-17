import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostBinding,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Objetivo, EstadoObjetivo } from '../../../models/objetivo.model';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-goal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule],
  templateUrl: './add-goal-modal.component.html',
  styleUrl: './add-goal-modal.component.scss',
})
export class AddGoalModalComponent implements OnInit, OnChanges {
  @Input() edit: boolean = false;
  @Input() objetivo?: Objetivo;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Objetivo>();
  @Output() delete = new EventEmitter<void>();

  @HostBinding('class.closing') isClosing = false;

  private elementRef = inject(ElementRef);

  @HostListener('click', ['$event'])
  onBackdropClick(event: MouseEvent) {
    if (event.target === this.elementRef.nativeElement) {
      this.onClose();
    }
  }

  // Campos del formulario
  montoObjetivo: number | null = null;
  montoActual: number = 0;
  categoriaId: string = '';
  color: string = '#E5E7EB';
  fechaInicio: string = '';
  fechaEsperadaFinalizacion: string = '';
  fechaFin?: string;
  titulo: string = '';
  estado: EstadoObjetivo = EstadoObjetivo.PENDIENTE;

  // Lista de categorías
  categorias: Categoria[] = [];

  // Opciones de colores predefinidos
  colorOptions: string[] = [
    '#8B5CF6', // Púrpura
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Ámbar
    '#EF4444', // Rojo
    '#EC4899', // Rosa
  ];

  constructor(private categoriaService: CategoriaService) {}

  // ✅ validación simple del form (ahora categoría es obligatoria)
  get isFormValid(): boolean {
    return (
      !!this.titulo.trim() &&
      !!this.montoObjetivo &&
      this.montoObjetivo > 0 &&
      !!this.fechaInicio &&
      !!this.fechaEsperadaFinalizacion &&
      !!this.categoriaId
    );
  }

  // ===================== CICLO DE VIDA =====================

  ngOnInit(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;

        if (this.edit && this.objetivo) {
          this.patchFromObjetivo(this.objetivo);
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.categorias = [];
      },
    });

    if (this.edit && this.objetivo) {
      this.patchFromObjetivo(this.objetivo);
    } else {
      this.fechaInicio = new Date().toISOString().split('T')[0];
      this.color = this.colorOptions[0];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objetivo'] && this.edit && this.objetivo) {
      this.patchFromObjetivo(this.objetivo);
    }
  }

  // ===================== HELPERS DE MAPEOS =====================

  private normalizeDate(value: any): string {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }

  private patchFromObjetivo(obj: Objetivo): void {
    const anyObj: any = obj;

    this.titulo = obj.titulo;
    this.montoObjetivo = obj.montoObjetivo;
    this.montoActual = obj.montoActual;

    this.categoriaId =
      (obj as any).categoriaId ||
      anyObj.categoriaId ||
      anyObj.categoria?._id ||
      anyObj.categoria?.id ||
      '';
    this.color = (obj as any).color || this.colorOptions[0];

    this.fechaInicio = this.normalizeDate(obj.fechaInicio as any);
    this.fechaEsperadaFinalizacion = this.normalizeDate(
      obj.fechaEsperadaFinalizacion as any
    );
    this.fechaFin = obj.fechaFin
      ? this.normalizeDate(obj.fechaFin as any)
      : undefined;

    this.estado = obj.estado;
  }

  // ===================== ACCIONES PRINCIPALES =====================

  onClose(): void {
    this.isClosing = true;
    setTimeout(() => {
      this.close.emit();
    }, 300);
  }

  onSave(): void {
    const objetoToSave: Objetivo = {
      id: this.objetivo?.id,
      titulo: this.titulo,
      montoObjetivo: this.montoObjetivo || 0,
      montoActual: this.montoActual,
      categoriaId: this.categoriaId,
      color: this.color,
      fechaInicio: this.fechaInicio,
      fechaEsperadaFinalizacion: this.fechaEsperadaFinalizacion,
      fechaFin: this.fechaFin,
      estado: this.estado,
    };

    this.save.emit(objetoToSave);
  }

  onDelete(): void {
    this.delete.emit();
  }

  // ===================== ESTADO / FECHAS =====================

  toggleEstado(): void {
    this.estado =
      this.estado === EstadoObjetivo.COMPLETADO
        ? EstadoObjetivo.PENDIENTE
        : EstadoObjetivo.COMPLETADO;

    if (this.estado === EstadoObjetivo.COMPLETADO && !this.fechaFin) {
      this.fechaFin = new Date().toISOString().split('T')[0];
    } else if (this.estado === EstadoObjetivo.PENDIENTE) {
      this.fechaFin = undefined;
    }
  }

  isCompleted(): boolean {
    return this.estado === EstadoObjetivo.COMPLETADO;
  }

  selectColor(selectedColor: string): void {
    this.color = selectedColor;
  }

  // ===================== CATEGORÍA =====================

  getSelectedCategory(): Categoria | undefined {
    if (!this.categoriaId) return undefined;
    return this.categorias.find(
      (c) => c.id === this.categoriaId || (c as any)._id === this.categoriaId
    );
  }
}
