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

  private loadComparisonData(payload?: any): void {
    if (!payload) {
      // No se recibió payload — no intentamos usar datos hardcodeados.
      console.warn('No se proporcionó payload para la comparación.');
      this.loading = false;
      return;
    }

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

    // Endpoint backend: /usuarios/comparar (API base takes care of /api prefix)
    // Use GET and send criteria as a JSON-encoded query param
    // Ignorar criterios por ahora: siempre llamar GET /usuarios/comparar sin query params
    // Use the exact route registered in the backend router: "/comparar/"
    this.api.get<any>('/usuarios/comparar/').subscribe({
      next: (res) => {
        // ApiService ya devuelve response.data, se espera { usuarios: [ ... ] }
        if (!res) {
          this.loading = false;
          return;
        }

        const usuarios = res.usuarios || (Array.isArray(res) ? res : null);

        if (Array.isArray(usuarios) && usuarios.length >= 1) {
          this.currentUser = mapBackendUser(usuarios[0]);
          if (usuarios.length >= 2) {
            this.comparedUser = mapBackendUser(usuarios[1]);
          } else if (this.currentUserData) {
            this.comparedUser = {
              sueldo: this.currentUserData.sueldo || 0,
              profesion: this.currentUserProfesion,
              estadoCivil: this.currentUserData.estadoCivil || '',
              ubicacion: this.currentUserUbicacion || { provincia: '', municipio: '', localidad: '' },
              categorias: [],
              totalOperaciones: 0,
              primeraFecha: '',
              ultimaFecha: ''
            } as any;
          }
        } else if (Array.isArray(res) && res.length >= 2) {
          this.currentUser = mapBackendUser(res[0]);
          this.comparedUser = mapBackendUser(res[1]);
        } else {
          // Forma inesperada: intentar mapear el objeto recibido
          try {
            this.comparedUser = mapBackendUser(res);
            if (!this.currentUser && this.currentUserData) {
              this.currentUser = {
                sueldo: this.currentUserData.sueldo || 0,
                profesion: this.currentUserProfesion,
                estadoCivil: this.currentUserData.estadoCivil || '',
                ubicacion: this.currentUserUbicacion || { provincia: '', municipio: '', localidad: '' },
                categorias: [],
                totalOperaciones: 0,
                primeraFecha: '',
                ultimaFecha: ''
              } as any;
            }
          } catch (e) {
            console.error('Respuesta inesperada del backend para comparación', res);
          }
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
    // Construir payload para backend
    const payload: any = {
      criterios: {
        sueldo: this.comparisonCriteria.sueldo,
        profesion: null,
        ubicacion: null
      }
    };

    if (this.comparisonCriteria.profesion.selected) {
      if (this.comparisonCriteria.profesion.useMyProfession) {
        payload.criterios.profesion = { useMyProfession: true, value: this.currentUserProfesion };
      } else {
        payload.criterios.profesion = { useMyProfession: false, value: this.comparisonCriteria.profesion.value };
      }
    }

    if (this.comparisonCriteria.ubicacion.selected) {
      if (this.comparisonCriteria.ubicacion.useMyLocation) {
        payload.criterios.ubicacion = { useMyLocation: true, value: this.currentUserUbicacion };
      } else {
        payload.criterios.ubicacion = {
          useMyLocation: false,
          provincia: this.comparisonCriteria.ubicacion.provincia,
          municipio: this.comparisonCriteria.ubicacion.municipio,
          localidad: this.comparisonCriteria.ubicacion.localidad
        };
      }
    }

    // Intentamos llamar al backend para obtener la comparativa. Si falla, usamos datos de ejemplo.
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
      }
    };
    this.municipios = [];
    this.localidades = [];
  }
}

