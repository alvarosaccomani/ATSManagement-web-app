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
import { BanksService } from '../../../core/services/banks.service';

/**
 * Componente para crear y editar una entidad bancaria.
 * @description Proporciona un formulario reactivo para gestionar el nombre y la descripción del banco.
 */
@Component({
  selector: 'app-bank',
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
  templateUrl: './bank.component.html',
  styleUrl: './bank.component.scss'
})
export class BankComponent implements OnInit {
  /** Grupo de formulario reactivo para los campos del banco. */
  form: FormGroup;
  /** Indicador de si hay una solicitud en curso. */
  isLoading = false;
  /** Indicador de si el formulario se encuentra en modo de edición. */
  isEditing = false;
  /** UUID del banco que se está editando, o null al crear uno nuevo. */
  bankId: string | null = null;

  /**
   * Inicializa el componente BankComponent y construye el formulario reactivo.
   * @param fb Servicio FormBuilder de Angular.
   * @param route ActivatedRoute para leer los parámetros de la ruta.
   * @param router Servicio Router de Angular.
   * @param _banksService Servicio para operaciones CRUD de bancos.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _banksService: BanksService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      usr_uuid: [{ value: '', disabled: true }],
      ban_uuid: [{ value: '', disabled: true }],
      ban_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      ban_description: ['', [Validators.maxLength(255)]]
    });
  }

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    this.bankId = this.route.snapshot.paramMap.get('ban_uuid');
    this.isEditing = !!this.bankId;
    
    if (this.isEditing) {
      this.loadBank();
    } else {
      this.form.patchValue({
        usr_uuid: '7a067c90-bf5b-45d1-8f07-91b578e2d54d'
      })
      // Para nuevo, deshabilitar el campo UUID ya que es autogenerado
      this.form.get('ban_uuid')?.disable();
    }
  }

  /**
   * Carga un registro de banco existente por su ID y completa el formulario.
   * @returns void
   */
  loadBank(): void {
    this.isLoading = true;

    this._banksService.getBankById('7a067c90-bf5b-45d1-8f07-91b578e2d54d', this.bankId!).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          const bank = response.data;

          this.form.get('ban_uuid')?.enable();
          this.form.patchValue(bank);
          this.form.get('ban_uuid')?.disable();
          
          this.isLoading = false;
        } else {
          //this.status = 'error'
        }
      },
      (error: any) => {
        let errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null) {
          //this.status = 'error'
        }
      }
    )
  }

  /**
   * Valida y envía el formulario para crear o actualizar el banco.
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
      this._banksService.saveBank(this.form.getRawValue()).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const item = response.item;
            this.router.navigate(['/admin/user/banks']);
          } else {
            this.isLoading = false;
          }
        },
        error =>{
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            this.message.success(errorMessage.error.error);
        }
      )
    } else {
      this._banksService.updateBank(this.form.value).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const item = response.item;
            this.router.navigate(['/admin/user/banks']);
          } else {
            this.isLoading = false;
          }
        },
        error => {
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            if(errorMessage != null) {
              this.message.success(errorMessage.error.error);
            }
        }
      )
    }
  }

  /**
   * Cancela la operación y navega de regreso a la lista de bancos.
   * @returns void
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/banks']);
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