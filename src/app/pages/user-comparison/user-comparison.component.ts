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
      value: '' // Si es la profesión del usuario actual, se usa currentUserProfesion
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
    // Si selecciona "Mi misma profesión", usar currentUserProfesion
    if (value === this.currentUserProfesion) {
      this.comparisonCriteria.profesion.value = this.currentUserProfesion;
    }
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
    
    // Preparar payload para el backend
    const payload = this.prepareComparisonPayload();
    console.log('Payload JSON para backend:', JSON.stringify(payload, null, 2));
    console.log('Payload objeto:', payload);
    
    this.showCriteriaSelection = false;
    this.loading = true;
    
    // Llamar al endpoint del backend (GET con body)
    // getWithBody ya devuelve response.data, así que data es directamente el objeto data de la respuesta
    this.api.getWithBody<any>('/usuarios/compararporcriterios', payload).subscribe({
      next: (data) => {
        console.log('Respuesta completa del servidor (data):', data);
        console.log('Usuario actual:', data.usuarioActual);
        console.log('Comparación:', data.comparacion);
        
        // Mapear datos del usuario actual
        if (data.usuarioActual) {
          this.currentUser = this.mapUserData(data.usuarioActual, true);
          console.log('Usuario actual mapeado:', this.currentUser);
        }
        
        // Mapear datos de comparación (array de usuarios)
        if (data.comparacion?.usuarios && Array.isArray(data.comparacion.usuarios)) {
          const usuarios = data.comparacion.usuarios;
          console.log('Usuarios en comparación:', usuarios);
          
          // Si hay usuarios en el array, el primero es el actual (si no se mapeó arriba) o todos son comparados
          if (usuarios.length > 0) {
            // Si no mapeamos usuarioActual arriba, el primero del array es el actual
            if (!this.currentUser) {
              this.currentUser = this.mapUserData(usuarios[0], true);
              console.log('Usuario actual desde array:', this.currentUser);
            }
            
            // El segundo usuario del array es el comparado (o el primero si ya mapeamos el actual)
            if (usuarios.length > 1) {
              this.comparedUser = this.mapUserData(usuarios[1], false);
            } else if (usuarios.length === 1 && this.currentUser) {
              // Si solo hay uno y ya mapeamos el actual, este es el comparado
              this.comparedUser = this.mapUserData(usuarios[0], false);
            }
            console.log('Usuario comparado mapeado:', this.comparedUser);
          }
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al comparar usuarios', err);
        console.error('Error completo:', JSON.stringify(err, null, 2));
        console.error('Payload enviado:', JSON.stringify(payload, null, 2));
        this.loading = false;
        // TODO: Mostrar mensaje de error al usuario
        // Revertir a la selección de criterios si hay error
        this.showCriteriaSelection = true;
      }
    });
  }

  /**
   * Prepara el payload para enviar al backend
   * Solo incluye los campos que fueron seleccionados
   * Formato: { sueldo: true, profesion: "valor", ubicacion: {...}, mes: X, anio: Y }
   */
  private prepareComparisonPayload(): any {
    const payload: any = {};
    const now = new Date();
    const mes = now.getMonth() + 1; // getMonth() devuelve 0-11
    const anio = now.getFullYear();

    // Sueldo: si está seleccionado, enviar true
    if (this.comparisonCriteria.sueldo) {
      payload.sueldo = true;
    }

    // Profesión: si está seleccionado y tiene valor
    if (this.comparisonCriteria.profesion.selected && this.comparisonCriteria.profesion.value) {
      // El valor ya viene del dropdown (puede ser currentUserProfesion o otra profesión)
      payload.profesion = this.comparisonCriteria.profesion.value;
    }

    // Ubicación: si está seleccionado
    if (this.comparisonCriteria.ubicacion.selected) {
      if (this.comparisonCriteria.ubicacion.useMyLocation && this.currentUserUbicacion) {
        // Usar ubicación del usuario actual
        payload.ubicacion = {
          provincia: this.currentUserUbicacion.provincia,
          municipio: this.currentUserUbicacion.municipio,
          localidad: this.currentUserUbicacion.localidad
        };
      } else if (
        this.comparisonCriteria.ubicacion.provincia &&
        this.comparisonCriteria.ubicacion.municipio &&
        this.comparisonCriteria.ubicacion.localidad
      ) {
        // Usar ubicación seleccionada manualmente
        payload.ubicacion = {
          provincia: this.comparisonCriteria.ubicacion.provincia,
          municipio: this.comparisonCriteria.ubicacion.municipio,
          localidad: this.comparisonCriteria.ubicacion.localidad
        };
      }
    }

    // Siempre incluir mes y año
    payload.mes = mes;
    payload.anio = anio;

    return payload;
  }

  /**
   * Mapea los datos del usuario recibidos del backend al formato esperado
   */
  private mapUserData(userData: any, isCurrentUser: boolean = false): UserComparisonData {
    // Mapear categorías del formato del backend
    const categorias: CategoryData[] = [];
    if (userData.categorias && Array.isArray(userData.categorias)) {
      categorias.push(...userData.categorias.map((cat: any) => ({
        name: cat.nombre || cat.name || '',
        total: cat.montoTotal || cat.total || 0
      })));
    }

    return {
      name: isCurrentUser ? userData.name : undefined, // Solo el usuario actual tiene nombre
      sueldo: userData.sueldo || 0,
      profesion: userData.profesion || '',
      estadoCivil: userData.estadoCivil || userData.estado_civil || '',
      ubicacion: {
        provincia: userData.ubicacion?.provincia || '',
        municipio: userData.ubicacion?.municipio || '',
        localidad: userData.ubicacion?.localidad || ''
      },
      categorias: categorias,
      totalOperaciones: userData.totalOperaciones || 0,
      primeraFecha: userData.primeraFechaMes || userData.primera_fecha_mes || '',
      ultimaFecha: userData.ultimaFechaMes || userData.ultima_fecha_mes || ''
    };
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

