import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { AuthService } from '@auth0/auth0-angular';

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
  imports: [CommonModule, PageTitleComponent],
  templateUrl: './user-comparison.component.html',
  styleUrl: './user-comparison.component.scss',
})
export class UserComparisonComponent implements OnInit {
  currentUser: UserComparisonData | null = null;
  comparedUser: UserComparisonData | null = null;
  loading = true;

  constructor(
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    // Simular carga de datos (luego se conectará con el backend)
    this.loadComparisonData();
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
}

