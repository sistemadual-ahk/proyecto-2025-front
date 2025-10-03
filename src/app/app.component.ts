import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'gastify-frontend';

  constructor(private router: Router) {}

  onNavigate(route: string) {
    this.router.navigate([route]); // <-- acá sí navega
  }

  ngOnInit() {
    this.preventDoubleTapZoom();
  }

  private preventDoubleTapZoom() {
    // Prevenir zoom al hacer doble tap
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Agregar event listeners para prevenir zoom
    document.addEventListener('touchend', preventZoom, false);
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Prevenir zoom con gestos de pellizco
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturechange', (e) => {
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('gestureend', (e) => {
      e.preventDefault();
    }, { passive: false });
  }
}
