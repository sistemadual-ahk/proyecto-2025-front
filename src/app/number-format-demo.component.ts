import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumberFormatDirective } from './directives/number-format.directive';

/**
 * Componente de ejemplo para probar la directiva NumberFormat
 * 
 * Para usar este componente:
 * 1. Importalo en tu app.routes.ts o donde necesites
 * 2. Navega a la ruta correspondiente
 * 3. Prueba escribiendo números en los campos de entrada
 */
@Component({
  selector: 'app-number-format-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, NumberFormatDirective],
  template: `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2>Demo: Number Format Directive</h2>
      <p>Escribe números para ver cómo se formatean automáticamente:</p>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px;">
          Monto:
        </label>
        <input
          type="text"
          inputmode="decimal"
          appNumberFormat
          [(ngModel)]="amount"
          placeholder="0"
          style="padding: 10px; font-size: 16px; width: 100%; box-sizing: border-box;"
        />
        <p style="margin-top: 5px; color: #666;">
          Valor en el modelo: {{ amount }}
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px;">
          Precio:
        </label>
        <input
          type="text"
          inputmode="decimal"
          appNumberFormat
          [(ngModel)]="price"
          placeholder="0"
          style="padding: 10px; font-size: 16px; width: 100%; box-sizing: border-box;"
        />
        <p style="margin-top: 5px; color: #666;">
          Valor en el modelo: {{ price }}
        </p>
      </div>

      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
        <h3>Ejemplos de formato:</h3>
        <ul>
          <li>1000 → 1.000</li>
          <li>1000.5 → 1.000,50</li>
          <li>1234567.89 → 1.234.567,89</li>
          <li>1234567.899 → 1.234.567,90 (redondeado a 2 decimales)</li>
        </ul>
      </div>

      <div style="margin-top: 20px; background: #e3f2fd; padding: 15px; border-radius: 8px;">
        <h3>Características:</h3>
        <ul>
          <li>✅ Separador de miles con punto (.)</li>
          <li>✅ Separador decimal con coma (,)</li>
          <li>✅ Máximo 2 decimales</li>
          <li>✅ Redondeo automático</li>
          <li>✅ Actualización en tiempo real</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    h2 {
      color: #333;
      margin-bottom: 10px;
    }
    
    label {
      font-weight: bold;
      color: #555;
    }
    
    input {
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    ul {
      margin: 10px 0;
      padding-left: 20px;
    }

    li {
      margin: 5px 0;
    }
  `]
})
export class NumberFormatDemoComponent {
  amount: number | null = null;
  price: number | null = null;
}
