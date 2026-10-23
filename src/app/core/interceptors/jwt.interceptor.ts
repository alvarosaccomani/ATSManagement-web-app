import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { environment } from '../../../environments/environment';

/**
 * Interceptor HTTP que adjunta el token JWT Bearer a las solicitudes salientes.
 *
 * @description Obtiene el token JWT actual desde {@link SessionService} (o recurre
 * a la lectura de la sesión serializada desde `localStorage`) y clona la solicitud HTTP
 * con un encabezado `Authorization: Bearer <token>` cuando está disponible.
 *
 * @param req La solicitud HTTP saliente.
 * @param next El siguiente manejador en la cadena de interceptores HTTP.
 * @returns Un observable del flujo de eventos HTTP.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);
  const session = sessionService.getCurrentSession();
  let token = session?.token;

  if (!token) {
    try {
      const rawLocalStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('session') : null;
      if (rawLocalStorage) {
        token = JSON.parse(rawLocalStorage)?.token;
      }
    } catch (e) {
      console.error('Error reading localStorage in jwtInterceptor', e);
    }
  }

  // Solo adjuntar token JWT a las peticiones hacia nuestra propia API, nunca a Cloudflare R2 / AWS S3
  const isApiUrl = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api/');
  if (token && isApiUrl) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
