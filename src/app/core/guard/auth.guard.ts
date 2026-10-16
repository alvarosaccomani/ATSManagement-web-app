import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/**
 * Guardián de ruta que restringe el acceso únicamente a usuarios autenticados.
 *
 * @description Verifica si existe una identidad de usuario activa en {@link SessionService}.
 * Si el usuario no está autenticado, redirige a `/auth/login` preservando la URL solicitada en `returnUrl`.
 *
 * @param route Instantánea de la ruta activada.
 * @param state Instantánea del estado del enrutador que contiene la URL de destino.
 * @returns `true` si el usuario está autenticado, o `false` tras redirigir al inicio de sesión.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.getIdentity()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
