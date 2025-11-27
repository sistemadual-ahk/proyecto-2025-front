import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
import { MatSelectModule } from '@angular/material/select';

interface CategoryData {
  name: string;
  total: number;
}

interface UserComparisonData {
  name?: string;
  sueldo: number;
  profesion: string;
  estadoCivil: string;
  ubicacion: {
    provincia: string;
    municipio: string;
    localidad: string;
  };
  categorias: CategoryData[];
  totalOperaciones: number;
  primeraFecha: string;
  ultimaFecha: string;
}

@Component({
  selector: 'app-user-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent, MatSelectModule],
  templateUrl: './user-comparison.component.html',
  styleUrl: './user-comparison.component.scss',
})
export class UserComparisonComponent implements OnInit {
  currentUser: UserComparisonData | null = null;
  comparedUser: UserComparisonData | null = null;
  loading = true;
  showCriteriaSelection = true;
  
  // Criterios de comparación
  comparisonCriteria = {
    sueldo: false,
    profesion: {
      selected: false,
      value: '' // 'mi_profesion' o nombre de profesión específica
    },
    ubicacion: {
      selected: false,
      provincia: '',
      municipio: '',
      localidad: '',
      useMyLocation: false
    }
  };

  // Datos del usuario actual
  currentUserData: any = null;
  currentUserProfesion: string = '';
  currentUserUbicacion: any = null;

  // Datos para dropdowns
  profesionOptions: string[] = [];
  provincias: any[] = [];
  municipios: any[] = [];
  localidades: any[] = [];

  // Estados para mostrar dropdowns
  showProfesionDropdown = false;
  showUbicacionDropdown = false;

  constructor(
    private router: Router,
    public auth: AuthService,
    private userService: UserService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadProfesiones();
    this.loadProvincias();
  }

  private loadUserData(): void {
    const userData = this.userService.getUserData();
    if (userData) {
      this.currentUserData = userData;
      this.currentUserProfesion = userData.profesion || '';
      if (userData.ubicacion) {
        this.currentUserUbicacion = {
          provincia: userData.ubicacion.provincia || '',
          municipio: userData.ubicacion.municipio || '',
          localidad: userData.ubicacion.localidad || ''
        };
      }
    }
  }

  private loadProfesiones(): void {
    this.api.getAll<any>('/profesiones').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.profesionOptions = data.map((prof: any) => 
            typeof prof === 'string' ? prof : prof.nombre || prof
          );
        } else {
          this.profesionOptions = [
            'Tecnología',
            'Docente',
            'Salud',
            'Administración',
            'Ventas',
            'Construcción',
            'Industria',
            'Abogacía',
            'Diseño',
            'Otro',
          ];
        }
      },
      error: (err) => {
        console.error('Error cargando profesiones', err);
        this.profesionOptions = [
          'Tecnología',
          'Docente',
          'Salud',
          'Administración',
          'Ventas',
          'Construcción',
          'Industria',
          'Abogacía',
          'Diseño',
          'Otro',
        ];
      },
    });
  }

  private loadProvincias(): void {
    const cached = localStorage.getItem('provincias_cache');
    if (cached) {
      try {
        this.provincias = JSON.parse(cached);
      } catch {
        localStorage.removeItem('provincias_cache');
      }
    }

    this.api.getAll<any>('/provincias/all').subscribe({
      next: (data) => {
        this.provincias = data ?? [];
        try {
          localStorage.setItem('provincias_cache', JSON.stringify(this.provincias));
        } catch { /* ignore quota errors */ }
      },
      error: (err) => {
        console.error('Error cargando provincias', err);
      },
    });
  }

  private loadComparisonData(): void {
    // TODO: Conectar con el endpoint del backend
    // Por ahora, datos de ejemplo para el diseño
    setTimeout(() => {
      this.currentUser = {
        name: 'Usuario Actual',
        sueldo: 780000,
        profesion: 'Tecnología',
        estadoCivil: 'Soltero',
        ubicacion: {
          provincia: 'Buenos Aires',
          municipio: 'General San Martín',
          localidad: 'Villa Ballester',
        },
        categorias: [
          { name: 'Alimentación', total: 45000 },
          { name: 'Transporte', total: 12000 },
          { name: 'Entretenimiento', total: 15000 },
          { name: 'Servicios', total: 18000 },
        ],
        totalOperaciones: 24,
        primeraFecha: '2025-01-05',
        ultimaFecha: '2025-01-28',
      };

      this.comparedUser = {
        sueldo: 650000,
        profesion: 'Docente',
        estadoCivil: 'Casado',
        ubicacion: {
          provincia: 'Buenos Aires',
          municipio: 'San Isidro',
          localidad: 'San Isidro',
        },
        categorias: [
          { name: 'Alimentación', total: 52000 },
          { name: 'Transporte', total: 15000 },
          { name: 'Educación', total: 25000 },
          { name: 'Servicios', total: 20000 },
        ],
        totalOperaciones: 18,
        primeraFecha: '2025-01-03',
        ultimaFecha: '2025-01-27',
      };

      this.loading = false;
    }, 500);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  toggleCriterion(criterion: 'sueldo' | 'profesion' | 'ubicacion'): void {
    if (criterion === 'sueldo') {
      this.comparisonCriteria.sueldo = !this.comparisonCriteria.sueldo;
    } else if (criterion === 'profesion') {
      this.comparisonCriteria.profesion.selected = !this.comparisonCriteria.profesion.selected;
      this.showProfesionDropdown = this.comparisonCriteria.profesion.selected;
      if (!this.comparisonCriteria.profesion.selected) {
        this.comparisonCriteria.profesion.value = '';
      }
    } else if (criterion === 'ubicacion') {
      this.comparisonCriteria.ubicacion.selected = !this.comparisonCriteria.ubicacion.selected;
      this.showUbicacionDropdown = this.comparisonCriteria.ubicacion.selected;
      if (!this.comparisonCriteria.ubicacion.selected) {
        this.comparisonCriteria.ubicacion.provincia = '';
        this.comparisonCriteria.ubicacion.municipio = '';
        this.comparisonCriteria.ubicacion.localidad = '';
        this.comparisonCriteria.ubicacion.useMyLocation = false;
        this.municipios = [];
        this.localidades = [];
      }
    }
  }

  onProfesionToggle(value: boolean): void {
    this.comparisonCriteria.profesion.selected = value;
    this.showProfesionDropdown = value;
    if (!value) {
      this.comparisonCriteria.profesion.value = '';
    }
  }

  onUbicacionToggle(value: boolean): void {
    this.comparisonCriteria.ubicacion.selected = value;
    this.showUbicacionDropdown = value;
    if (!value) {
      this.comparisonCriteria.ubicacion.provincia = '';
      this.comparisonCriteria.ubicacion.municipio = '';
      this.comparisonCriteria.ubicacion.localidad = '';
      this.comparisonCriteria.ubicacion.useMyLocation = false;
      this.municipios = [];
      this.localidades = [];
    }
  }

  onProfesionSelect(value: string): void {
    this.comparisonCriteria.profesion.value = value;
  }

  onUseMyLocation(): void {
    this.comparisonCriteria.ubicacion.useMyLocation = true;
    if (this.currentUserUbicacion) {
      this.comparisonCriteria.ubicacion.provincia = this.currentUserUbicacion.provincia;
      this.comparisonCriteria.ubicacion.municipio = this.currentUserUbicacion.municipio;
      this.comparisonCriteria.ubicacion.localidad = this.currentUserUbicacion.localidad;
      // Cargar municipios y localidades
      this.setMunicipiosFromProvincia(this.currentUserUbicacion.provincia);
      if (this.currentUserUbicacion.municipio) {
        this.setLocalidadesFromMunicipio(this.currentUserUbicacion.municipio);
      }
    }
  }

  onProvinciaChange(provinciaNombre: string): void {
    this.comparisonCriteria.ubicacion.provincia = provinciaNombre;
    this.comparisonCriteria.ubicacion.useMyLocation = false;
    this.setMunicipiosFromProvincia(provinciaNombre);
    this.comparisonCriteria.ubicacion.municipio = '';
    this.comparisonCriteria.ubicacion.localidad = '';
    this.localidades = [];
  }

  onMunicipioChange(municipioNombre: string): void {
    this.comparisonCriteria.ubicacion.municipio = municipioNombre;
    this.comparisonCriteria.ubicacion.useMyLocation = false;
    this.setLocalidadesFromMunicipio(municipioNombre);
    this.comparisonCriteria.ubicacion.localidad = '';
  }

  onLocalidadChange(localidadNombre: string): void {
    this.comparisonCriteria.ubicacion.localidad = localidadNombre;
    this.comparisonCriteria.ubicacion.useMyLocation = false;
  }

  private setMunicipiosFromProvincia(provinciaNombre: string): void {
    const provincia = this.provincias.find((p) => p?.nombre === provinciaNombre);
    this.municipios = provincia?.municipios ?? [];
  }

  private setLocalidadesFromMunicipio(municipioNombre: string): void {
    const municipio = this.municipios.find((m) => m?.nombre === municipioNombre);
    this.localidades = municipio?.localidades ?? [];
  }

  hasAtLeastOneCriterion(): boolean {
    return this.comparisonCriteria.sueldo || 
           this.comparisonCriteria.profesion.selected || 
           this.comparisonCriteria.ubicacion.selected;
  }

  isProfesionValid(): boolean {
    if (!this.comparisonCriteria.profesion.selected) return true;
    return this.comparisonCriteria.profesion.value !== '';
  }

  isUbicacionValid(): boolean {
    if (!this.comparisonCriteria.ubicacion.selected) return true;
    if (this.comparisonCriteria.ubicacion.useMyLocation) return true;
    return this.comparisonCriteria.ubicacion.provincia !== '' &&
           this.comparisonCriteria.ubicacion.municipio !== '' &&
           this.comparisonCriteria.ubicacion.localidad !== '';
  }

  startComparison(): void {
    if (!this.hasAtLeastOneCriterion()) {
      return;
    }
    
    // Validar que los criterios seleccionados tengan valores
    if (!this.isProfesionValid() || !this.isUbicacionValid()) {
      return;
    }
    
    this.showCriteriaSelection = false;
    this.loading = true;
    this.loadComparisonData();
  }

  resetComparison(): void {
    this.showCriteriaSelection = true;
    this.currentUser = null;
    this.comparedUser = null;
    this.loading = false;
    this.showProfesionDropdown = false;
    this.showUbicacionDropdown = false;
    // Resetear criterios
    this.comparisonCriteria = {
      sueldo: false,
      profesion: {
        selected: false,
        value: ''
      },
      ubicacion: {
        selected: false,
        provincia: '',
        municipio: '',
        localidad: '',
        useMyLocation: false
      }
    };
    this.municipios = [];
    this.localidades = [];
  }
}

