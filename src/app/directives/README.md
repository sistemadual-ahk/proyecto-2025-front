# Number Format Directive

Esta directiva formatea automáticamente los inputs numéricos con separador de miles y limita los decimales a 2 dígitos.

## Características

- ✅ Separador de miles con punto (.)
- ✅ Separador decimal con coma (,)
- ✅ Máximo 2 decimales
- ✅ Actualización en tiempo real mientras se escribe
- ✅ Preserva la posición del cursor
- ✅ Compatible con `[(ngModel)]`

## Uso

### 1. Importar la directiva en tu componente

```typescript
import { NumberFormatDirective } from '../../directives/number-format.directive';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, FormsModule, NumberFormatDirective],
  // ...
})
```

### 2. Usar en el template HTML

```html
<input
  type="text"
  inputmode="decimal"
  appNumberFormat
  [(ngModel)]="miVariable"
  placeholder="0"
/>
```

## Ejemplos de formato

| Entrada del usuario | Valor formateado | Valor en el modelo |
|---------------------|------------------|---------------------|
| 1000                | 1.000            | 1000                |
| 1000.50             | 1.000,50         | 1000.5              |
| 1234567.89          | 1.234.567,89     | 1234567.89          |
| 1234567.899         | 1.234.567,89     | 1234567.90          |
| 500.1               | 500,10           | 500.1               |

## Notas importantes

- Usa `type="text"` en lugar de `type="number"` para permitir el formato personalizado
- Usa `inputmode="decimal"` para mostrar el teclado numérico en dispositivos móviles
- Los valores se guardan como números en el modelo (sin formato)
- El redondeo a 2 decimales se aplica automáticamente
