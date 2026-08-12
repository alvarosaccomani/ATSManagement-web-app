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
import { TypeOperationInterface } from '../../../core/interfaces/type-operation';
import { VoucherStateInterface } from '../../../core/interfaces/voucher-state';
import { TypeOperationsService } from '../../../core/services/type-operations.service';
import { VouchersStatesService } from '../../../core/services/vouchers-states.service';
import { VouchersService } from '../../../core/services/vouchers.service';

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
  cardId: string | null = '1';
  periodId: string | null = '1';
  voucherId: string | null = null;
  existingFees: any[] = [];

  // Opciones para selects
  operationTypes: TypeOperationInterface[] = [];

  voucherStatuses: VoucherStateInterface[] = [];

  currencies = [
    { value: 'ARS', label: 'Pesos Argentinos ($)' },
    { value: 'USD', label: 'Dólares Americanos (US$)' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _typeOperationsService: TypeOperationsService,
    private _vouchersStatesService: VouchersStatesService,
    private _vouchersService: VouchersService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      usr_uuid: [{ value: '', disabled: true }],
      crd_uuid: [{ value: '', disabled: true }],
      per_uuid: [{ value: '', disabled: true }],
      vou_uuid: [{ value: '', disabled: true }],
      vou_authorizationnumber: ['', [Validators.required, Validators.maxLength(50)]],
      vou_transactionnumber: ['', [Validators.required, Validators.maxLength(50)]],
      vou_datetime: [new Date(), Validators.required],
      vou_amount: [null, [Validators.required, Validators.min(0)]],
      vou_currency: ['ARS', Validators.required],
      vou_commercename: ['', [Validators.required, Validators.maxLength(200)]],
      vou_commercecuit: ['', [Validators.pattern(/^\d{11}$/)]],
      vou_commercecategory: ['', Validators.maxLength(100)],
      tyop_uuid: ['1', Validators.required],
      vou_installments: [false],
      vou_installmentcount: [1],
      vou_installmentinterest: [0],
      vous_uuid: ['1', Validators.required],
      vou_notes: ['']
    });
  }

  ngOnInit(): void {
    this.voucherId = this.route.snapshot.paramMap.get('vou_uuid') || this.route.snapshot.paramMap.get('id');
    this.cardId = this.route.snapshot.paramMap.get('crd_uuid') || '1';
    this.periodId = this.route.snapshot.paramMap.get('per_uuid') || '1';
    this.isEditing = !!this.voucherId;
    this.loadTypeOperations();
    this.loadVouchersStates();
    
    if (this.isEditing) {
      this.loadVoucher();
    } else {
      this.form.patchValue({
        usr_uuid: '7a067c90-bf5b-45d1-8f07-91b578e2d54d',
        crd_uuid: this.cardId,
        per_uuid: this.periodId
      })
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
    const cid = this.cardId || '1';
    const pid = this.periodId || '1';

    this._vouchersService.getVocuherById('7a067c90-bf5b-45d1-8f07-91b578e2d54d', cid, pid, this.voucherId!).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          const voucher = {
            ...response.data,
            vou_datetime: new Date(response.data.vou_datetime)
          };

          this.existingFees = response.data.fees || [];

          this.form.get('vou_uuid')?.enable();
          this.form.patchValue(voucher);
          this.form.get('vou_uuid')?.disable();
          
          this.isLoading = false;
        } else {
          this.isLoading = false;
        }
      },
      (error: any) => {
        this.isLoading = false;
        let errorMessage = <any>error;
        console.log(errorMessage);
        this.message.error(errorMessage?.error?.error || 'Error al recuperar el comprobante');
      }
    )
  }

  loadTypeOperations(): void {
    this.isLoading = true;

    this._typeOperationsService.getTypeOperations().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.operationTypes = response.data;
          
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

  loadVouchersStates(): void {
    this.isLoading = true;

    this._vouchersStatesService.getVoucherStates().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.voucherStatuses = response.data;
          
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

    const rawValue = this.form.getRawValue();
    const vou_amount = rawValue.vou_amount || 0;
    const count = rawValue.vou_installments ? (rawValue.vou_installmentcount || 1) : 1;
    const fees: any[] = [];

    if (rawValue.vou_installments && count > 1) {
      const amountPerInstallment = parseFloat((vou_amount / count).toFixed(2));
      const lastAmount = parseFloat((vou_amount - (amountPerInstallment * (count - 1))).toFixed(2));
      const baseDate = new Date(rawValue.vou_datetime || new Date());

      for (let i = 1; i <= count; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(baseDate.getMonth() + i);
        const formattedDate = dueDate.toISOString().split('T')[0];

        const existingFee = this.existingFees.find(ef => ef.vouf_quotanumber === i);

        fees.push({
          vouf_uuid: existingFee ? existingFee.vouf_uuid : undefined,
          vouf_quotanumber: i,
          vouf_quotaamount: i === count ? lastAmount : amountPerInstallment,
          vouf_quotaduedate: formattedDate,
          voufs_uuid: existingFee ? existingFee.voufs_uuid : '1'
        });
      }
    }

    const payload = {
      ...rawValue,
      fees
    };

    if(!this.isEditing) {
      this._vouchersService.saveVoucher(payload).subscribe(
        response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Comprobante creado exitosamente');
            this.router.navigate(['/admin/user/vouchers']);
          } else {
            this.message.error(response.message || 'Error al guardar el comprobante');
          }
        },
        error =>{
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            this.message.error(errorMessage?.error?.error || 'Error al guardar el comprobante');
        }
      )
    } else {
      this._vouchersService.updateVoucher(payload).subscribe(
        response => {
          this.isLoading = false;
          if(response.success) {
            this.message.success('Comprobante actualizado exitosamente');
            this.router.navigate(['/admin/user/vouchers']);
          } else {
            this.message.error(response.message || 'Error al actualizar el comprobante');
          }
        },
        error => {
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            this.message.error(errorMessage?.error?.error || 'Error al actualizar el comprobante');
        }
      )
    }
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
