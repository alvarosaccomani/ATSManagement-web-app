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
  cardId: string | null = null;
  periodId: string | null = null;
  voucherId: string | null = null;

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
    this.voucherId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.voucherId;
    this.loadTypeOperations();
    this.loadVouchersStates();
    
    if (this.isEditing) {
      this.loadVoucher();
    } else {
      this.form.patchValue({
        usr_uuid: '7a067c90-bf5b-45d1-8f07-91b578e2d54d',
        crd_uuid: '1',
        per_uuid: '1'
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

    this._vouchersService.getVocuherById('7a067c90-bf5b-45d1-8f07-91b578e2d54d', this.cardId!, this.periodId!, this.voucherId!).subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          const voucher = {
            ...response.data,
            vou_datetime: new Date(response.data.vou_datetime)
          };

          this.form.get('vou_uuid')?.enable();
          this.form.patchValue(voucher);
          this.form.get('vou_uuid')?.disable();
          
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

    if(!this.isEditing) {
      this._vouchersService.saveVoucher(this.form.getRawValue()).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const item = response.item;
            // this._messageService.success(
            //   "Informacion", 
            //   "El Rubro fue agregado correctamente.",
            //   () => {
            //     this.router.navigate(['/admin/user/vouchers']);
            //   }
            // );
            this.router.navigate(['/admin/user/vouchers']);
          } else {
            this.isLoading = false;
            //this.status = 'error'
          }
        },
        error =>{
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            // if(errorMessage != null) {
            //   this._messageService.error(
            //     "Error", 
            //     errorMessage.error.error
            //   );
            // }
            this.message.success(errorMessage.error.error);
        }
      )
    } else {
      this._vouchersService.updateVoucher(this.form.getRawValue()).subscribe(
        response => {
          if(response.success) {
            this.isLoading = false;
            const item = response.item;
            this.router.navigate(['/admin/user/vouchers']);
            // this._messageService.success(
            //   "Informacion", 
            //   "El Banco fue actualizado correctamente.",
            //   () => {
            //     this.router.navigate(['/admin/user/vouchers']);
            //   }
            // );
          } else {
            this.isLoading = false;
            //this.status = 'error'
          }
        },
        error => {
            this.isLoading = false;
            let errorMessage = <any>error;
            console.log(errorMessage);
            if(errorMessage != null) {
              // this._messageService.error(
              //   "Error", 
              //   errorMessage.error.error
              // );
              this.message.success(errorMessage.error.error);
            }
        }
      )
    }
    
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
