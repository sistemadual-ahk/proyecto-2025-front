import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { switchMap, first } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private apiBaseUrl = environment.API_BACK_URL;

  constructor(private auth: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Si la URL de la petición no es a tu API, no hacemos nada y la dejamos pasar.
    console.log(HttpRequest)
    if (!request.url.startsWith(this.apiBaseUrl)) {
      return next.handle(request);
    }

    // Obtenemos el token de Auth0.
    // Usamos first() para asegurarnos de que la suscripción se complete después de emitir el primer valor.
    return this.auth.getAccessTokenSilently().pipe(
      first(),
      switchMap(token => {
        console.log("token:" + token)
        // Clonamos la petición original y añadimos el token a los headers.
        const authReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        // Pasamos la petición modificada al siguiente handler.
        return next.handle(authReq);
      })
    );
  }
}
