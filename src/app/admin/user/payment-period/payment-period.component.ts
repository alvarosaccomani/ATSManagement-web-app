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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTagModule } from 'ng-zorro-antd/tag';

// Definir interfaz para datos relacionados
interface RelatedData {
  crd_uuid: string;
  per_uuid: string;
}

@Component({
  selector: 'app-payment-period',
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
    NzDividerModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputNumberModule,
    NzTagModule
  ],
  templateUrl: './payment-period.component.html',
  styleUrl: './payment-period.component.scss'
})
export class PaymentPeriodComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  paymentId: string | null = null;

  // Opciones para selects
  paymentMethods = [
    { value: '1', label: 'Banco' },
    { value: '2', label: 'Transferencia' },
    { value: '3', label: 'Rapipago' },
    { value: '4', label: 'Mercado Pago' },
    { value: '5', label: 'Pago Fácil' }
  ];

  paymentStatuses = [
    { value: '1', label: 'Procesado' },
    { value: '2', label: 'Confirmado' },
    { value: '3', label: 'Rechazado' }
  ];

  periods = [
    { value: '1', label: 'Período 01/2026' },
    { value: '2', label: 'Período 02/2026' },
    { value: '3', label: 'Período 03/2026' }
  ];

  cards = [
    { value: '1', label: '**** **** **** 8936' },
    { value: '2', label: '**** **** **** 5421' },
    { value: '3', label: '**** **** **** 7890' }
  ];

  // Mapeo de datos relacionados con tipado seguro
  private relatedDataMap: { [key: string]: RelatedData } = {
    '1': { crd_uuid: '1', per_uuid: '1' },
    '2': { crd_uuid: '2', per_uuid: '2' },
    '3': { crd_uuid: '3', per_uuid: '3' }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      payp_uuid: [{ value: '', disabled: true }],
      payp_paymentdate: [new Date(), Validators.required],
      payp_amountpaid: [null, [Validators.required, Validators.min(0)]],
      paym_uuid: ['', Validators.required],
      payp_paymentreference: [''],
      payps_uuid: ['1', Validators.required],
      per_uuid: ['', Validators.required],
      crd_uuid: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.paymentId;
    
    if (this.isEditing) {
      this.loadPayment();
    } else {
      this.form.get('payp_uuid')?.disable();
    }

    // Escuchar cambios en el período para actualizar la tarjeta relacionada
    this.form.get('per_uuid')?.valueChanges.subscribe(periodId => {
      if (periodId) {
        this.loadRelatedData(periodId);
      } else {
        this.form.get('crd_uuid')?.enable();
        this.form.get('crd_uuid')?.setValue('');
        this.form.get('crd_uuid')?.disable();
      }
    });
  }

  loadPayment(): void {
    this.isLoading = true;
    
    // Simular carga desde API
    setTimeout(() => {
      const mockPayment = {
        payp_uuid: this.paymentId,
        payp_paymentdate: new Date('2026-02-10T21:59:22'),
        payp_amountpaid: 100.00,
        paym_uuid: '1',
        payp_paymentreference: 'REF-BANCO-001',
        payps_uuid: '1',
        per_uuid: '1',
        crd_uuid: '1'
      };
      
      this.form.get('payp_uuid')?.enable();
      this.form.get('crd_uuid')?.enable();
      
      this.form.patchValue(mockPayment);
      
      this.form.get('payp_uuid')?.disable();
      this.form.get('crd_uuid')?.disable();
      
      this.isLoading = false;
    }, 500);
  }

  loadRelatedData(periodId: string): void {
    // Verificar si el periodId existe en el mapa
    if (this.relatedDataMap.hasOwnProperty(periodId)) {
      const data = this.relatedDataMap[periodId];
      this.form.get('crd_uuid')?.enable();
      this.form.get('crd_uuid')?.setValue(data.crd_uuid);
      this.form.get('crd_uuid')?.disable();
    } else {
      // Si no existe, limpiar el campo
      this.form.get('crd_uuid')?.enable();
      this.form.get('crd_uuid')?.setValue('');
      this.form.get('crd_uuid')?.disable();
    }
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
    
    // Simular guardado
    setTimeout(() => {
      this.isLoading = false;
      const action = this.isEditing ? 'actualizado' : 'creado';
      this.message.success(`Pago ${action} exitosamente`);
      this.router.navigate(['/admin/user/pagos-periodos']);
    }, 800);
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/pagos-periodos']);
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('min')) {
      return 'El valor mínimo es ' + control.errors?.['min'].min;
    }
    return null;
  }

  currencyFormatter = (value: number): string => {
    if (!value && value !== 0) return '';
    return `$ ${value.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  currencyParser = (value: string): number => {
    return +value.replace(/\$\s?|(\.*)/g, '').replace(/(\.*)/g, '.');
  };

  // Obtener color del método de pago
  getMethodColor(methodId: string): string {
    switch (methodId) {
      case '1': return 'blue';      // Banco
      case '2': return 'geekblue';  // Transferencia
      case '3': return 'gold';      // Rapipago
      case '4': return 'volcano';   // Mercado Pago
      case '5': return 'orange';    // Pago Fácil
      default: return 'default';
    }
  }

  // Obtener icono del método de pago
  getMethodIcon(methodId: string): string {
    switch (methodId) {
      case '1': return 'bank';        // Banco
      case '2': return 'swap';        // Transferencia
      case '3': return 'barcode';     // Rapipago
      case '4': return 'wallet';      // Mercado Pago
      case '5': return 'barcode';     // Pago Fácil
      default: return 'credit-card';
    }
  }

  // Obtener color del estado de pago
  getStatusColor(statusId: string): string {
    switch (statusId) {
      case '1': return 'processing'; // Procesado
      case '2': return 'success';    // Confirmado
      case '3': return 'error';      // Rechazado
      default: return 'default';
    }
  }

  // Obtener icono del estado de pago
  getStatusIcon(statusId: string): string {
    switch (statusId) {
      case '1': return 'sync';           // Procesado
      case '2': return 'check-circle';   // Confirmado
      case '3': return 'close-circle';   // Rechazado
      default: return 'info-circle';
    }
  }

  // Obtener etiqueta del estado
  getStatusLabel(statusId: string): string {
    const status = this.paymentStatuses.find(s => s.value === statusId);
    return status ? status.label : 'Desconocido';
  }

  // Obtener etiqueta del método
  getMethodLabel(methodId: string): string {
    const method = this.paymentMethods.find(m => m.value === methodId);
    return method ? method.label : 'Desconocido';
  }
}