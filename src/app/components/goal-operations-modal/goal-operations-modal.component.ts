import {
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

import { Objetivo } from '../../../models/objetivo.model';
import { Operacion } from '../../../models/operacion.model';
import { BilleteraService } from '../../services/billetera.service';
import { Billetera } from '../../../models/billetera.model';

type UiMessageType = 'error' | 'warn';

@Component({
  selector: 'app-goal-operations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule],
  templateUrl: './goal-operations-modal.component.html',
  styleUrl: './goal-operations-modal.component.scss',
})
export class GoalOperationsModalComponent implements OnInit, OnChanges {
  @Input() objetivo?: Objetivo;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Operacion[]>();

  @HostBinding('class.closing') isClosing = false;

  private billeteraService = inject(BilleteraService);
  private elementRef = inject(ElementRef);

  @HostListener('click', ['$event'])
  onBackdropClick(event: MouseEvent) {
    if (event.target === this.elementRef.nativeElement) {
      this.onClose();
    }
  }

  operaciones: Operacion[] = [];
  billeteras: Billetera[] = [];
  editingIndex: number | null = null;

  // ✅ Mensajes UI
  uiMessage: string = '';
  uiMessageType: UiMessageType = 'error';
  suggestedMonto: number | null = null;

  ngOnInit(): void {
    if (this.objetivo) this.patchFromObjetivo(this.objetivo);
    this.loadBilleteras();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['objetivo'] && this.objetivo) {
      this.patchFromObjetivo(this.objetivo);
    }
  }

  // ✅ HOY Argentina en YYYY-MM-DD
  private getTodayAR(): string {
    const now = new Date();
    const argentinaTime = new Date(
      now.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
    );

    const year = argentinaTime.getFullYear();
    const month = String(argentinaTime.getMonth() + 1).padStart(2, '0');
    const day = String(argentinaTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private loadBilleteras(): void {
    this.billeteraService.getBilleteras().subscribe((data) => {
      this.billeteras = data.filter((b) => b.id !== '0');

      // Si ya hay operaciones pendientes sin billetera/fecha -> set default
      this.operaciones = this.operaciones.map((op) => {
        const fixed: Operacion = { ...op };

        if (!fixed.billeteraId) {
          const def = this.billeteras.find((b) => b.isDefault) || this.billeteras[0];
          fixed.billeteraId = def?.id;
          (fixed as any).billetera = def?.id; // compat
        }

        if (!fixed.fecha) fixed.fecha = this.getTodayAR();

        return fixed;
      });
    });
  }

  onClose(): void {
    this.isClosing = true;
    setTimeout(() => this.close.emit(), 300);
  }

  // ✅ Guardar todo: aplica caps, valida y filtra montos 0
  onSave(): void {
    this.clearUiMessage();

    // 1) aplicar ajustes/caps a todas las pendientes
    for (let i = 0; i < this.operaciones.length; i++) {
      const op = this.operaciones[i];
      if (op._id || op.id) continue;

      const ok = this.validateAdjustAndMaybeBlock(i, {
        autoAdjust: true,
        allowDeleteIfZeroRemaining: true,
      });

      if (!ok) {
        this.editingIndex = i;
        return;
      }
    }

    // 2) no guardar pendientes con monto <= 0
    const opsToSave = this.operaciones.filter((op) => {
      const m = Number(op.monto) || 0;
      if (op._id || op.id) return true;
      return m > 0;
    });

    // 3) anti-negativo global por seguridad
    const base = this.objetivo?.montoActual ?? 0;
    const finalPreview = base + this.pendingDelta;

    if (finalPreview < 0) {
      const offenderIndex = this.findFirstOffenderIndex();
      if (offenderIndex !== null) {
        this.setNegativeLimitMessage(offenderIndex);
        this.editingIndex = offenderIndex;
      } else {
        this.setUiMessage('No se puede guardar: el objetivo quedaría en negativo.', 'error', null);
      }
      return;
    }

    this.save.emit(opsToSave);
  }

  // ===================== DELTAS / PREVIEW =====================

  /**
   * ✅ LÓGICA DE OBJETIVO (según tu UI):
   * - tipo === 'Egreso'  (botón IZQ "Agregar Ingreso") => SUMA al objetivo
   * - tipo === 'Ingreso' (botón DER "Agregar Gasto")   => RESTA al objetivo
   */
  private goalDeltaFor(op: Operacion): number {
    const monto = Number(op.monto) || 0;
    const tipo = op.tipo;

    const isEgreso = tipo === 'Egreso' || tipo === 'expense';
    const isIngreso = tipo === 'Ingreso' || tipo === 'income';

    if (isEgreso) return +monto;   // ✅ aporta (sube objetivo)
    if (isIngreso) return -monto;  // ✅ retira (baja objetivo)

    return -monto;
  }

  get pendingDelta(): number {
    return this.operaciones.reduce((total, op) => {
      if (op._id || op.id) return total;
      return total + this.goalDeltaFor(op);
    }, 0);
  }

  get previewMontoActual(): number {
    const base = this.objetivo?.montoActual || 0;
    return base + this.pendingDelta;
  }

  // ===================== UI HELPERS =====================

  formatDateSafe(fecha?: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) return 'Hoy';
    if (dateOnly.getTime() === yesterdayOnly.getTime()) return 'Ayer';

    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  /**
   * ✅ OJO: se usa SOLO para UI (píldora + / - + colores)
   * En tu pantalla, lo "verde / Ingreso" es el botón IZQ => tipo 'Egreso'
   */
  isIngreso(operacion: Operacion): boolean {
    return operacion.tipo === 'Egreso' || operacion.tipo === 'expense';
  }

  // ===================== CRUD OPERACIONES =====================

  addOperacion(): void {
    this.clearUiMessage();

    const localDateString = this.getTodayAR();
    const defaultWallet = this.billeteras.find((b) => b.isDefault) || this.billeteras[0];

    // ✅ default: botón IZQ (Agregar Ingreso) => tipo 'Egreso'
    const defaultTipo: Operacion['tipo'] = 'Egreso';

    const newOperacion: Operacion = {
      tipo: defaultTipo,
      monto: 0,
      descripcion: this.buildDefaultDescripcion(defaultTipo),
      fecha: localDateString,
      billeteraId: defaultWallet?.id,
      billetera: defaultWallet?.id as any,
    };

    this.operaciones.push(newOperacion);
    this.editingIndex = this.operaciones.length - 1;
  }

  startEditOperacion(index: number): void {
    this.clearUiMessage();
    this.editingIndex = index;
  }

  saveOperacion(): void {
    if (this.editingIndex === null) return;

    const ok = this.validateAdjustAndMaybeBlock(this.editingIndex, {
      autoAdjust: true,
      allowDeleteIfZeroRemaining: true,
    });

    if (!ok) return;

    this.editingIndex = null;
  }

  deleteOperacion(index: number): void {
    this.operaciones.splice(index, 1);
    this.operaciones = [...this.operaciones];
    this.editingIndex = null;
    this.clearUiMessage();
  }

  /**
   * ✅ Toggle: IZQ = Egreso, DER = Ingreso (como pediste)
   */
  toggleTipo(operacion: Operacion): void {
    this.clearUiMessage();

    const oldTipo = operacion.tipo;
    const newTipo: Operacion['tipo'] =
      oldTipo === 'Egreso' || oldTipo === 'expense' ? 'Ingreso' : 'Egreso';

    const autoIngreso = this.buildDefaultDescripcion('Ingreso');
    const autoEgreso = this.buildDefaultDescripcion('Egreso');
    const desc = operacion.descripcion || '';

    if (!desc || desc === autoIngreso || desc === autoEgreso) {
      operacion.descripcion = this.buildDefaultDescripcion(newTipo);
    }

    operacion.tipo = newTipo;

    if (this.editingIndex !== null) {
      this.validateAdjustAndMaybeBlock(this.editingIndex, {
        autoAdjust: true,
        allowDeleteIfZeroRemaining: false,
      });
    }
  }

  onMontoFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  onDateChange(operacion: Operacion): void {
    if (operacion.fecha) {
      const date = new Date(operacion.fecha);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      operacion.fecha = `${year}-${month}-${day}`;
    } else {
      operacion.fecha = this.getTodayAR();
    }
  }

  applySuggestedMonto(index: number): void {
    if (this.suggestedMonto === null) return;
    this.operaciones[index].monto = Number(this.suggestedMonto.toFixed(2));
    this.validateAdjustAndMaybeBlock(index, { autoAdjust: true, allowDeleteIfZeroRemaining: true });
  }

  // ===================== VALIDACIONES =====================

  /**
   * Reglas con esta pantalla:
   * - tipo 'Egreso' (botón IZQ "Agregar Ingreso") => SUMA => cap a meta
   * - tipo 'Ingreso' (botón DER "Agregar Gasto")  => RESTA => anti-negativo
   */
  private validateAdjustAndMaybeBlock(
    index: number,
    opts: { autoAdjust: boolean; allowDeleteIfZeroRemaining: boolean }
  ): boolean {
    this.clearUiMessage();

    const objetivo = this.objetivo;
    if (!objetivo) return true;

    const base = objetivo.montoActual ?? 0;

    const deltaExcept = this.operaciones.reduce((acc, op, i) => {
      if (i === index) return acc;
      if (op._id || op.id) return acc;
      return acc + this.goalDeltaFor(op);
    }, 0);

    const op = this.operaciones[index];
    if (!op.fecha) op.fecha = this.getTodayAR();

    const tipo = op.tipo;
    const monto = Number(op.monto) || 0;

    const isEgreso = tipo === 'Egreso' || tipo === 'expense';   // suma
    const isIngreso = tipo === 'Ingreso' || tipo === 'income';  // resta

    const currentWithoutThis = base + deltaExcept;

    // 1) CAP A META (solo cuando SUMA: Egreso)
    if (isEgreso) {
      const meta = Number(objetivo.montoObjetivo) || 0;
      const restante = Math.max(0, meta - currentWithoutThis);

      if (restante <= 0) {
        if (opts.allowDeleteIfZeroRemaining && !(op._id || op.id)) {
          this.operaciones.splice(index, 1);
          this.operaciones = [...this.operaciones];
          this.editingIndex = null;
        } else {
          op.monto = 0;
        }

        this.setUiMessage('El objetivo ya está completo. No se puede agregar más.', 'warn', null);
        return false;
      }

      if (monto > restante) {
        if (opts.autoAdjust) {
          op.monto = Number(restante.toFixed(2));
          this.setUiMessage(
            `El monto supera lo necesario. Se ajustó automáticamente a $${restante.toFixed(2)}.`,
            'warn',
            null
          );
          return true;
        } else {
          this.setUiMessage(
            `El monto supera lo necesario. El máximo permitido es $${restante.toFixed(2)}.`,
            'error',
            restante
          );
          return false;
        }
      }

      if (monto <= 0 && !(op._id || op.id)) {
        this.setUiMessage('El monto debe ser mayor a 0 para registrar la operación.', 'warn', null);
        return false;
      }

      return true;
    }

    // 2) ANTI-NEGATIVO (cuando RESTA: Ingreso)
    if (isIngreso) {
      const next = currentWithoutThis + this.goalDeltaFor(op); // resta
      if (next >= 0) return true;

      const max = Math.max(0, currentWithoutThis);
      this.setUiMessage(
        `No se puede: supera el máximo. El límite para retirar es $${max.toFixed(2)}.`,
        'error',
        max
      );
      return false;
    }

    // fallback
    const next = currentWithoutThis + this.goalDeltaFor(op);
    if (next < 0) {
      const max = Math.max(0, currentWithoutThis);
      this.setUiMessage(
        `No se puede: supera el máximo. El límite es $${max.toFixed(2)}.`,
        'error',
        max
      );
      return false;
    }

    return true;
  }

  private findFirstOffenderIndex(): number | null {
    const base = this.objetivo?.montoActual ?? 0;

    for (let i = 0; i < this.operaciones.length; i++) {
      const op = this.operaciones[i];
      if (op._id || op.id) continue;

      const deltaExcept = this.operaciones.reduce((acc, op2, j) => {
        if (j === i) return acc;
        if (op2._id || op2.id) return acc;
        return acc + this.goalDeltaFor(op2);
      }, 0);

      const next = base + deltaExcept + this.goalDeltaFor(op);
      if (next < 0) return i;
    }

    return null;
  }

  private setNegativeLimitMessage(index: number): void {
    const base = this.objetivo?.montoActual ?? 0;

    const deltaExcept = this.operaciones.reduce((acc, op, i) => {
      if (i === index) return acc;
      if (op._id || op.id) return acc;
      return acc + this.goalDeltaFor(op);
    }, 0);

    const max = Math.max(0, base + deltaExcept);
    this.setUiMessage(
      `No se puede: supera el máximo. El límite para retirar es $${max.toFixed(2)}.`,
      'error',
      max
    );
  }

  private setUiMessage(msg: string, type: UiMessageType, suggested: number | null): void {
    this.uiMessage = msg;
    this.uiMessageType = type;
    this.suggestedMonto = suggested;
  }

  private clearUiMessage(): void {
    this.uiMessage = '';
    this.uiMessageType = 'error';
    this.suggestedMonto = null;
  }

  // ===================== PATCH / DEFAULT DESC =====================

  private patchFromObjetivo(obj: Objetivo): void {
    this.operaciones = obj.operaciones
      ? obj.operaciones.map((op) => {
          const operacion: Operacion = { ...op, monto: Number(op.monto) || 0 };

          if (operacion.fecha) {
            const date = new Date(operacion.fecha);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            operacion.fecha = `${year}-${month}-${day}`;
          } else {
            operacion.fecha = this.getTodayAR();
          }

          return operacion;
        })
      : [];

    this.editingIndex = null;
    this.clearUiMessage();
  }

  private buildDefaultDescripcion(tipo: Operacion['tipo']): string {
    const base = this.objetivo?.titulo?.trim() || 'Objetivo';

    // Texto acorde a tus botones:
    // Egreso (izq) = “Ingreso” al objetivo
    // Ingreso (der) = “Gasto” del objetivo
    const sufijo = tipo === 'Egreso' || tipo === 'expense' ? 'Ingreso' : 'Gasto';
    return `${base} ${sufijo}`;
  }
}
