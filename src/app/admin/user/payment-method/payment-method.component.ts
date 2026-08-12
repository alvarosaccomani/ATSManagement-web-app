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
import { PaymentMethodsService } from '../../../core/services/payment-methods.service';

@Component({
  selector: 'app-payment-method',
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
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.scss'
})
export class PaymentMethodComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  paymentMethodId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _paymentMethodsService: PaymentMethodsService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      paym_uuid: [{ value: '', disabled: true }],
      paym_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      paym_description: ['', [Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.paymentMethodId = this.route.snapshot.paramMap.get('paym_uuid');
    this.isEditing = !!this.paymentMethodId;
    
    if (this.isEditing) {
      this.loadPaymentMethod();
    } else {
      this.form.get('paym_uuid')?.disable();
    }
  }

  loadPaymentMethod(): void {
    this.isLoading = true;
    this._paymentMethodsService.getPaymentMethodById(this.paymentMethodId!).subscribe({
      next: (response: any) => {
        if(response.success) {
          const paymentMethod = response.data;
          this.form.get('paym_uuid')?.enable();
          this.form.patchValue(paymentMethod);
          this.form.get('paym_uuid')?.disable();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.message.error('No se pudo cargar la información del método de pago');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error(error);
        this.message.error('Error de conexión al cargar el método de pago');
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
      this._paymentMethodsService.savePaymentMethod(this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Método de pago creado correctamente');
            this.router.navigate(['/admin/user/payment-methods']);
          } else {
            this.message.error(response.message || 'Error al guardar el método de pago');
          }
        },
        error: error => {
          this.isLoading = false;
          console.error(error);
          this.message.error(error?.error?.error || 'Error de conexión con el servidor');
        }
      });
    } else {
      this._paymentMethodsService.updatePaymentMethod(this.paymentMethodId!, this.form.getRawValue()).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Método de pago actualizado correctamente');
            this.router.navigate(['/admin/user/payment-methods']);
          } else {
            this.message.error(response.message || 'Error al actualizar el método de pago');
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
    this.router.navigate(['/admin/user/payment-methods']);
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
