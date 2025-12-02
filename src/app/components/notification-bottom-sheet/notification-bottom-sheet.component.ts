import { OnInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  icono: string;
  visualizada: boolean;
}

@Component({
  selector: 'notification-bottom-sheet',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatBottomSheetModule],
  templateUrl: './notification-bottom-sheet.component.html',
  styleUrls: ['./notification-bottom-sheet.component.scss'],
})
export class NotificationBottomSheet implements OnInit {
  private _bottomSheetRef = inject<MatBottomSheetRef<NotificationBottomSheet>>(MatBottomSheetRef);

  notificaciones: Notificacion[] = [
    {
      id: 1,
      titulo: 'Se agregó un nuevo gasto',
      mensaje: 'Hace 1 semana',
      fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icono: 'mdi-bell',
      visualizada: false
    },
    {
      id: 2,
      titulo: 'Alcanzaste un objetivo',
      mensaje: 'Hace 1 semana',
      fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icono: 'mdi-trophy',
      visualizada: false
    },
    {
      id: 3,
      titulo: 'Acóntaste un objetivo',
      mensaje: 'Hace 1 semana',
      fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icono: 'mdi-piggy-bank',
      visualizada: true
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  onClose(): void {
    this._bottomSheetRef.dismiss();
  }

  marcarComoVisualizada(notificacion: Notificacion): void {
    notificacion.visualizada = true;
  }

  marcarTodasComoVisualizadas(): void {
    this.notificaciones.forEach(n => n.visualizada = true);
  }
}
