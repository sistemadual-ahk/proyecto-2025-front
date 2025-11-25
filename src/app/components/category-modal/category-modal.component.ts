import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditableCategory } from '../../../models/editable-category.model';

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
  @Input() isReadOnly: boolean = false;

  @Input() value: EditableCategory = { 
    name: '', 
    description: '', 
    icon: '', 
    color: '#4F46E5', 
    iconColor: '#FFFFFF' 
  };
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<EditableCategory>();
  @Output() delete = new EventEmitter<void>();

  public temp: EditableCategory = { 
    name: '', 
    description: '', 
    icon: '', 
    color: '#4F46E5', 
    iconColor: '#FFFFFF' 
  };

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

  public extraIconOptions: Array<{ name: string; class: string }> = [
    { name: 'Banco', class: 'mdi-bank' },
    { name: 'Cheque', class: 'mdi-checkbook' },
    { name: 'Bitcoin', class: 'mdi-bitcoin' },
    { name: 'Inversión', class: 'mdi-trending-up' },
    { name: 'Préstamo', class: 'mdi-handshake' },
    { name: 'Dividendos', class: 'mdi-chart-line' },
    
    { name: 'Pizza', class: 'mdi-pizza' },
    { name: 'Hamburguesa', class: 'mdi-hamburger' },
    { name: 'Cerveza', class: 'mdi-beer' },
    { name: 'Vino', class: 'mdi-glass-wine' },
    { name: 'Pastel', class: 'mdi-cake' },
    { name: 'Helado', class: 'mdi-ice-cream' },
    
    { name: 'Bebé', class: 'mdi-baby-face' },
    { name: 'Juguetes', class: 'mdi-toy-brick' },
    { name: 'Limpieza', class: 'mdi-spray-bottle' },
    { name: 'Jardín', class: 'mdi-flower' },
    { name: 'Muebles', class: 'mdi-sofa' },
    { name: 'Electrodomésticos', class: 'mdi-washing-machine' },
    
    { name: 'Motocicleta', class: 'mdi-motorbike' },
    { name: 'Bicicleta', class: 'mdi-bike' },
    { name: 'Metro', class: 'mdi-subway' },
    { name: 'Taxi', class: 'mdi-taxi' },
    { name: 'Hotel', class: 'mdi-bed' },
    { name: 'Equipaje', class: 'mdi-bag-suitcase' },
    
    { name: 'Música', class: 'mdi-music' },
    { name: 'Guitarra', class: 'mdi-guitar-acoustic' },
    { name: 'Gaming', class: 'mdi-gamepad-variant' },
    { name: 'Libros', class: 'mdi-book' },
    { name: 'Cine', class: 'mdi-movie-open' },
    { name: 'Teatro', class: 'mdi-drama-masks' },
    
    { name: 'Hospital', class: 'mdi-hospital-building' },
    { name: 'Dentista', class: 'mdi-tooth' },
    { name: 'Yoga', class: 'mdi-yoga' },
    { name: 'Vitaminas', class: 'mdi-bottle-tonic' },
    { name: 'Psicólogo', class: 'mdi-brain' },
    { name: 'Spa', class: 'mdi-spa' },
    
    { name: 'Smartphone', class: 'mdi-smartphone' },
    { name: 'Tablet', class: 'mdi-tablet' },
    { name: 'Auriculares', class: 'mdi-headphones' },
    { name: 'Cámara', class: 'mdi-camera' },
    { name: 'Impresora', class: 'mdi-printer' },
    { name: 'Router', class: 'mdi-router-wireless' },
    
    { name: 'Electricidad', class: 'mdi-lightning-bolt' },
    { name: 'Agua', class: 'mdi-water' },
    { name: 'Gas', class: 'mdi-fire' },
    { name: 'Basura', class: 'mdi-trash-can' },
    { name: 'Seguros', class: 'mdi-shield-check' },
    { name: 'Netflix', class: 'mdi-netflix' },
    
    { name: 'Oficina', class: 'mdi-office-building' },
    { name: 'Universidad', class: 'mdi-school' },
    { name: 'Libros Estudio', class: 'mdi-book-open' },
    { name: 'Calculadora', class: 'mdi-calculator' },
    { name: 'Conferencia', class: 'mdi-account-group' },
    { name: 'Certificado', class: 'mdi-certificate' },
    
    { name: 'Regalo Cumpleaños', class: 'mdi-cake-variant' },
    { name: 'Navidad', class: 'mdi-pine-tree' },
    { name: 'Vacaciones', class: 'mdi-beach' },
    { name: 'Emergencia', class: 'mdi-alert-circle' },
    { name: 'Caridad', class: 'mdi-hand-heart' },
    { name: 'Eventos', class: 'mdi-calendar-star' },
  ];

  public showExtraIcons = false;
  public isIconPickerOpen = false;

  public popularBgColors: string[] = [
    '#4F46E5', '#059669', '#DC2626', '#D97706', '#7C3AED',
    '#0891B2', '#B91C1C', '#16A34A', '#EA580C', '#6366F1',
    '#0F172A', '#92400E'
  ];
  
  public popularIconColors: string[] = [
    '#FFFFFF', '#F8FAFC', '#E2E8F0', '#FEF3C7', '#DBEAFE',
    '#D1FAE5', '#111827', '#374151', '#FCD34D', '#60A5FA'
  ];

  public showCustomBgPicker = false;
  public showCustomIconPicker = false;

  ngOnInit() {
    this.temp = { ...this.value };

    if (!this.temp.icon) {
      this.temp.icon = this.mainIconOptions[0]?.class || 'mdi-help-circle';
    }

    if (this.value.isDefault || this.isReadOnly) {
      this.isReadOnly = true;
      this.title = 'Categoría Predefinida';
    }
  }

  canEdit(): boolean {
    return !this.isReadOnly && !this.value.isDefault && !this.temp.isDefault;
  }

  onClose() { 
    this.close.emit(); 
  }
  
  onSave() { 
    if (this.canEdit()) {
      this.save.emit(this.temp); 
    }
  }
  
  onDelete() { 
    if (this.canEdit()) {
      this.delete.emit(); 
    }
  }

  filteredIconOptions(): Array<{ name: string; class: string }> {
    if (this.showExtraIcons) {
      return [...this.mainIconOptions.slice(0, -1), ...this.extraIconOptions];
    }
    return this.mainIconOptions;
  }

  displayNameForIcon(iconClass?: string): string {
    if (!iconClass) return 'Selecciona un ícono';
    
    const foundMain = this.mainIconOptions.find((o) => o.class === iconClass);
    if (foundMain) return foundMain.name;
    
    const foundExtra = this.extraIconOptions.find((o) => o.class === iconClass);
    if (foundExtra) return foundExtra.name;
    
    return iconClass.replace('mdi-','');
  }

  toggleExtraIcons() {
    if (!this.canEdit()) return;
    this.showExtraIcons = !this.showExtraIcons;
  }

  isMoreIconsButton(iconClass: string): boolean {
    return iconClass === 'mdi-dots-horizontal';
  }

  selectIcon(iconClass: string) {
    if (!this.canEdit()) return;
    
    if (this.isMoreIconsButton(iconClass)) {
      this.toggleExtraIcons();
      return;
    }
    
    this.temp.icon = iconClass;
    this.isIconPickerOpen = false;
  }

  selectBgColor(color: string) { 
    if (this.canEdit()) {
      this.temp.color = color; 
    }
  }
  
  selectIconColor(color: string) { 
    if (this.canEdit()) {
      this.temp.iconColor = color; 
    }
  }

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
