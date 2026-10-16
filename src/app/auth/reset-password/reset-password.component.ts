import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { AuthService } from '../../core/services/auth.service';

/**
 * Componente de restablecimiento de contraseña (`<app-reset-password>`) en `/auth/reset-password/:usr_ResetPasswordToken`.
 *
 * @description Permite a un usuario con un token de restablecimiento válido establecer y confirmar una nueva contraseña.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzMessageModule,
    NzAlertModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  /** Grupo de formulario reactivo para los campos de nueva contraseña y confirmación. */
  validateForm!: FormGroup;
  /** Indica si la solicitud de restablecimiento de contraseña está en curso. */
  isSubmitting = false;
  /** Indica si la contraseña se ha actualizado con éxito. */
  resetSuccessful = false;
  /** Token de restablecimiento de contraseña extraído de los parámetros de ruta o de consulta. */
  token: string = '';

  /**
   * Inicializa el componente de restablecimiento de contraseña.
   *
   * @param fb Instancia de `FormBuilder` de Angular.
   * @param message Servicio de mensajes emergentes (toast) de Ng-Zorro.
   * @param _router Instancia de `Router` de Angular.
   * @param _route Instantánea de la ruta activada.
   * @param _authService Servicio de autenticación.
   */
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _authService: AuthService
  ) { }

  /**
   * Extrae `usr_ResetPasswordToken` de la ruta e inicializa el formulario de restablecimiento de contraseña.
   */
  ngOnInit(): void {
    // Capturar token desde query params o route params
    this.token = this._route.snapshot.queryParams['usr_ResetPasswordToken'] || 
                 this._route.snapshot.params['usr_ResetPasswordToken'] || 
                 '';

    if (!this.token) {
      this.message.warning('⚠️ No se ha proporcionado un token de restablecimiento válido.');
    }

    this.validateForm = this.fb.group({
      usr_password: [null, [Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]]
    });
  }

  /**
   * Actualiza la validez del control `confirmPassword` cuando cambia `usr_password`.
   */
  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.validateForm.controls['confirmPassword'].updateValueAndValidity());
  }

  /**
   * Validador que verifica que `confirmPassword` coincida con `usr_password`.
   *
   * @param control El control de formulario `confirmPassword`.
   * @returns Mapa de errores de validación si no es válido, o `{}` si es válido.
   */
  confirmationValidator = (control: AbstractControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (this.validateForm && control.value !== this.validateForm.controls['usr_password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  /**
   * Envía la nueva contraseña y el token de restablecimiento a {@link AuthService.resetPassword}.
   */
  public submitForm(): void {
    if (!this.token) {
      this.message.error('Token no válido o expirado. Vuelve a solicitar la recuperación.');
      return;
    }

    if (this.validateForm.valid) {
      this.isSubmitting = true;

      // El payload enviado al backend incluye el token y la nueva contraseña
      const payload = {
        token: this.token,
        usr_resetpasswordtoken: this.token, // para soportar ambos formatos
        newPassword: this.validateForm.value.usr_password,
        usr_password: this.validateForm.value.usr_password // para soportar ambos formatos
      };

      this._authService.resetPassword(payload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response && response.success === false) {
            this.message.error(response.message || 'Error al restablecer la contraseña.');
          } else {
            this.resetSuccessful = true;
            this.message.success('🎉 Contraseña restablecida con éxito. Ya puedes iniciar sesión.');
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error de restablecimiento de contraseña:', error);
          const errDetail = error?.error?.error || error?.error?.message || 'Ocurrió un error inesperado al restablecer la contraseña.';
          this.message.error(errDetail);
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
