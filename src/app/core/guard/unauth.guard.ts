import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/**
 * Guardián de ruta que restringe el acceso únicamente a usuarios no autenticados (invitados).
 *
 * @description Impide que los usuarios autenticados accedan a rutas públicas de autenticación
 * (como inicio de sesión o registro) redirigiéndolos a `/admin/user/documents`.
 *
 * @param route Instantánea de la ruta activada.
 * @param state Instantánea del estado del enrutador.
 * @returns `true` si no existe una sesión activa, o `false` tras redirigir a los usuarios autenticados.
 */
export const unauthGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.getIdentity()) {
    router.navigate(['/admin/user/documents']);
    return false;
  }

  return true;
};
