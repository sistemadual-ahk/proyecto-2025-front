import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'gastify-frontend';
  showHeader = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.preventDoubleTapZoom();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const hiddenHeaderRoutes = ['/login', '/register', '/'];
        this.showHeader = !hiddenHeaderRoutes.includes(event.urlAfterRedirects);
      });
  }

  onNavigate(route: string) {
    this.router.navigate([route]);
  }

  private preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, false);
    document.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    document.addEventListener(
      'gesturestart',
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener(
      'gesturechange',
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener(
      'gestureend',
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }
}
