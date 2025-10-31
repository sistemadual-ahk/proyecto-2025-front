import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { AuthService } from '@auth0/auth0-angular';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent, MatSelectModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
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

  municipioOptions: string[] = [
    'Comuna 1',
    'Comuna 2',
    'Comuna 3',
    'Comuna 4',
    'Comuna 5',
    'Comuna 6',
    'Comuna 7',
    'Comuna 8',
    'Comuna 9',
    'Comuna 10',
    'Comuna 11',
    'Comuna 12',
    'Comuna 13',
    'Comuna 14',
    'Comuna 15',
  ];

  provinciaOptions: string[] = [
    'Buenos Aires',
    'Ciudad Autónoma de Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
  ];

  localidadOptions: string[] = [
    'CABA',
    'Lanús',
    'Avellaneda',
    'Quilmes',
    'Lomas de Zamora',
    'La Plata',
    'Morón',
    'Vicente López',
    'San Isidro',
    'San Martín',
  ];

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
    public auth: AuthService
  ) { }

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
