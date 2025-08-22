// src/app/pages/test-gasto/test-gasto.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importa los componentes y servicios necesarios
import { AddGastoModalComponent } from '../../components/gastos/gastos.component';
import { GastoService } from '../../services/gasto.service';
import { Gasto } from '../../../models/gasto.model';

@Component({
  selector: 'app-test-gasto',
  standalone: true,
  imports: [CommonModule, AddGastoModalComponent], // Importamos el modal
  template: `
    <main class="flex min-h-screen items-center justify-center p-6 bg-gray-50">
      <div class="bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Página de Prueba de Gastos</h1>
        
        <!-- Botón para abrir el modal -->
        <button 
          (click)="openModal()" 
          class="bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Abrir Modal para Agregar Gasto
        </button>
      </div>

      <!-- El modal se muestra solo si la variable isModalVisible es true -->
      <app-add-gasto-modal 
        *ngIf="isModalVisible" 
        (closeModal)="closeModal()" 
        (saveGasto)="saveGasto($event)">
      </app-add-gasto-modal>

      <!-- Aquí podrías mostrar un mensaje de confirmación después de guardar -->
      <div *ngIf="gastoGuardado" class="mt-4 p-4 bg-green-200 text-green-800 rounded-lg">
        ¡Gasto guardado con éxito!
      </div>
    </main>
  `,
  styles: []
})
export class TestGastoComponent {
  isModalVisible = false;
  gastoGuardado = false; // Variable para mostrar confirmación

  // IDs de prueba (en una app real vendrían de la sesión del usuario)
  private readonly userId = '68a684e9ce1afe11470ccc25';
  private readonly billeteraId = '68a68671ce1afe11470ccc2c';

  constructor(private gastoService: GastoService) {}

  openModal(): void {
    this.isModalVisible = true;
    this.gastoGuardado = false; // Ocultar mensaje de confirmación al abrir
  }

  closeModal(): void {
    this.isModalVisible = false;
  }

  saveGasto(gastoPayload: Partial<Gasto>): void {
    const fullGasto: Partial<Gasto> = {
      ...gastoPayload,
      tipo: 'Gasto',
      datetime: new Date(),
      usuario: this.userId,
      billetera: this.billeteraId
    };

    this.gastoService.createGasto(fullGasto).subscribe({
      next: (response) => {
        console.log('Gasto guardado exitosamente:', response);
        this.closeModal();
        this.gastoGuardado = true; // Mostrar mensaje de confirmación
      },
      error: (error) => {
        console.error('Error al guardar el gasto:', error);
        this.gastoGuardado = false;
        // Aquí podrías mostrar un mensaje de error más detallado
      }
    });
  }
}
