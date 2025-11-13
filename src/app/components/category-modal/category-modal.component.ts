// Archivo: category-modal.component.ts
// REEMPLAZA TU ARCHIVO CON ESTE CÓDIGO

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface EditableCategory {
  id?: string;
  name: string;
  description: string; 
  icon: string;
  color: string;
  iconColor: string;
  isDefault?: boolean; // Nueva propiedad para categorías por defecto
}

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.scss',
})
export class CategoryModalComponent implements OnInit {
  @Input() title: string = 'Editar categoría';
  @Input() edit: boolean = false;
  @Input() isReadOnly: boolean = false; // Nueva propiedad para modo solo lectura
  // Actualiza el 'value' por defecto para incluir description con colores más atractivos
  @Input() value: EditableCategory = { name: '', description: '', icon: '', color: '#4F46E5', iconColor: '#FFFFFF' };
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EditableCategory>();
  @Output() delete = new EventEmitter<void>();

  // Actualiza 'temp' para incluir description con colores más atractivos por defecto
  public temp: EditableCategory = { name: '', description: '', icon: '', color: '#4F46E5', iconColor: '#FFFFFF' };

  // Opciones de íconos principales (más comunes)
  public mainIconOptions: Array<{ name: string; class: string }> = [
    { name: 'Cartera', class: 'mdi-wallet' },
    { name: 'Comida', class: 'mdi-food' },
    { name: 'Supermercado', class: 'mdi-cart' },
    { name: 'Hogar', class: 'mdi-home' },
    { name: 'Transporte', class: 'mdi-bus' },
    { name: 'Coche', class: 'mdi-car' },
    { name: 'Combustible', class: 'mdi-fuel' },
    { name: 'Salud', class: 'mdi-heart-pulse' },
    { name: 'Medicamentos', class: 'mdi-pill' },
    { name: 'Deporte', class: 'mdi-dumbbell' },
    { name: 'Entretenimiento', class: 'mdi-movie-open' },
    { name: 'Viajes', class: 'mdi-airplane' },
    { name: 'Educación', class: 'mdi-school' },
    { name: 'Teléfono', class: 'mdi-cellphone' },
    { name: 'Internet', class: 'mdi-wifi' },
    { name: 'Regalos', class: 'mdi-gift' },
    { name: 'Ahorro', class: 'mdi-piggy-bank' },
    { name: 'Ingresos', class: 'mdi-cash-plus' },
    { name: 'Gastos', class: 'mdi-cash-minus' },
    { name: 'Tarjeta', class: 'mdi-credit-card' },
    { name: 'Factura', class: 'mdi-receipt' },
    { name: 'Mascotas', class: 'mdi-paw' },
    { name: 'Tecnología', class: 'mdi-laptop' },
    { name: 'Ropa', class: 'mdi-tshirt-crew' },
    { name: 'Belleza', class: 'mdi-lipstick' },
    { name: 'Café', class: 'mdi-coffee' },
    { name: 'Restaurante', class: 'mdi-silverware-fork-knife' },
    { name: 'Impuestos', class: 'mdi-percent' },
    { name: 'Herramientas', class: 'mdi-tools' },
    { name: 'Más iconos', class: 'mdi-dots-horizontal' },
  ];

  // Iconos adicionales que se muestran al hacer clic en "Otros"
  public extraIconOptions: Array<{ name: string; class: string }> = [
    // Finanzas y Negocios
    { name: 'Banco', class: 'mdi-bank' },
    { name: 'Cheque', class: 'mdi-checkbook' },
    { name: 'Bitcoin', class: 'mdi-bitcoin' },
    { name: 'Inversión', class: 'mdi-trending-up' },
    { name: 'Préstamo', class: 'mdi-handshake' },
    { name: 'Dividendos', class: 'mdi-chart-line' },
    
    // Comida y Bebidas
    { name: 'Pizza', class: 'mdi-pizza' },
    { name: 'Hamburguesa', class: 'mdi-hamburger' },
    { name: 'Cerveza', class: 'mdi-beer' },
    { name: 'Vino', class: 'mdi-glass-wine' },
    { name: 'Pastel', class: 'mdi-cake' },
    { name: 'Helado', class: 'mdi-ice-cream' },
    
    // Hogar y Familia
    { name: 'Bebé', class: 'mdi-baby-face' },
    { name: 'Juguetes', class: 'mdi-toy-brick' },
    { name: 'Limpieza', class: 'mdi-spray-bottle' },
    { name: 'Jardín', class: 'mdi-flower' },
    { name: 'Muebles', class: 'mdi-sofa' },
    { name: 'Electrodomésticos', class: 'mdi-washing-machine' },
    
    // Transporte y Viajes
    { name: 'Motocicleta', class: 'mdi-motorbike' },
    { name: 'Bicicleta', class: 'mdi-bike' },
    { name: 'Metro', class: 'mdi-subway' },
    { name: 'Taxi', class: 'mdi-taxi' },
    { name: 'Hotel', class: 'mdi-bed' },
    { name: 'Equipaje', class: 'mdi-bag-suitcase' },
    
    // Entretenimiento y Ocio
    { name: 'Música', class: 'mdi-music' },
    { name: 'Guitarra', class: 'mdi-guitar-acoustic' },
    { name: 'Gaming', class: 'mdi-gamepad-variant' },
    { name: 'Libros', class: 'mdi-book' },
    { name: 'Cine', class: 'mdi-movie-open' },
    { name: 'Teatro', class: 'mdi-drama-masks' },
    
    // Salud y Bienestar
    { name: 'Hospital', class: 'mdi-hospital-building' },
    { name: 'Dentista', class: 'mdi-tooth' },
    { name: 'Yoga', class: 'mdi-yoga' },
    { name: 'Vitaminas', class: 'mdi-bottle-tonic' },
    { name: 'Psicólogo', class: 'mdi-brain' },
    { name: 'Spa', class: 'mdi-spa' },
    
    // Tecnología y Comunicaciones
    { name: 'Smartphone', class: 'mdi-smartphone' },
    { name: 'Tablet', class: 'mdi-tablet' },
    { name: 'Auriculares', class: 'mdi-headphones' },
    { name: 'Cámara', class: 'mdi-camera' },
    { name: 'Impresora', class: 'mdi-printer' },
    { name: 'Router', class: 'mdi-router-wireless' },
    
    // Servicios y Facturas
    { name: 'Electricidad', class: 'mdi-lightning-bolt' },
    { name: 'Agua', class: 'mdi-water' },
    { name: 'Gas', class: 'mdi-fire' },
    { name: 'Basura', class: 'mdi-trash-can' },
    { name: 'Seguros', class: 'mdi-shield-check' },
    { name: 'Netflix', class: 'mdi-netflix' },
    
    // Trabajo y Educación
    { name: 'Oficina', class: 'mdi-office-building' },
    { name: 'Universidad', class: 'mdi-school' },
    { name: 'Libros Estudio', class: 'mdi-book-open' },
    { name: 'Calculadora', class: 'mdi-calculator' },
    { name: 'Conferencia', class: 'mdi-account-group' },
    { name: 'Certificado', class: 'mdi-certificate' },
    
    // Varios y Otros
    { name: 'Regalo Cumpleaños', class: 'mdi-cake-variant' },
    { name: 'Navidad', class: 'mdi-pine-tree' },
    { name: 'Vacaciones', class: 'mdi-beach' },
    { name: 'Emergencia', class: 'mdi-alert-circle' },
    { name: 'Caridad', class: 'mdi-hand-heart' },
    { name: 'Eventos', class: 'mdi-calendar-star' },
  ];

  // Estado para mostrar/ocultar iconos adicionales
  public showExtraIcons = false;

  // UI estado para el picker de íconos
  public isIconPickerOpen = false;

  ngOnInit() {
    this.temp = { ...this.value };

    // Si no hay icono seleccionado, establece uno por defecto
    if (!this.temp.icon) {
      this.temp.icon = this.mainIconOptions[0]?.class || 'mdi-help-circle';
    }

    // Si es una categoría por defecto, activar modo solo lectura
    if (this.value.isDefault || this.isReadOnly) {
      this.isReadOnly = true;
      this.title = 'Categoría Predefinida';
    }
  }

  // Método para verificar si se puede editar
  canEdit(): boolean {
    return !this.isReadOnly && !this.value.isDefault && !this.temp.isDefault;
  }

  // Categorías predefinidas por defecto
  static getDefaultCategories(): EditableCategory[] {
    return [
      {
        id: 'default-food',
        name: 'Comida y Restaurantes',
        description: 'Gastos en alimentación, restaurantes y delivery',
        icon: 'mdi-food',
        color: '#D97706',
        iconColor: '#FFFFFF',
        isDefault: true
      },
      {
        id: 'default-transport',
        name: 'Transporte',
        description: 'Gastos en transporte público, combustible y estacionamiento',
        icon: 'mdi-bus',
        color: '#0891B2',
        iconColor: '#FFFFFF',
        isDefault: true
      },
      {
        id: 'default-shopping',
        name: 'Compras y Supermercado',
        description: 'Compras del hogar, supermercado y productos básicos',
        icon: 'mdi-cart',
        color: '#059669',
        iconColor: '#FFFFFF',
        isDefault: true
      },
      {
        id: 'default-entertainment',
        name: 'Entretenimiento',
        description: 'Cine, streaming, juegos y actividades de ocio',
        icon: 'mdi-movie-open',
        color: '#7C3AED',
        iconColor: '#FFFFFF',
        isDefault: true
      },
      {
        id: 'default-health',
        name: 'Salud y Medicina',
        description: 'Gastos médicos, medicamentos y consultas',
        icon: 'mdi-heart-pulse',
        color: '#DC2626',
        iconColor: '#FFFFFF',
        isDefault: true
      },
      {
        id: 'default-bills',
        name: 'Servicios y Facturas',
        description: 'Electricidad, agua, gas, internet y telefonía',
        icon: 'mdi-receipt',
        color: '#B91C1C',
        iconColor: '#FFFFFF',
        isDefault: true
      },
      {
        id: 'default-income',
        name: 'Ingresos',
        description: 'Salario, bonos y otros ingresos',
        icon: 'mdi-cash-plus',
        color: '#16A34A',
        iconColor: '#FFFFFF',
        isDefault: true
      },
      {
        id: 'default-savings',
        name: 'Ahorro e Inversiones',
        description: 'Ahorros, inversiones y planes de retiro',
        icon: 'mdi-piggy-bank',
        color: '#4F46E5',
        iconColor: '#FFFFFF',
        isDefault: true
      }
    ];
  }

  onClose() { 
    this.close.emit(); 
  }
  
  onSave() { 
    // Solo permitir guardar si no es de solo lectura
    if (this.canEdit()) {
      this.save.emit(this.temp); 
    }
  }
  
  onDelete() { 
    // Solo permitir eliminar si no es de solo lectura y no es categoría por defecto
    if (this.canEdit()) {
      this.delete.emit(); 
    }
  }
  // Lista de íconos disponible - incluye iconos principales y adicionales si están expandidos
  filteredIconOptions(): Array<{ name: string; class: string }> {
    if (this.showExtraIcons) {
      return [...this.mainIconOptions.slice(0, -1), ...this.extraIconOptions]; // Excluye "Más iconos"
    }
    return this.mainIconOptions;
  }

  // Nombre legible del ícono actual
  displayNameForIcon(iconClass?: string): string {
    if (!iconClass) return 'Selecciona un ícono';
    
    // Buscar en iconos principales
    const foundMain = this.mainIconOptions.find((o: any) => o.class === iconClass);
    if (foundMain) return foundMain.name;
    
    // Buscar en iconos adicionales
    const foundExtra = this.extraIconOptions.find((o: any) => o.class === iconClass);
    if (foundExtra) return foundExtra.name;
    
    return iconClass.replace('mdi-','');
  }

  // Método para manejar clic en "Más iconos"
  toggleExtraIcons() {
    if (!this.canEdit()) return;
    this.showExtraIcons = !this.showExtraIcons;
  }

  // Método para detectar si un ícono es el botón "Más iconos"
  isMoreIconsButton(iconClass: string): boolean {
    return iconClass === 'mdi-dots-horizontal';
  }

  // Paletas populares de color optimizadas para categorías
  public popularBgColors: string[] = [
    '#4F46E5', // Índigo vibrante - Tecnología/Apps
    '#059669', // Verde esmeralda - Salud/Dinero
    '#DC2626', // Rojo intenso - Gastos/Emergencias
    '#D97706', // Naranja cálido - Comida/Hogar
    '#7C3AED', // Púrpura - Entretenimiento/Lujo
    '#0891B2', // Cyan - Transporte/Viajes
    '#B91C1C', // Rojo oscuro - Deudas/Facturas
    '#16A34A', // Verde natural - Ahorro/Ingresos
    '#EA580C', // Naranja quemado - Educación/Herramientas
    '#6366F1', // Índigo claro - Otros/Personal
    '#0F172A', // Azul muy oscuro - Profesional
    '#92400E'  // Marrón dorado - Mascotas/Hobby
  ];
  
  public popularIconColors: string[] = [
    '#FFFFFF', // Blanco puro - Contraste perfecto
    '#F8FAFC', // Blanco casi puro - Suave
    '#E2E8F0', // Gris muy claro - Elegante
    '#FEF3C7', // Amarillo crema - Cálido
    '#DBEAFE', // Azul muy claro - Fresco
    '#D1FAE5', // Verde muy claro - Natural
    '#111827', // Gris oscuro - Contraste fuerte
    '#374151', // Gris medio - Sutil
    '#FCD34D', // Amarillo dorado - Destacado
    '#60A5FA'  // Azul claro - Tecnológico
  ];

  // Estado de pickers personalizados
  public showCustomBgPicker = false;
  public showCustomIconPicker = false;

  selectBgColor(color: string) { 
    if (this.canEdit()) {
      this.temp.color = color; 
    }
    // Si no se puede editar, simplemente no hacer nada
  }
  
  selectIconColor(color: string) { 
    if (this.canEdit()) {
      this.temp.iconColor = color; 
    }
    // Si no se puede editar, simplemente no hacer nada
  }

  // Seleccionar ícono solo si se puede editar
  selectIcon(iconClass: string) {
    if (!this.canEdit()) return;
    
    // Si es el botón "Más iconos", expandir la lista
    if (this.isMoreIconsButton(iconClass)) {
      this.toggleExtraIcons();
      return;
    }
    
    // Seleccionar el ícono normalmente
    this.temp.icon = iconClass;
    this.isIconPickerOpen = false;
  }

  // Métodos adicionales para bloquear completamente la edición
  updateName(newName: string) {
    if (this.canEdit()) {
      this.temp.name = newName;
    }
  }

  updateDescription(newDescription: string) {
    if (this.canEdit()) {
      this.temp.description = newDescription;
    }
  }

  // Debug method para verificar el estado
  getDebugInfo() {
    return {
      isReadOnly: this.isReadOnly,
      valueIsDefault: this.value.isDefault,
      tempIsDefault: this.temp.isDefault,
      canEdit: this.canEdit(),
      title: this.title
    };
  }
}