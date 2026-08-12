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
import { PaymentPeriodsStatusService } from '../../../core/services/payment-periods-status.service';

@Component({
  selector: 'app-payment-period-status',
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
  templateUrl: './payment-period-status.component.html',
  styleUrl: './payment-period-status.component.scss'
})
export class PaymentPeriodStatusComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  paymentPeriodStatusId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _paymentPeriodsStatusService: PaymentPeriodsStatusService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      payps_uuid: [{ value: '', disabled: true }],
      payps_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      payps_description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.paymentPeriodStatusId = this.route.snapshot.paramMap.get('payps_uuid');
    this.isEditing = !!this.paymentPeriodStatusId;
    
    if (this.isEditing) {
      this.loadPaymentPeriodStatus();
    } else {
      this.form.get('payps_uuid')?.disable();
    }
  }

  loadPaymentPeriodStatus(): void {
    this.isLoading = true;
    this._paymentPeriodsStatusService.getPaymentPeriodStatusById(this.paymentPeriodStatusId!).subscribe({
      next: (response: any) => {
        if(response.success) {
          const paymentPeriodStatus = response.data;
          this.form.get('payps_uuid')?.enable();
          this.form.patchValue(paymentPeriodStatus);
          this.form.get('payps_uuid')?.disable();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.message.error('No se pudo cargar la información del estado de período de pago');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.message.error('Error de conexión al cargar el estado de período de pago');
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
      this._paymentPeriodsStatusService.savePaymentPeriodStatus(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Estado del período de pago creado correctamente');
            this.router.navigate(['/admin/user/payment-periods-status']);
          } else {
            this.message.error(response.message || 'Error al guardar el estado del período de pago');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    } else {
      this._paymentPeriodsStatusService.updatePaymentPeriodStatus(this.paymentPeriodStatusId!, this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Estado del período de pago actualizado correctamente');
            this.router.navigate(['/admin/user/payment-periods-status']);
          } else {
            this.message.error(response.message || 'Error al actualizar el estado del período de pago');
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
    this.router.navigate(['/admin/user/payment-periods-status']);
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
