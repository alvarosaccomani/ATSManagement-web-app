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
import { VouchersStatesService } from '../../../core/services/vouchers-states.service';

@Component({
  selector: 'app-voucher-state',
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
  templateUrl: './voucher-state.component.html',
  styleUrl: './voucher-state.component.scss'
})
export class VoucherStateComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  voucherStateId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _vouchersStatesService: VouchersStatesService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      vous_uuid: [{ value: '', disabled: true }],
      vous_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      vous_description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.voucherStateId = this.route.snapshot.paramMap.get('vous_uuid');
    this.isEditing = !!this.voucherStateId;
    
    if (this.isEditing) {
      this.loadVoucherState();
    } else {
      this.form.get('vous_uuid')?.disable();
    }
  }

  loadVoucherState(): void {
    this.isLoading = true;
    this._vouchersStatesService.getVoucherStateById(this.voucherStateId!).subscribe({
      next: (response: any) => {
        if(response.success) {
          const voucherState = response.data;
          this.form.get('vous_uuid')?.enable();
          this.form.patchValue(voucherState);
          this.form.get('vous_uuid')?.disable();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.message.error('No se pudo cargar la información del estado de comprobante');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.message.error('Error de conexión al cargar el estado de comprobante');
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
      this._vouchersStatesService.saveVoucherState(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Estado de comprobante creado correctamente');
            this.router.navigate(['/admin/user/vouchers-states']);
          } else {
            this.message.error(response.message || 'Error al guardar el estado de comprobante');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    } else {
      this._vouchersStatesService.updateVoucherState(this.voucherStateId!, this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Estado de comprobante actualizado correctamente');
            this.router.navigate(['/admin/user/vouchers-states']);
          } else {
            this.message.error(response.message || 'Error al actualizar el estado de comprobante');
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
    this.router.navigate(['/admin/user/vouchers-states']);
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
