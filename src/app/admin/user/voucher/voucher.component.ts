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
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-voucher',
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
    NzSwitchModule,
    NzInputNumberModule
  ],
  templateUrl: './voucher.component.html',
  styleUrl: './voucher.component.scss'
})
export class VoucherComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  voucherId: string | null = null;

  // Opciones para selects
  operationTypes = [
    { value: '1', label: 'Compra' },
    { value: '2', label: 'Devolución' },
    { value: '3', label: 'Extracción' },
    { value: '4', label: 'Pago Servicio' }
  ];

  voucherStatuses = [
    { value: '1', label: 'Confirmado' },
    { value: '2', label: 'Pendiente' },
    { value: '3', label: 'Rechazado' },
    { value: '4', label: 'Anulado' }
  ];

  currencies = [
    { value: 'ARS', label: 'Pesos Argentinos ($)' },
    { value: 'USD', label: 'Dólares Americanos (US$)' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      vou_uuid: [{ value: '', disabled: true }],
      vou_authorizationnumber: ['', [Validators.required, Validators.maxLength(50)]],
      vou_transactionnumber: ['', [Validators.required, Validators.maxLength(50)]],
      vou_datetime: [new Date(), Validators.required],
      vou_amount: [null, [Validators.required, Validators.min(0)]],
      vou_currency: ['ARS', Validators.required],
      vou_commercename: ['', [Validators.required, Validators.maxLength(200)]],
      vou_commercecuit: ['', [Validators.pattern(/^\d{11}$/)]],
      vou_commercecategory: ['', Validators.maxLength(100)],
      tyop_uuid: ['', Validators.required],
      vou_installments: [false],
      vou_installmentcount: [1],
      vou_installmentinterest: [0],
      vous_uuid: ['1', Validators.required],
      vou_notes: ['']
    });
  }

  ngOnInit(): void {
    this.voucherId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.voucherId;
    
    if (this.isEditing) {
      this.loadVoucher();
    } else {
      this.form.get('vou_uuid')?.disable();
    }

    // Escuchar cambios en cuotas para validar cantidad
    this.form.get('vou_installments')?.valueChanges.subscribe(value => {
      const countControl = this.form.get('vou_installmentcount');
      if (value) {
        countControl?.setValidators([Validators.required, Validators.min(2), Validators.max(36)]);
      } else {
        countControl?.clearValidators();
        countControl?.setValue(1);
        this.form.get('vou_installmentinterest')?.setValue(0);
      }
      countControl?.updateValueAndValidity();
    });
  }

  loadVoucher(): void {
    this.isLoading = true;
    
    // Simular carga desde API
    setTimeout(() => {
      const mockVoucher = {
        vou_uuid: this.voucherId,
        vou_authorizationnumber: 'AUTH123456',
        vou_transactionnumber: 'TXN789012',
        vou_datetime: new Date('2026-02-08T17:56:35'),
        vou_amount: 20000.00,
        vou_currency: 'ARS',
        vou_commercename: 'Supermercado Prueba',
        vou_commercecuit: '11111111111',
        vou_commercecategory: 'Supermercados',
        tyop_uuid: '1',
        vou_installments: false,
        vou_installmentcount: 1,
        vou_installmentinterest: 0,
        vous_uuid: '1',
        vou_notes: ''
      };
      
      this.form.get('vou_uuid')?.enable();
      this.form.patchValue(mockVoucher);
      this.form.get('vou_uuid')?.disable();
      
      this.isLoading = false;
    }, 500);
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
      this.message.success(`Voucher ${action} exitosamente`);
      this.router.navigate(['/admin/user/vouchers']);
    }, 800);
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/vouchers']);
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'vou_commercecuit') {
        return 'Ingrese un CUIT válido (11 dígitos)';
      }
      return 'Formato inválido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('min')) {
      return 'El valor mínimo es ' + control.errors?.['min'].min;
    }
    if (control?.hasError('max')) {
      return 'El valor máximo es ' + control.errors?.['max'].max;
    }
    return null;
  }

  currencyFormatter = (value: number): string => {
    if (!value) return '';
    return `$ ${value.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  currencyParser = (value: string): number => {
    return +value.replace(/\$\s?|(\.*)/g, '').replace(/(\.*)/g, '.');
  };
}
