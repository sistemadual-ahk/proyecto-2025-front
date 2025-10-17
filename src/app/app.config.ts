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
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';

registerLocaleData(es);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    
    // Configura HttpClient para usar interceptores de DI (necesario)
    provideHttpClient(withInterceptorsFromDi()), 
    
    provideNzI18n(es_ES),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),
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