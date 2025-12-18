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
  primeraFecha: string | null;
  ultimaFecha: string | null;
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
      value: '', // 'mi_profesion' o nombre de profesión específica
      useMyProfession: false
    },
    ubicacion: {
      selected: false,
      provincia: '',
      municipio: '',
      localidad: '',
      useMyLocation: false
    },
    anio: null as number | null,
    mes: null as number | null
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
  this.userService.getUserData().subscribe({
    next: (userData) => {
      if (!userData) return;

      this.currentUserData = userData;
      this.currentUserProfesion = userData.profesion || '';

      if (userData.ubicacion) {
        this.currentUserUbicacion = {
          provincia: userData.ubicacion.provincia || '',
          municipio: userData.ubicacion.municipio || '',
          localidad: userData.ubicacion.localidad || ''
        };
      }
      console.debug('UserComparison: loaded userData', {
        profesion: this.currentUserProfesion,
        ubicacion: this.currentUserUbicacion
      });
    },
    error: (err) => {
      console.error('Error al cargar datos del usuario', err);
    }
  });
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

  private loadComparisonData(payload: any): void {
    // Helper para mapear usuario backend a la interfaz local
    const mapBackendUser = (u: any): UserComparisonData => ({
      name: u.name || u.nombre || '',
      sueldo: u.sueldo ?? 0,
      profesion: u.profesion || '',
      estadoCivil: u.estadoCivil || u.estado_civil || '',
      ubicacion: {
        provincia: u.ubicacion?.provincia || '',
        municipio: u.ubicacion?.municipio || '',
        localidad: u.ubicacion?.localidad || '',
      },
      categorias: Array.isArray(u.categorias)
        ? u.categorias.map((c: any) => ({ name: c.nombre || c.name || '', total: c.montoTotal ?? c.total ?? 0 }))
        : [],
      totalOperaciones: u.totalOperaciones ?? u.total_operaciones ?? 0,
      primeraFecha: u.primeraFechaMes ?? u.primeraFecha ?? null,
      ultimaFecha: u.ultimaFechaMes ?? u.ultimaFecha ?? null,
    } as UserComparisonData);

    // POST a usuarios/compararporcriterios
    this.api.create<any>('/usuarios/compararporcriterios', payload).subscribe({
      next: (res) => {
        // ApiService ya devuelve response.data
        if (!res) {
          this.loading = false;
          return;
        }

        // La respuesta tiene la estructura: { usuarioActual, candidato, comparacion }
        // comparacion.usuarios contiene el array con los datos de comparación
        if (res.comparacion && Array.isArray(res.comparacion.usuarios) && res.comparacion.usuarios.length >= 2) {
          this.currentUser = mapBackendUser(res.comparacion.usuarios[0]);
          this.comparedUser = mapBackendUser(res.comparacion.usuarios[1]);
        } else if (res.comparacion && Array.isArray(res.comparacion.usuarios) && res.comparacion.usuarios.length === 1) {
          this.currentUser = mapBackendUser(res.comparacion.usuarios[0]);
          // Si solo hay un usuario, usar datos del candidato si están disponibles
          if (res.candidato) {
            this.comparedUser = mapBackendUser(res.candidato);
          }
        } else {
          console.error('Respuesta inesperada del backend para comparación', res);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener comparación desde backend', err);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  formatDate(dateString: string | null): string {
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
        this.comparisonCriteria.profesion.useMyProfession = false;
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
      this.comparisonCriteria.profesion.useMyProfession = false;
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
    this.comparisonCriteria.profesion.useMyProfession = false;
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

  onUseMyProfession(): void {
    this.comparisonCriteria.profesion.useMyProfession = true;
    if (this.currentUserProfesion) {
      this.comparisonCriteria.profesion.value = this.currentUserProfesion;
    }
    this.showProfesionDropdown = true;
    this.comparisonCriteria.profesion.selected = true;
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
    
    // Construir payload JSON según los campos elegidos
    const payload: any = {};

    // Solo incluir sueldo si está seleccionado
    if (this.comparisonCriteria.sueldo) {
      payload.sueldo = true;
    }

    // Solo incluir profesion si está seleccionada y tiene valor
    if (this.comparisonCriteria.profesion.selected) {
      if (this.comparisonCriteria.profesion.useMyProfession) {
        payload.profesion = this.currentUserProfesion;
      } else if (this.comparisonCriteria.profesion.value) {
        payload.profesion = this.comparisonCriteria.profesion.value;
      }
    }

    // Solo incluir ubicacion si está seleccionada y tiene valores
    if (this.comparisonCriteria.ubicacion.selected) {
      if (this.comparisonCriteria.ubicacion.useMyLocation && this.currentUserUbicacion) {
        payload.ubicacion = {
          provincia: this.currentUserUbicacion.provincia,
          municipio: this.currentUserUbicacion.municipio,
          localidad: this.currentUserUbicacion.localidad
        };
      } else if (this.comparisonCriteria.ubicacion.provincia && 
                 this.comparisonCriteria.ubicacion.municipio && 
                 this.comparisonCriteria.ubicacion.localidad) {
        payload.ubicacion = {
          provincia: this.comparisonCriteria.ubicacion.provincia,
          municipio: this.comparisonCriteria.ubicacion.municipio,
          localidad: this.comparisonCriteria.ubicacion.localidad
        };
      }
    }

    // Incluir anio y mes si están definidos
    if (this.comparisonCriteria.anio !== null && this.comparisonCriteria.anio !== undefined) {
      payload.anio = this.comparisonCriteria.anio;
    }

    if (this.comparisonCriteria.mes !== null && this.comparisonCriteria.mes !== undefined) {
      payload.mes = this.comparisonCriteria.mes;
    }

    // Llamar al backend con POST
    this.loadComparisonData(payload);
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
        value: '',
        useMyProfession: false
      },
      ubicacion: {
        selected: false,
        provincia: '',
        municipio: '',
        localidad: '',
        useMyLocation: false
      },
      anio: null,
      mes: null
    };
    this.municipios = [];
    this.localidades = [];
  }
}

