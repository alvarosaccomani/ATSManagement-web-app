import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { SessionService } from '../../core/services/session.service';
import { AuthService } from '../../core/services/auth.service';

/**
 * Componente de inicio de sesión de usuario (`<app-login>`) en `/auth/login`.
 *
 * @description Admite tanto la autenticación local (`usr_user` y `usr_password`) como la delegación
 * automática al portal Central SSO cuando `app_login_mode === 'central'`.
 */
@Component({
  selector: 'app-login',
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
    NzMessageModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  /** Grupo de formulario reactivo de inicio de sesión. */
  validateForm!: FormGroup;
  /** Indica si hay una solicitud de inicio de sesión en curso. */
  isSubmitting = false;
  /** Identidad del usuario autenticado devuelta por el backend. */
  public identity: any = null;
  /** Token JWT firmado devuelto por el backend. */
  public token: any = null;

  /**
   * Inicializa el componente de inicio de sesión.
   *
   * @param fb Instancia de `FormBuilder` de Angular.
   * @param message Servicio de mensajes emergentes (toast) de Ng-Zorro.
   * @param _router Instancia de `Router` de Angular.
   * @param _sessionService Servicio de persistencia de sesión.
   * @param _authService Servicio de API de autenticación.
   */
  constructor(
    private fb: FormBuilder, 
    private message: NzMessageService,
    private _router: Router,
    private _sessionService: SessionService,
    private _authService: AuthService
  ) {}

  /**
   * Verifica la configuración SSO del backend e inicializa los controles del formulario de inicio de sesión.
   */
  ngOnInit(): void {
    this.checkAppConfig();
    this.validateForm = this.fb.group({
      usr_user: [null, [Validators.required]],
      usr_password: [null, [Validators.required]]
    });
  }

  /**
   * Consulta {@link AuthService.getAppConfig} y redirige a `central_login_url` si `app_login_mode === 'central'`.
   */
  private checkAppConfig(): void {
    this._authService.getAppConfig().subscribe({
      next: (data: any) => {
        if (data.success && data.app_login_mode === 'central' && data.central_login_url) {
          window.location.href = data.central_login_url;
        }
      },
      error: (err) => console.error('Error al obtener la configuración SSO:', err)
    });
  }

  /**
   * Envía las credenciales de inicio de sesión local, almacena la identidad del usuario en {@link SessionService},
   * registra el evento de autenticación y solicita el token JWT.
   */
  submitForm(): void {
    if (this.validateForm.valid) {
      this.isSubmitting = true;

      this._authService.login(this.validateForm.value).subscribe({
        next: (response: any) => {
          this.identity = response.data;
          if(!this.identity || !this.identity.usr_uuid) {
            this.message.error('error');
          } else {
            //persist user data
            this._sessionService.setIdentity(JSON.stringify(this.identity));

            // Enviar evento de login exitoso al Kernel Central
            this._authService.logAuth(this.identity.usr_uuid, 'Management').subscribe({
              error: (err: any) => console.error('Error al enviar log a Central:', err)
            });

            //get token
            this.getToken();
          }
          this.isSubmitting = false;
        },
        error: (err: any) => {
          this.isSubmitting = false;
          console.error(err);
          const errMsg = err.error?.error || err.error?.message || 'Error de conexión con el servidor';
          this.message.error(errMsg);
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

  /**
   * Solicita un token JWT firmado tras verificar la identidad, lo persiste en {@link SessionService}
   * y navega a `/admin/user/documents`.
   */
  private getToken(): void {
    this._authService.login(this.validateForm.value, 'true').subscribe({
      next: (response: any) => {
        this.token = response.data.token;
        if(this.token.length <= 0) {
            this.message.error('error');
        } else {
            //persist user token
            this._sessionService.setToken(this.token);
            this._router.navigate(['/admin/user/documents']);
        }
      },
      error: (err: any) => {
        console.error(err);
        const errMsg = err.error?.error || err.error?.message || 'Error de conexión con el servidor';
        this.message.error(errMsg);
      }
    });
  }
}