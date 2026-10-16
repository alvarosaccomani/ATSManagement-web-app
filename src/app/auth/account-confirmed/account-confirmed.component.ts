import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AuthService } from '../../core/services/auth.service';

/**
 * Componente (`<app-account-confirmed>`) que verifica el token de confirmación de correo electrónico de un usuario
 * (`/auth/account-confirmed/:usr_ConfirmationToken`) y activa la cuenta.
 */
@Component({
  selector: 'app-account-confirmed',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzAlertModule,
    NzSpinModule
  ],
  templateUrl: './account-confirmed.component.html',
  styleUrl: './account-confirmed.component.scss'
})
export class AccountConfirmedComponent implements OnInit {
  /** Indica si la solicitud de confirmación se está procesando actualmente. */
  isLoading = true;
  /** Indica si la cuenta fue confirmada con éxito. */
  isConfirmed = false;
  /** Mensaje de error que se muestra si el token de confirmación falta, no es válido o ha expirado. */
  errorMessage = '';
  /** Token de confirmación extraído de los parámetros de la ruta. */
  token = '';

  /**
   * Inicializa el componente de confirmación de cuenta.
   *
   * @param _route Instantánea de la ruta activada utilizada para leer `usr_ConfirmationToken`.
   * @param _authService Servicio de autenticación utilizado para confirmar la cuenta.
   */
  constructor(
    private _route: ActivatedRoute,
    private _authService: AuthService
  ) { }

  /**
   * Lee `usr_ConfirmationToken` de la URL e inicia la verificación de la cuenta.
   */
  ngOnInit(): void {
    this.token = this._route.snapshot.params['usr_ConfirmationToken'] || '';

    if (this.token) {
      this.confirmEmail(this.token);
    } else {
      this.isLoading = false;
      this.isConfirmed = false;
      this.errorMessage = 'No se ha detectado un token de confirmación en el enlace.';
    }
  }

  /**
   * Llama a {@link AuthService.confirmAccount} para validar el token y activar la cuenta del usuario.
   *
   * @param token Cadena del token de confirmación.
   */
  private confirmEmail(token: string): void {
    this.isLoading = true;
    this._authService.confirmAccount(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.success === false) {
          this.isConfirmed = false;
          this.errorMessage = response.message || 'El token proporcionado no es válido o ya ha sido utilizado.';
        } else {
          this.isConfirmed = true;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.isConfirmed = false;
        console.error('Error al confirmar cuenta:', error);
        this.errorMessage = error?.error?.error || error?.error?.message || 'Ocurrió un error inesperado al procesar la confirmación de tu cuenta. Por favor, reintenta.';
      }
    });
  }
}
