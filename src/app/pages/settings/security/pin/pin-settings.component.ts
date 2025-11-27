import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../../../components/page-title/page-title.component';

type PinMode = 'create' | 'edit' | 'askEdit';

@Component({
  selector: 'app-pin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageTitleComponent],
  templateUrl: './pin-settings.component.html',
  styleUrl: './pin-settings.component.scss',
})
export class PinSettingsComponent {
  mode: PinMode = 'create';
  pin: string = '';
  confirmPin: string = '';
  message: string = '';

  constructor(private router: Router) {
    const hasPin = this.readStoredPin() !== null;
    this.mode = hasPin ? 'askEdit' : 'create';
  }

  goBack(): void {
    // Navegación específica de vuelta a security
    this.router.navigate(['/settings/security']).catch(() => {
      // Fallback si hay problemas con la navegación
      window.history.back();
    });
  }

  startEdit(): void {
    this.mode = 'edit';
    this.pin = '';
    this.confirmPin = '';
    this.message = '';
  }

  savePin(): void {
    this.message = '';
    const trimmed = (this.pin || '').trim();
    const confirm = (this.confirmPin || '').trim();

    if (trimmed.length < 4 || trimmed.length > 6) {
      this.message = 'El PIN debe tener entre 4 y 6 dígitos.';
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      this.message = 'El PIN solo puede contener números.';
      return;
    }
    if (trimmed !== confirm) {
      this.message = 'Los PIN ingresados no coinciden.';
      return;
    }

    try {
      localStorage.setItem('userPin', trimmed);
      this.mode = 'askEdit';
      this.pin = '';
      this.confirmPin = '';
      this.message = 'PIN guardado correctamente.';
    } catch {
      this.message = 'No se pudo guardar el PIN.';
    }
  }

  private readStoredPin(): string | null {
    try {
      return localStorage.getItem('userPin');
    } catch {
      return null;
    }
  }
}


