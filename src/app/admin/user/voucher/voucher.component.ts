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
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';
import { formatterDollar, parserDollar } from '../../../core/utils/currency-format';

/**
 * Form component (`<app-voucher>`) for creating and editing card purchase vouchers
 * at `/admin/user/voucher/new` and `/admin/user/voucher/edit/:vou_uuid`.
 *
 * @description Manages voucher details (authorization code, transaction number, merchant CUIT,
 * amount, operation type, status) and automatically generates monthly installment schedules (`fees`)
 * when `vou_installments` is enabled.
 */
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
  /** Reactive form group for voucher fields. */
  form: FormGroup;
  /** Indicates whether data is loading or being submitted. */
  isLoading = false;
  /** Indicates whether the component is editing an existing voucher (`true`) or creating a new one (`false`). */
  isEditing = false;
  /** Card UUID associated with the voucher. */
  cardId: string | null = '1';
  /** Billing period UUID associated with the voucher. */
  periodId: string | null = '1';
  /** Voucher UUID when editing an existing record. */
  voucherId: string | null = null;
  /** Existing installment records loaded when editing a voucher. */
  existingFees: any[] = [];

  /** Available operation types from the parametric catalog. */
  operationTypes: TypeOperationInterface[] = [];

  /** Available voucher states from the parametric catalog. */
  voucherStatuses: VoucherStateInterface[] = [];

  /** Supported currency options. */
  currencies = [
    { value: 'ARS', label: 'Pesos Argentinos ($)' },
    { value: 'USD', label: 'Dólares Americanos (US$)' }
  ];

  /**
   * Initializes the voucher form component.
   *
   * @param fb Angular `FormBuilder` instance.
   * @param route Activated route snapshot.
   * @param router Angular `Router` instance.
   * @param _typeOperationsService Service for fetching operation types.
   * @param _vouchersStatesService Service for fetching voucher states.
   * @param _vouchersService Service for voucher CRUD operations.
   * @param message Ng-Zorro toast message service.
   * @param _messageService Modal notification service.
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _typeOperationsService: TypeOperationsService,
    private _vouchersStatesService: VouchersStatesService,
    private _vouchersService: VouchersService,
    private _sessionService: SessionService,
    private message: NzMessageService,
    private _messageService: MessageService
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

  /**
   * Obtiene el identificador del usuario activo desde la sesión.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Reads route parameters, loads operation types and voucher states, and sets up dynamic
   * installment count validators when `vou_installments` changes.
   */
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
        usr_uuid: this.currentUserId,
        crd_uuid: this.cardId,
        per_uuid: this.periodId
      });
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

  /**
   * Fetches an existing voucher record by its composite identifiers and populates the form.
   */
  loadVoucher(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) return;
    this.isLoading = true;
    const cid = this.cardId || '1';
    const pid = this.periodId || '1';

    this._vouchersService.getVocuherById(usr_uuid, cid, pid, this.voucherId!).subscribe(
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

  /**
   * Loads operation types from {@link TypeOperationsService}.
   */
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

  /**
   * Loads voucher states from {@link VouchersStatesService}.
   */
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

  /**
   * Validates the form, generates the monthly installment schedule (`fees`) when `vou_installments` is enabled,
   * and saves or updates the voucher via {@link VouchersService}.
   */
  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this._messageService.error('Formulario Inválido', 'Por favor complete todos los campos obligatorios');
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
      usr_uuid: this.currentUserId,
      fees
    };

    if(!this.isEditing) {
      this._vouchersService.saveVoucher(payload).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this._messageService.success(
              'Comprobante Creado', 
              'El comprobante se agregó correctamente.',
              () => {
                this.router.navigate(['/admin/user/vouchers']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo guardar el comprobante');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage?.error?.error || 'Hubo un problema al guardar el comprobante');
        }
      });
    } else {
      this._vouchersService.updateVoucher(payload).subscribe({
        next: response => {
          this.isLoading = false;
          if(response.success) {
            this._messageService.success(
              'Comprobante Actualizado', 
              'El comprobante se actualizó correctamente.',
              () => {
                this.router.navigate(['/admin/user/vouchers']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar el comprobante');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage?.error?.error || 'Hubo un problema al actualizar el comprobante');
        }
      });
    }
  }

  /**
   * Cancels editing and returns to the vouchers list (`/admin/user/vouchers`).
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/vouchers']);
  }

  /**
   * Returns a human-readable validation error message for a given form control.
   *
   * @param controlName Name of the form control.
   * @returns Validation error string or `null`.
   */
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

  /** Currency display formatter function. */
  formatterDollar = formatterDollar;
  /** Currency input parser function. */
  parserDollar = parserDollar;
  /** Alias for currency display formatter. */
  currencyFormatter = formatterDollar;
  /** Alias for currency input parser. */
  currencyParser = parserDollar;
}
