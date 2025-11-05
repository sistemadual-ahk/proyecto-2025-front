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

  // municipios now come from selected provincia -> this.municipios

  // provincias now come from API -> this.provincias

  // localidades now come from selected municipio -> this.localidades

  profesionOptions: string[] = [
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

  constructor(
    private router: Router,
    private userService: UserService,
    public auth: AuthService,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.loadProvincias();
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

  editProfile(): void {
    this.isEditing = true;
  }

  saveChanges(): void {
    this.isEditing = false;
  }

  discardChanges(): void {
    this.isEditing = false;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
