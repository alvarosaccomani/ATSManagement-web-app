import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';

/**
 * Componente receptor de callback del SSO Central (`<app-sso-callback>`) en `/auth/sso-callback`.
 *
 * @description Lee el parámetro de consulta `token` devuelto por el portal Central SSO,
 * lo valida frente a {@link AuthService.verifySSOToken}, persiste la sesión resultante
 * y redirige al usuario a su espacio de trabajo.
 */
@Component({
  selector: 'app-sso-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sso-callback.component.html',
  styleUrl: './sso-callback.component.scss'
})
export class SsoCallbackComponent implements OnInit {
  /** Estado actual del intercambio SSO (`'loading' | 'success' | 'error'`). */
  public status: 'loading' | 'success' | 'error' = 'loading';
  /** Mensaje de error que se muestra cuando falla la verificación SSO. */
  public errorMessage = '';

  /**
   * Inicializa el componente de callback de SSO.
   *
   * @param route Ruta activada utilizada para extraer el parámetro de consulta `token`.
   * @param router Instancia de `Router` de Angular.
   * @param authService Servicio de autenticación para la verificación del token.
   * @param sessionService Servicio de almacenamiento de sesión.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService
  ) {}

  /**
   * Extrae el parámetro de consulta `token` durante la inicialización e inicia la verificación.
   */
  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'error';
      this.errorMessage = 'No se proporcionó un token de intercambio válido para la autenticación SSO.';
      return;
    }

    this.verifyToken(token);
  }

  /**
   * Intercambia el token SSO con el backend y persiste la sesión del usuario autenticado.
   *
   * @param token Token de intercambio SSO proveniente de la cadena de consulta de la URL.
   */
  private verifyToken(token: string): void {
    this.status = 'loading';
    this.authService.verifySSOToken(token).subscribe({
      next: (res: any) => {
        if (res.success && res.data?.token && res.data?.user) {
          this.status = 'success';
          
          // Guardar identidad y token en el localstorage del satélite
          this.sessionService.setIdentity(JSON.stringify(res.data.user));
          this.sessionService.setToken(res.data.token);
          
          // Redirigir a documentos
          setTimeout(() => {
            this.router.navigate(['/admin/user/documents']);
          }, 1200);
        } else {
          this.status = 'error';
          this.errorMessage = 'El servidor no devolvió una sesión válida de SSO.';
        }
      },
      error: (err: any) => {
        this.status = 'error';
        this.errorMessage = err.error?.error || err.error?.message || 'El token de intercambio SSO es inválido o ya ha expirado.';
      }
    });
  }

  /**
   * Redirige al usuario de vuelta a `/auth/login` para reintentar la autenticación.
   */
  public retryLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
