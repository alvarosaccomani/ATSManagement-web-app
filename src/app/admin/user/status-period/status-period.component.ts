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
import { StatusPeriodsService } from '../../../core/services/status-periods.service';

@Component({
  selector: 'app-status-period',
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
  templateUrl: './status-period.component.html',
  styleUrl: './status-period.component.scss'
})
export class StatusPeriodComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  statusPeriodId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _statusPeriodsService: StatusPeriodsService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      sper_uuid: [{ value: '', disabled: true }],
      sper_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      sper_description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.statusPeriodId = this.route.snapshot.paramMap.get('sper_uuid');
    this.isEditing = !!this.statusPeriodId;
    
    if (this.isEditing) {
      this.loadStatusPeriod();
    } else {
      this.form.get('sper_uuid')?.disable();
    }
  }

  loadStatusPeriod(): void {
    this.isLoading = true;
    this._statusPeriodsService.getStatusPeriodById(this.statusPeriodId!).subscribe({
      next: (response: any) => {
        if(response.success) {
          const statusPeriod = response.data;
          this.form.get('sper_uuid')?.enable();
          this.form.patchValue(statusPeriod);
          this.form.get('sper_uuid')?.disable();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.message.error('No se pudo cargar la información del estado del período');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.message.error('Error de conexión al cargar el estado del período');
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
      this._statusPeriodsService.saveStatusPeriod(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Estado del período creado correctamente');
            this.router.navigate(['/admin/user/status-periods']);
          } else {
            this.message.error(response.message || 'Error al guardar el estado del período');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    } else {
      this._statusPeriodsService.updateStatusPeriod(this.statusPeriodId!, this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Estado del período actualizado correctamente');
            this.router.navigate(['/admin/user/status-periods']);
          } else {
            this.message.error(response.message || 'Error al actualizar el estado del período');
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
    this.router.navigate(['/admin/user/status-periods']);
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
