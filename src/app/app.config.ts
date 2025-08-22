// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; 
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAuth0 } from '@auth0/auth0-angular';
import { AuthInterceptor } from './interceptors/token.interceptor'; // Importa tu interceptor
import { AuthGuard } from './guards/auth.guard'; // Importa tu guard


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    provideAuth0({
      domain: 'dev-zztnl4usqwhq2jl2.us.auth0.com',
      clientId: '17HyCTqd1XCr5uGcMCMJlmTQmUwz8clj',
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
  ]
};