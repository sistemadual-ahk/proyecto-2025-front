import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  usuario = {
    ingresoMensual: 0,
    situacionLaboral: 'Freelance',
    localidad: 'CABA',
  };
  isEditing = false;
  originalUser: any = {};

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
