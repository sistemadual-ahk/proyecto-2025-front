import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[appNumberFormat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberFormatDirective),
      multi: true
    }
  ]
})
export class NumberFormatDirective implements ControlValueAccessor {
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private rawValue: number | null = null;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  writeValue(value: number | null): void {
    this.rawValue = value;
    this.el.nativeElement.value = this.formatNumber(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    
    // Permitir teclas de control
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (controlKeys.includes(key)) {
      return;
    }
    
    // Permitir Ctrl/Cmd + A, C, V, X, Z
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(key.toLowerCase())) {
      return;
    }
    
    // Permitir números
    if (/^\d$/.test(key)) {
      return;
    }
    
    // Permitir coma o punto para decimales
    if (key === ',' || key === '.') {
      // Si ya existe una coma, bloquear
      if (input.value.includes(',')) {
        event.preventDefault();
        return;
      }
      
      // Si es punto, convertir a coma
      if (key === '.') {
        event.preventDefault();
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const val = input.value;
        
        // Insertar coma en la posición del cursor
        input.value = val.substring(0, start) + ',' + val.substring(end);
        
        // Mover cursor después de la coma
        input.setSelectionRange(start + 1, start + 1);
        
        // Disparar evento input para formatear
        input.dispatchEvent(new Event('input'));
      }
      return;
    }
    
    // Bloquear todo lo demás (incluyendo letras)
    event.preventDefault();
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    let inputValue = input.value;
    
    // Filtrar caracteres no válidos (mantener solo números, comas y puntos)
    const filteredValue = inputValue.replace(/[^\d.,]/g, '');
    
    // Si se filtraron caracteres, actualizar el valor del input
    if (filteredValue !== inputValue) {
      inputValue = filteredValue;
    }
    
    const oldValue = inputValue;
    
    // Obtener el valor sin formato
    const rawValue = this.unformatNumber(inputValue);
    
    // Actualizar el valor interno
    this.rawValue = rawValue;
    
    // Formatear y actualizar el input
    let formattedValue = this.formatNumber(rawValue);
    
    // Preservar la coma si el usuario la acaba de escribir
    if (inputValue.endsWith(',')) {
      if (!formattedValue.includes(',')) {
        formattedValue += ',';
      }
    } else if (inputValue.includes(',')) {
      // Preservar decimales intermedios (ej: "10,0") que formatNumber podría haber eliminado
      const separatorIndex = inputValue.indexOf(',');
      const decimalPart = inputValue.substring(separatorIndex + 1);
      
      // Si hay decimales (incluso ceros) y formatNumber no los tiene o tiene menos
      if (decimalPart.length > 0) {
        const formattedParts = formattedValue.split(',');
        if (formattedParts.length === 1) {
          // Si formatNumber no tiene decimales, agregar los que escribió el usuario (hasta 2)
          formattedValue += ',' + decimalPart.substring(0, 2);
        } else {
          // Si ya tiene decimales, asegurar que coincidan con lo que escribió el usuario (si es más preciso, ej: ceros)
          // Pero formatNumber ya redondea a 2 decimales.
          // El caso principal es "10,0" -> formatNumber devuelve "10". Queremos "10,0".
          if (decimalPart === '0' || decimalPart === '00') {
             formattedValue = formattedParts[0] + ',' + decimalPart;
          }
        }
      }
    }
    
    // Calcular la nueva posición del cursor
    let newCursorPosition = cursorPosition;
    
    if (oldValue !== formattedValue) {
      // Contar separadores de miles antes del cursor en el valor anterior
      const beforeCursor = oldValue.substring(0, cursorPosition);
      const oldSeparators = (beforeCursor.match(/\./g) || []).length;
      
      // Contar separadores de miles antes del cursor en el nuevo valor
      const newBeforeCursor = formattedValue.substring(0, cursorPosition);
      const newSeparators = (newBeforeCursor.match(/\./g) || []).length;
      
      // Ajustar posición del cursor
      newCursorPosition = cursorPosition + (newSeparators - oldSeparators);
    }
    
    input.value = formattedValue;
    
    // Restaurar la posición del cursor
    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
    
    // Notificar el cambio al modelo
    this.onChange(rawValue);
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Limpiar el texto pegado para permitir solo números, comas y puntos
    const cleanedText = pastedText.replace(/[^\d.,]/g, '');
    
    if (cleanedText) {
      const input = event.target as HTMLInputElement;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const currentValue = input.value;
      
      // Insertar el texto limpio en la posición actual
      const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
      input.value = newValue;
      
      // Disparar evento input para que se procese el formato
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    
    // Asegurar formato correcto al perder el foco
    if (this.rawValue !== null) {
      this.el.nativeElement.value = this.formatNumber(this.rawValue);
    }
  }

  private unformatNumber(value: string): number | null {
    if (!value || value.trim() === '') {
      return null;
    }
    
    // Eliminar todos los puntos (separadores de miles)
    let cleanValue = value.replace(/\./g, '');
    
    // Reemplazar la coma decimal por punto
    cleanValue = cleanValue.replace(',', '.');
    
    // Convertir a número
    const num = parseFloat(cleanValue);
    
    if (isNaN(num)) {
      return null;
    }
    
    // Limitar a 2 decimales
    return Math.round(num * 100) / 100;
  }

  private formatNumber(value: number | null): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    
    // Limitar a 2 decimales
    const roundedValue = Math.round(value * 100) / 100;
    
    // Separar parte entera y decimal
    const parts = roundedValue.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Formatear parte entera con separador de miles
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Retornar con la parte decimal si existe (máximo 2 dígitos)
    if (decimalPart !== undefined) {
      return `${formattedInteger},${decimalPart.substring(0, 2)}`;
    }
    
    return formattedInteger;
  }
}
