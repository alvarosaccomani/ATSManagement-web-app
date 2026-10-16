import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { BrandCardsService } from '../../../core/services/brand-cards.service';

/**
 * Componente para crear y editar un registro de marca de tarjeta.
 * @description Proporciona un formulario reactivo para gestionar el nombre y la descripción de la marca de tarjeta.
 */
@Component({
  selector: 'app-brand-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    NzDividerModule
  ],
  templateUrl: './brand-card.component.html',
  styleUrl: './brand-card.component.scss'
})
export class BrandCardComponent implements OnInit {
  /** Grupo de formulario reactivo para los campos de marca de tarjeta. */
  form: FormGroup;
  /** Indicador de si hay una solicitud en curso. */
  isLoading = false;
  /** Indicador de si el formulario se encuentra en modo de edición. */
  isEditing = false;
  /** UUID de la marca de tarjeta que se está editando, o null al crear una nueva. */
  brandCardId: string | null = null;

  /**
   * Inicializa el componente BrandCardComponent y construye el formulario reactivo.
   * @param fb Servicio FormBuilder de Angular.
   * @param route ActivatedRoute para leer los parámetros de la ruta.
   * @param router Servicio Router de Angular.
   * @param _brandCardsService Servicio para operaciones CRUD de marcas de tarjeta.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _brandCardsService: BrandCardsService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      brcrd_uuid: [{ value: '', disabled: true }],
      brcrd_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      brcrd_description: ['', [Validators.maxLength(255)]]
    });
  }

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    this.brandCardId = this.route.snapshot.paramMap.get('brcrd_uuid');
    this.isEditing = !!this.brandCardId;
    
    if (this.isEditing) {
      this.loadBrandCard();
    } else {
      this.form.get('brcrd_uuid')?.disable();
    }
  }

  /**
   * Carga un registro de marca de tarjeta existente por su ID y completa el formulario.
   * @returns void
   */
  loadBrandCard(): void {
    this.isLoading = true;
    this._brandCardsService.getBrandCardById(this.brandCardId!).subscribe({
      next: (response: any) => {
        if(response.success) {
          const brandCard = response.data;
          this.form.get('brcrd_uuid')?.enable();
          this.form.patchValue(brandCard);
          this.form.get('brcrd_uuid')?.disable();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.message.error('No se pudo cargar la información de la marca');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.message.error('Error de conexión al cargar la marca');
      }
    });
  }

  /**
   * Valida y envía el formulario para crear o actualizar la marca de tarjeta.
   * @returns void
   */
  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Por favor complete todos los campos obligatorios');
      return;
    }

    this.isLoading = true;

    if(!this.isEditing) {
      this._brandCardsService.saveBrandCard(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Marca de tarjeta creada correctamente');
            this.router.navigate(['/admin/user/brand-cards']);
          } else {
            this.message.error(response.message || 'Error al guardar la marca');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    } else {
      this._brandCardsService.updateBrandCard(this.brandCardId!, this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Marca de tarjeta actualizada correctamente');
            this.router.navigate(['/admin/user/brand-cards']);
          } else {
            this.message.error(response.message || 'Error al actualizar la marca');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    }
  }

  /**
   * Cancela la operación y navega de regreso a la lista de marcas de tarjeta.
   * @returns void
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/brand-cards']);
  }

  /**
   * Obtiene el mensaje de error de validación para un control del formulario.
   * @param controlName Nombre del control del formulario.
   * @returns Mensaje de error de validación o null.
   */
  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    return null;
  }
}
