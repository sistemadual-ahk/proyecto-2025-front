import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { AuthService } from '@auth0/auth0-angular';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../services/api.service';
import { UserDTO } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent, MatSelectModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  usuario = {
    telegramID: '',
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
  situacionLaboralOptions: string[] = ['Desempleado', 'Empleado', 'Empresario', 'Estudiante', 'Freelance'].sort();
  estadoCivilOptions: string[] = ['Casado', 'N/A', 'Soltero'].sort();

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
    this.userService.getUserData().subscribe((userData) => {
      if (userData) {
        // Cargar datos básicos
        this.usuario.ingresoMensual = userData.sueldo ?? userData.ingreso_mensual;

        this.usuario.situacionLaboral =
          userData.situacion_laboral ?? userData.situacion_laboral ?? this.usuario.situacionLaboral;

        if (userData.profesion) {
          this.usuario.profesion = userData.profesion;
        }
        if (userData.estadoCivil) {
          this.usuario.estadoCivil = userData.estadoCivil;
        }

        // Ubicación
        if (userData.ubicacion) {
          this.usuario.provincia = userData.ubicacion.provincia || this.usuario.provincia;
          this.usuario.municipio = userData.ubicacion.municipio || this.usuario.municipio;
          this.usuario.localidad = userData.ubicacion.localidad || this.usuario.localidad;

          if (this.usuario.provincia && this.provincias.length > 0) {
            this.setMunicipiosFromProvincia(this.usuario.provincia);
            if (this.usuario.municipio) {
              this.setLocalidadesFromMunicipio(this.usuario.municipio);
            }
          }
        }
      }
    });
  }


  private loadProvincias(): void {
    const cached = localStorage.getItem('provincias_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const uniqueProvincias = Array.from(new Map(parsed.map((item: any) => [item.nombre, item])).values());
        this.provincias = uniqueProvincias.sort((a: any, b: any) => 
          (a.nombre || '').localeCompare(b.nombre || '')
        );
        // Cargar datos del usuario después de cargar provincias desde cache
        this.loadUserData();
      } catch {
        localStorage.removeItem('provincias_cache');
      }
    }

    this.api.getAll<any>('/provincias/all').subscribe({
      next: (data) => {
        const uniqueProvincias = Array.from(new Map((data ?? []).map((item: any) => [item.nombre, item])).values());
        this.provincias = uniqueProvincias.sort((a: any, b: any) => 
          (a.nombre || '').localeCompare(b.nombre || '')
        );
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
    const rawMunicipios = provincia?.municipios ?? [];
    const uniqueMunicipios = Array.from(new Map(rawMunicipios.map((m: any) => [m.nombre, m])).values());
    this.municipios = uniqueMunicipios.sort((a: any, b: any) => 
      (a.nombre || '').localeCompare(b.nombre || '')
    );
  }

  private setLocalidadesFromMunicipio(municipioNombre: string): void {
    const municipio = this.municipios.find((m) => m?.nombre === municipioNombre);
    const rawLocalidades = municipio?.localidades ?? [];
    const uniqueLocalidades = Array.from(new Map(rawLocalidades.map((l: any) => [l.nombre, l])).values());
    this.localidades = uniqueLocalidades.sort((a: any, b: any) => 
      (a.nombre || '').localeCompare(b.nombre || '')
    );
  }

  private loadProfesiones(): void {
    this.api.getAll<any>('/profesiones').subscribe({
      next: (data) => {
        // Si el backend devuelve objetos con propiedad 'nombre', mapearlos a strings
        if (data && data.length > 0) {
          const mapped = data.map((prof: any) =>
            typeof prof === 'string' ? prof : prof.nombre || prof
          );
          this.profesionOptions = Array.from(new Set(mapped)).sort((a: any, b: any) => a.localeCompare(b));
        } else {
          // Fallback a valores por defecto si el backend no devuelve datos
          this.profesionOptions = [
            'Abogacía',
            'Administración',
            'Construcción',
            'Diseño',
            'Docente',
            'Industria',
            'Otro',
            'Salud',
            'Tecnología',
            'Ventas',
          ].sort();
        }
      },
      error: (err) => {
        console.error('Error cargando profesiones', err);
        // Fallback a valores por defecto en caso de error
        this.profesionOptions = [
          'Abogacía',
          'Administración',
          'Construcción',
          'Diseño',
          'Docente',
          'Industria',
          'Otro',
          'Salud',
          'Tecnología',
          'Ventas',
        ].sort();
      },
    });
  }

  editProfile(): void {
    this.isEditing = true;
    // Guardar una copia de los valores originales para poder descartar cambios
    this.originalUser = { ...this.usuario };
  }



  saveChanges(): void {
    this.userService.getUserData().subscribe({
      next: (userData) => {
        if (!userData || !userData.id) {
          console.error('No se pudo obtener el ID del usuario');
          return;
        }

        const payload: Partial<UserDTO> = {
          // Mapear campos locales a los esperados por UserDTO
          telegramId: this.usuario?.telegramID ?? '',
          ingreso_mensual: this.usuario.ingresoMensual,
          sueldo: this.usuario.ingresoMensual,
          situacion_laboral: this.usuario.situacionLaboral,
          estadoCivil: this.usuario.estadoCivil,
          profesion: this.usuario.profesion,
          // Ubicación anidada según UserDTO
          ubicacion: {
            provincia: this.usuario.provincia,
            municipio: this.usuario.municipio,
            localidad: this.usuario.localidad,
          }
        } as Partial<UserDTO>;

        console.debug('Profile: updating user', { id: userData.id, payload });

        this.userService.updateUser(userData.id, payload).subscribe({
          next: (updatedUser) => {
            console.log('Datos actualizados correctamente:', updatedUser);
            // actualizar la UI local con lo guardado
            this.isEditing = false;
            this.originalUser = {};
          },
          error: (err) => {
            console.error('Error al actualizar datos', err);
            // Mostrar más detalles si la respuesta contiene error del backend
            if (err?.error) {
              console.debug('Backend error payload:', err.error);
            }
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener datos del usuario', err);
      }
    });
  }


  discardChanges(): void {
    // Restaurar los valores originales
    this.usuario = { ...this.originalUser };
    this.isEditing = false;
  }

  goBack(): void {
    const fromSettings = window.history.state?.fromSettings;
    if (fromSettings) {
      this.router.navigate(['/settings']).catch(() => window.history.back());
    } else {
      this.router.navigate(['/home']).catch(() => window.history.back());
    }
  }
}
