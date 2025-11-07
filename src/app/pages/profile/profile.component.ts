import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { AuthService } from '@auth0/auth0-angular';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent, MatSelectModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  usuario = {
    ingresoMensual: 0,
    situacionLaboral: 'Freelance',
    estadoCivil: 'N/A',
    localidad: 'CABA',
    municipio: 'Comuna 1',
    provincia: 'Buenos Aires',
    profesion: 'Tecnología',
  };
  isEditing = false;
  originalUser: any = {};

  // Datos remotos
  provincias: any[] = [];
  municipios: any[] = [];
  localidades: any[] = [];
  profesionOptions: string[] = [];

  // municipios now come from selected provincia -> this.municipios

  // provincias now come from API -> this.provincias

  // localidades now come from selected municipio -> this.localidades

  // profesiones now come from API -> this.profesionOptions

  constructor(
    private router: Router,
    private userService: UserService,
    public auth: AuthService,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    // Cargar datos básicos del usuario inmediatamente (no depende de provincias)
    this.loadUserData();
    this.loadProvincias();
    this.loadProfesiones();
  }

  private loadUserData(): void {
    const userData = this.userService.getUserData();
    if (userData) {
      // Cargar datos básicos del usuario primero (no dependen de provincias)
      // El backend devuelve 'sueldo', pero también verificamos 'ingresoMensual' por compatibilidad
      if (userData.sueldo !== undefined) {
        this.usuario.ingresoMensual = userData.sueldo;
      } else if (userData.ingresoMensual !== undefined) {
        this.usuario.ingresoMensual = userData.ingresoMensual;
      }
      // Cargar situación laboral desde el backend
      // Verificamos diferentes nombres por compatibilidad
      if (userData.situacionLaboral !== undefined && userData.situacionLaboral !== null) {
        this.usuario.situacionLaboral = userData.situacionLaboral;
      } else if (userData.situacion_laboral !== undefined && userData.situacion_laboral !== null) {
        this.usuario.situacionLaboral = userData.situacion_laboral;
      }
      if (userData.profesion) {
        this.usuario.profesion = userData.profesion;
      }
      if (userData.estadoCivil) {
        this.usuario.estadoCivil = userData.estadoCivil;
      }

      // Cargar datos de ubicación (dependen de que las provincias estén cargadas)
      if (userData.ubicacion) {
        this.usuario.provincia = userData.ubicacion.provincia || this.usuario.provincia;
        this.usuario.municipio = userData.ubicacion.municipio || this.usuario.municipio;
        this.usuario.localidad = userData.ubicacion.localidad || this.usuario.localidad;

        // Cargar municipios y localidades según la provincia y municipio seleccionados
        // Solo si las provincias ya están cargadas
        if (this.usuario.provincia && this.provincias.length > 0) {
          this.setMunicipiosFromProvincia(this.usuario.provincia);
          if (this.usuario.municipio) {
            this.setLocalidadesFromMunicipio(this.usuario.municipio);
          }
        }
      }
    }
  }

  private loadProvincias(): void {
    const cached = localStorage.getItem('provincias_cache');
    if (cached) {
      try {
        this.provincias = JSON.parse(cached);
        // Cargar datos del usuario después de cargar provincias desde cache
        this.loadUserData();
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

        // Cargar datos del usuario después de cargar las provincias
        this.loadUserData();

        // Inicializar listas dependientes si hay valores existentes
        if (this.usuario.provincia) {
          this.setMunicipiosFromProvincia(this.usuario.provincia);
          if (this.usuario.municipio) {
            this.setLocalidadesFromMunicipio(this.usuario.municipio);
          }
        }
      },
      error: (err) => {
        console.error('Error cargando provincias', err);
      },
    });
  }

  onProvinciaChange(provinciaNombre: string): void {
    this.usuario.provincia = provinciaNombre;
    this.setMunicipiosFromProvincia(provinciaNombre);
    // Reset dependientes
    this.usuario.municipio = '';
    this.usuario.localidad = '';
    this.localidades = [];
  }

  onMunicipioChange(municipioNombre: string): void {
    this.usuario.municipio = municipioNombre;
    this.setLocalidadesFromMunicipio(municipioNombre);
    // Reset dependiente
    this.usuario.localidad = '';
  }

  private setMunicipiosFromProvincia(provinciaNombre: string): void {
    const provincia = this.provincias.find((p) => p?.nombre === provinciaNombre);
    this.municipios = provincia?.municipios ?? [];
  }

  private setLocalidadesFromMunicipio(municipioNombre: string): void {
    const municipio = this.municipios.find((m) => m?.nombre === municipioNombre);
    this.localidades = municipio?.localidades ?? [];
  }

  private loadProfesiones(): void {
    this.api.getAll<any>('/profesiones').subscribe({
      next: (data) => {
        // Si el backend devuelve objetos con propiedad 'nombre', mapearlos a strings
        if (data && data.length > 0) {
          this.profesionOptions = data.map((prof: any) => 
            typeof prof === 'string' ? prof : prof.nombre || prof
          );
        } else {
          // Fallback a valores por defecto si el backend no devuelve datos
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
        // Fallback a valores por defecto en caso de error
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

  editProfile(): void {
    this.isEditing = true;
    // Guardar una copia de los valores originales para poder descartar cambios
    this.originalUser = { ...this.usuario };
  }

  saveChanges(): void {
    const userData = this.userService.getUserData();
    if (!userData || !userData.id) {
      console.error('No se pudo obtener el ID del usuario');
      return;
    }

    // Construir el objeto con los datos en el formato requerido
    // El parámetro 'profesion' va sin tilde, pero el valor mantiene su formato original
    const updateData = {
      ubicacion: {
        provincia: this.usuario.provincia,
        municipio: this.usuario.municipio,
        localidad: this.usuario.localidad,
      },
      sueldo: this.usuario.ingresoMensual,
      estadoCivil: this.usuario.estadoCivil,
      situacionLaboral: this.usuario.situacionLaboral,
      profesion: this.usuario.profesion, // Valor original con mayúsculas y tildes
    };

    // Enviar la actualización al backend
    this.userService.updateUser(userData.id, updateData).subscribe({
      next: (response) => {
        console.log('Usuario actualizado correctamente', response);
        // Recargar los datos del usuario después de guardar para reflejar los cambios
        this.loadUserData();
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Error al actualizar el usuario:', err);
        // Opcional: mostrar un mensaje de error al usuario
      },
    });
  }

  discardChanges(): void {
    // Restaurar los valores originales
    this.usuario = { ...this.originalUser };
    this.isEditing = false;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
