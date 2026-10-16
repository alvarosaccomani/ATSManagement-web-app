import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { AuthService } from '../../core/services/auth.service';

/**
 * Componente de registro de usuario (`<app-register>`) en `/auth/register`.
 *
 * @description Proporciona un formulario de registro reactivo con evaluación de la fortaleza de la contraseña en tiempo real
 * (5 criterios y barra de progreso codificada por colores `#dc3545`, `#ffc107`, `#28a745`) y validación de coincidencia de confirmación de contraseña.
 */
@Component({
  selector: 'app-register',
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
    NzMessageModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  /** Grupo de formulario reactivo de registro. */
  validateForm!: FormGroup;
  /** Indica si hay una solicitud de registro en curso. */
  isSubmitting = false;

  /** Controla si el campo de contraseña es visible en texto plano. */
  showPassword = false;
  /** Indica si la contraseña contiene al menos una letra mayúscula. */
  hasUpperCase = false;
  /** Indica si la contraseña contiene al menos una letra minúscula. */
  hasLowerCase = false;
  /** Indica si la contraseña contiene al menos un dígito numérico. */
  hasNumber = false;
  /** Indica si la contraseña contiene al menos un carácter especial. */
  hasSpecialChar = false;
  /** Indica si la contraseña tiene al menos 8 caracteres de longitud. */
  isValidLength = false;
  /** Ancho porcentual (0-100) de la barra de progreso de fortaleza de la contraseña. */
  progressWidth = 0;
  /** Código de color hexadecimal de la barra de progreso de fortaleza de la contraseña. */
  barColor = '#dc3545';
  /** Indica si el campo de contraseña tiene actualmente el foco. */
  isFocused = false;

  /**
   * Inicializa el componente de registro.
   *
   * @param fb Instancia de `FormBuilder` de Angular.
   * @param message Servicio de mensajes emergentes (toast) de Ng-Zorro.
   * @param _router Instancia de `Router` de Angular.
   * @param _authService Servicio de autenticación.
   */
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _router: Router,
    private _authService: AuthService
  ) { }

  /**
   * Construye el formulario reactivo de registro y se suscribe a los cambios de `usr_password` para retroalimentación de fortaleza en tiempo real.
   */
  ngOnInit(): void {
    this.validateForm = this.fb.group({
      usr_name: [null, [Validators.required, Validators.minLength(2)]],
      usr_surname: [null, [Validators.required, Validators.minLength(2)]],
      usr_nick: [null, [Validators.required, Validators.minLength(3)]],
      usr_email: [null, [Validators.required, Validators.email]],
      usr_password: [null, [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: [null, [Validators.required, this.confirmationValidator]]
    });

    // Suscripción reactiva para validar la fuerza de la contraseña en tiempo real
    this.validateForm.get('usr_password')?.valueChanges.subscribe(value => {
      this.validatePassword(value);
    });
  }

  /**
   * Alterna la visibilidad de la contraseña entre texto oculto y texto plano.
   */
  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Marca el campo de contraseña como enfocado para mostrar la lista de verificación de fortaleza.
   */
  public onFocus(): void {
    this.isFocused = true;
  }

  /**
   * Marca el campo de contraseña como desenfocado.
   */
  public onBlur(): void {
    this.isFocused = false;
  }

  /**
   * Evalúa la contraseña frente a los 5 requisitos de seguridad y actualiza el ancho y el color de la barra de progreso.
   *
   * @param value Cadena de la contraseña actual.
   */
  public validatePassword(value: string): void {
    const password = value || '';
    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasLowerCase = /[a-z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    this.isValidLength = password.length >= 8;

    const totalCriteria = 5;
    const fulfilledCriteria =
      (this.hasUpperCase ? 1 : 0) +
      (this.hasLowerCase ? 1 : 0) +
      (this.hasNumber ? 1 : 0) +
      (this.hasSpecialChar ? 1 : 0) +
      (this.isValidLength ? 1 : 0);

    this.progressWidth = (fulfilledCriteria / totalCriteria) * 100;

    if (this.progressWidth >= 100) {
      this.barColor = '#28a745'; // Verde
    } else if (this.progressWidth >= 60) {
      this.barColor = '#ffc107'; // Amarillo
    } else {
      this.barColor = '#dc3545'; // Rojo
    }
  }

  /**
   * Validador personalizado que requiere que la contraseña cumpla con los 5 criterios de complejidad.
   *
   * @param control Control de formulario que contiene el valor de la contraseña.
   * @returns `{ passwordStrength: true }` si no es válida, o `null` si es válida.
   */
  passwordStrengthValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isValidLength;
    return !passwordValid ? { passwordStrength: true } : null;
  };

  /**
   * Activa la revalidación del control `confirmPassword` cuando cambia la contraseña principal.
   */
  updateConfirmValidator(): void {
    Promise.resolve().then(() => this.validateForm.controls['confirmPassword'].updateValueAndValidity());
  }

  /**
   * Validador personalizado que asegura que `confirmPassword` coincida con `usr_password`.
   *
   * @param control El control de formulario `confirmPassword`.
   * @returns Mapa de errores de validación si está vacío o no coincide, o `{}` si es válido.
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
   * Envía el formulario de registro mediante {@link AuthService.singup} y redirige a `/auth/account-created/:usr_email`.
   */
  public submitForm(): void {
    if (this.validateForm.valid) {
      this.isSubmitting = true;

      // Clonamos el objeto del formulario y eliminamos confirmPassword
      const { confirmPassword, ...userPayload } = this.validateForm.value;

      this._authService.singup(userPayload).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response && response.success === false) {
            this.message.error(response.message || 'Error al registrar el usuario');
          } else {
            const email = this.validateForm.get('usr_email')?.value || '';
            this.message.success('🎉 ¡Registro completado con éxito!');
            this._router.navigate(['/auth/account-created', email]);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error de registro:', error);
          const errDetail = error?.error?.error || error?.error?.message || 'Ocurrió un error inesperado durante el registro.';
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
