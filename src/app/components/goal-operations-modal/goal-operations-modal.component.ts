import {
  Component,
  EventEmitter,
  HostBinding,
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

      // ✅ normalizar billeteraId en operaciones ya existentes
      this.operaciones = this.operaciones.map((op) => this.normalizeBilleteraId(op));
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

    if (isEgreso) return +monto;
    if (isIngreso) return -monto;

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

  // ✅ para UI (píldora + / - + colores)
  isIngreso(operacion: Operacion): boolean {
    return operacion.tipo === 'Egreso' || operacion.tipo === 'expense';
  }

  // ===================== CRUD OPERACIONES =====================

  addOperacion(): void {
    this.clearUiMessage();

    const localDateString = this.getTodayAR();

    // ✅ default: botón IZQ (Agregar Ingreso) => tipo 'Egreso'
    const defaultTipo: Operacion['tipo'] = 'Egreso';

    const newOperacion: Operacion = {
      tipo: defaultTipo,
      monto: 0,
      descripcion: this.buildDefaultDescripcion(defaultTipo),
      fecha: localDateString,
      billeteraId: undefined, // ✅ ahora la elige el usuario
    };

    this.operaciones.push(this.normalizeBilleteraId(newOperacion));
    this.editingIndex = this.operaciones.length - 1;
  }

  // ✅ FIX: no re-ejecutar si ya estás editando ese item (si no, se re-renderiza y no te deja tipear)
  startEditOperacion(index: number): void {
    this.clearUiMessage();

    if (this.editingIndex === index) return;

    this.operaciones[index] = this.normalizeBilleteraId(this.operaciones[index]!);
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

    const isEgreso = tipo === 'Egreso' || tipo === 'expense';
    const isIngreso = tipo === 'Ingreso' || tipo === 'income';

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
      const next = currentWithoutThis + this.goalDeltaFor(op);
      if (next >= 0) return true;

      const max = Math.max(0, currentWithoutThis);
      this.setUiMessage(
        `No se puede: supera el máximo. El límite para retirar es $${max.toFixed(2)}.`,
        'error',
        max
      );
      return false;
    }

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

  // ===================== PATCH / DESC / NORMALIZE =====================

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

          return this.normalizeBilleteraId(operacion);
        })
      : [];

    this.editingIndex = null;
    this.clearUiMessage();
  }

  private buildDefaultDescripcion(tipo: Operacion['tipo']): string {
    const base = this.objetivo?.titulo?.trim() || 'Objetivo';
    const sufijo = tipo === 'Egreso' || tipo === 'expense' ? 'Ingreso' : 'Gasto';
    return `${base} ${sufijo}`;
  }

  /**
   * ✅ Asegura que operacion.billeteraId exista aunque el backend te devuelva billetera como objeto.
   * - Si viene billeteraId => ok
   * - Si viene billetera: { id | _id } => lo mapea a billeteraId
   */
  private normalizeBilleteraId(op: Operacion): Operacion {
    const fixed: any = { ...op };

    if (!fixed.billeteraId && fixed.billetera) {
      fixed.billeteraId =
        fixed.billetera.id ||
        fixed.billetera._id ||
        (typeof fixed.billetera === 'string' ? fixed.billetera : undefined);
    }

    // No setear default acá: el usuario elige
    return fixed as Operacion;
  }
}
