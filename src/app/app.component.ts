import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'gastify-frontend';

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
