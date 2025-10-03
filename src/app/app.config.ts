// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; 
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAuth0 } from '@auth0/auth0-angular';
import { AuthInterceptor } from './interceptors/token.interceptor'; 
import { AuthGuard } from './guards/auth.guard'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    
    // Configura HttpClient para usar interceptores de DI (necesario)
    provideHttpClient(withInterceptorsFromDi()), 
    
    // ⚠️ 1. CONFIGURACIÓN DE AUTH0 CORREGIDA (Añadimos 'audience')
    provideAuth0({
      domain: 'dev-zztnl4usqwhq2jl2.us.auth0.com',
      clientId: '17HyCTqd1XCr5uGcMCMJlmTQmUwz8clj',
      authorizationParams: {
        redirect_uri: window.location.origin,
        // ✅ CRÍTICO: DEBES REEMPLAZAR ESTO con el valor de tu AUTH0_AUDIENCE del backend
        audience: 'https://dev-zztnl4usqwhq2jl2.us.auth0.com/api/v2/', 
      }
    }),
    
    // ⚠️ 2. REGISTRO DEL INTERCEPTOR (La pieza faltante)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true, // Esto permite múltiples interceptores
    },
    
    // NOTA: Se eliminó el 'provideHttpClient()' redundante.
  ]
};