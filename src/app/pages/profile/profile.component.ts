import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PageTitleComponent } from '../../components/page-title/page-title.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user = {
    name: 'Juan Pérez',
    email: 'juan.perez@gmail.com',
    monthlyIncome: 2500,
    employmentStatus: 'Freelance',
    location: 'CABA',
    profilePicture: null
  };

  isEditing = false;
  originalUser: any = {};

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    // Aquí podrías cargar los datos del usuario desde el servicio
    // Por ahora usamos datos de ejemplo
    this.originalUser = { ...this.user };
  }

  editProfile(): void {
    this.isEditing = true;
    this.originalUser = { ...this.user };
  }

  saveChanges(): void {
    // Aquí guardarías los cambios en el backend
    console.log('Guardando cambios:', this.user);
    this.isEditing = false;
    // Mostrar mensaje de éxito
  }

  discardChanges(): void {
    this.user = { ...this.originalUser };
    this.isEditing = false;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  onProfilePictureChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
