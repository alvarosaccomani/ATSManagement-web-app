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
import { TypeOperationsService } from '../../../core/services/type-operations.service';

@Component({
  selector: 'app-type-operation',
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
  templateUrl: './type-operation.component.html',
  styleUrl: './type-operation.component.scss'
})
export class TypeOperationComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  typeOperationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _typeOperationsService: TypeOperationsService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      tyop_uuid: [{ value: '', disabled: true }],
      tyop_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      tyop_description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.typeOperationId = this.route.snapshot.paramMap.get('tyop_uuid');
    this.isEditing = !!this.typeOperationId;
    
    if (this.isEditing) {
      this.loadTypeOperation();
    } else {
      this.form.get('tyop_uuid')?.disable();
    }
  }

  loadTypeOperation(): void {
    this.isLoading = true;
    this._typeOperationsService.getTypeOperationById(this.typeOperationId!).subscribe({
      next: (response: any) => {
        if(response.success) {
          const typeOperation = response.data;
          this.form.get('tyop_uuid')?.enable();
          this.form.patchValue(typeOperation);
          this.form.get('tyop_uuid')?.disable();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.message.error('No se pudo cargar la información del tipo de operación');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.message.error('Error de conexión al cargar el tipo de operación');
      }
    });
  }

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
      this._typeOperationsService.saveTypeOperation(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Tipo de operación creado correctamente');
            this.router.navigate(['/admin/user/type-operations']);
          } else {
            this.message.error(response.message || 'Error al guardar el tipo de operación');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    } else {
      this._typeOperationsService.updateTypeOperation(this.typeOperationId!, this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Tipo de operación actualizado correctamente');
            this.router.navigate(['/admin/user/type-operations']);
          } else {
            this.message.error(response.message || 'Error al actualizar el tipo de operación');
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

  onCancel(): void {
    this.router.navigate(['/admin/user/type-operations']);
  }

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
