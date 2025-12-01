// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAuth0 } from '@auth0/auth0-angular';
import { AuthInterceptor } from './interceptors/token.interceptor';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

registerLocaleData(es);

// Función para determinar el redirect_uri según la plataforma
function getRedirectUri(): string {
  // Verificar si estamos en una plataforma móvil
  if (typeof window !== 'undefined') {
    // Verificar si Capacitor está disponible
    const Capacitor = (window as any).Capacitor;
    if (Capacitor) {
      try {
        const platform = Capacitor.getPlatform();
        // Si estamos en Android o iOS, usar el esquema de deep link
        if (platform === 'android' || platform === 'ios') {
          return 'com.gastify.app://';
        }
      } catch (e) {
        // Si falla, continuar con la detección alternativa
      }
    }
    
    // Detección alternativa: verificar si la URL es un esquema personalizado
    // o si estamos en un WebView de Android/iOS
    const userAgent = navigator.userAgent || '';
    const isMobileApp = /Android|iPhone|iPad|iPod/i.test(userAgent) && 
                        !/Chrome|Safari|Firefox/i.test(userAgent);
    
    if (isMobileApp || window.location.protocol === 'capacitor:') {
      return 'com.gastify.app://';
    }
  }
  
  // Para web, usar el origin actual
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideAuth0({
      domain: 'dev-zztnl4usqwhq2jl2.us.auth0.com',
      clientId: '17HyCTqd1XCr5uGcMCMJlmTQmUwz8clj',
      authorizationParams: {
        redirect_uri: getRedirectUri(),
        audience: 'https://dev-zztnl4usqwhq2jl2.us.auth0.com/api/v2/',
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
    }),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
};
