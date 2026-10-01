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

import { VoucherFeeInterface } from '../../../core/interfaces/voucher-fee';
import { CardsService } from '../../../core/services/cards.service';
import { PeriodsService } from '../../../core/services/periods.service';
import { VouchersService } from '../../../core/services/vouchers.service';
import { VouchersFeeStatusService } from '../../../core/services/vouchers-fee-status.service';
import { VouchersFeesService } from '../../../core/services/vouchers-fees.service';
import { MessageService } from '../../../core/services/message.service';

interface RelatedData {
  crd_uuid: string;
  per_uuid: string;
}

@Component({
  selector: 'app-voucher-fee',
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
  templateUrl: './voucher-fee.component.html',
  styleUrl: './voucher-fee.component.scss'
})
export class VoucherFeeComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  isEditing = false;
  installmentId: string | null = null;

  // Opciones para selects cargadas desde el backend
  installmentStatuses: any[] = [];
  vouchers: any[] = [];
  cards: any[] = [];
  periods: any[] = [];

  // Mapeo de datos relacionados
  private relatedDataMap: { [key: string]: RelatedData } = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private _cardsService: CardsService,
    private _periodsService: PeriodsService,
    private _vouchersService: VouchersService,
    private _vouchersFeeStatusService: VouchersFeeStatusService,
    private _vouchersFeesService: VouchersFeesService,
    private _messageService: MessageService
  ) {
    this.form = this.fb.group({
      vouf_uuid: [{ value: '', disabled: true }],
      vouf_quotanumber: [1, [Validators.required, Validators.min(1), Validators.max(36)]],
      vouf_quotaamount: [null, [Validators.required, Validators.min(0)]],
      vouf_quotaduedate: [null, Validators.required],
      voufs_uuid: ['1', Validators.required],
      vou_uuid: ['', Validators.required],
      crd_uuid: [{ value: '', disabled: true }],
      per_uuid: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    const vouf_uuid = this.route.snapshot.paramMap.get('vouf_uuid');
    const crd_uuid = this.route.snapshot.paramMap.get('crd_uuid');
    const per_uuid = this.route.snapshot.paramMap.get('per_uuid');
    const vou_uuid = this.route.snapshot.paramMap.get('vou_uuid');

    this.isEditing = !!vouf_uuid;
    this.loadStatuses();
    this.loadVouchersData();
    
    if (this.isEditing) {
      this.installmentId = vouf_uuid;
      this.loadInstallment(crd_uuid!, per_uuid!, vou_uuid!, vouf_uuid!);
    } else {
      this.form.get('vouf_uuid')?.disable();
    }

    // Escuchar cambios en voucher para actualizar tarjeta y período relacionados
    this.form.get('vou_uuid')?.valueChanges.subscribe(voucherId => {
      if (voucherId) {
        this.loadRelatedData(voucherId);
      } else {
        this.form.get('crd_uuid')?.setValue('');
        this.form.get('per_uuid')?.setValue('');
      }
    });
  }

  loadStatuses(): void {
    this._vouchersFeeStatusService.getVoucherFeeStatus().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.installmentStatuses = response.data.map((s: any) => ({
            value: s.voufs_uuid,
            label: this.formatStatusName(s.voufs_name)
          }));
        }
      }
    });
  }

  loadVouchersData(): void {
    this.isLoading = true;
    this._cardsService.getCards('7a067c90-bf5b-45d1-8f07-91b578e2d54d').subscribe({
      next: (cardResponse: any) => {
        if (cardResponse.success) {
          const cardsData = cardResponse.data;
          this.cards = cardsData.map((c: any) => ({ value: c.crd_uuid, label: `**** **** **** ${c.crd_last4digits}` }));
          
          let pendingQueries = cardsData.length;
          if (pendingQueries === 0) {
            this.isLoading = false;
            return;
          }

          const allVouchers: any[] = [];
          const relatedMap: { [key: string]: RelatedData } = {};
          const allPeriods: any[] = [];

          cardsData.forEach((card: any) => {
            this._periodsService.getPedriods('7a067c90-bf5b-45d1-8f07-91b578e2d54d', card.crd_uuid).subscribe({
              next: (periodResponse: any) => {
                if (periodResponse.success) {
                  const periodsData = periodResponse.data;
                  periodsData.forEach((p: any) => {
                    if (!allPeriods.some(ap => ap.value === p.per_uuid)) {
                      allPeriods.push({ value: p.per_uuid, label: `Período ${this.formatPeriodNumber(p.per_periodnumber)}` });
                    }
                  });

                  let pendingPeriodVouchers = periodsData.length;
                  if (pendingPeriodVouchers === 0) {
                    pendingQueries--;
                    if (pendingQueries === 0) {
                      this.vouchers = allVouchers;
                      this.periods = allPeriods;
                      this.relatedDataMap = relatedMap;
                      this.isLoading = false;
                    }
                    return;
                  }

                  periodsData.forEach((period: any) => {
                    this._vouchersService.getVouchers('7a067c90-bf5b-45d1-8f07-91b578e2d54d', card.crd_uuid, period.per_uuid).subscribe({
                      next: (voucherResponse: any) => {
                        if (voucherResponse.success) {
                          voucherResponse.data.forEach((v: any) => {
                            allVouchers.push({
                              value: v.vou_uuid,
                              label: `${v.vou_commercename} - ${v.vou_transactionnumber} (${this.formatAmount(v.vou_amount)})`
                            });
                            relatedMap[v.vou_uuid] = {
                              crd_uuid: card.crd_uuid,
                              per_uuid: period.per_uuid
                            };
                          });
                        }
                        pendingPeriodVouchers--;
                        if (pendingPeriodVouchers === 0) {
                          pendingQueries--;
                          if (pendingQueries === 0) {
                            this.vouchers = allVouchers;
                            this.periods = allPeriods;
                            this.relatedDataMap = relatedMap;
                            this.isLoading = false;
                          }
                        }
                      },
                      error: () => {
                        pendingPeriodVouchers--;
                        if (pendingPeriodVouchers === 0) {
                          pendingQueries--;
                          if (pendingQueries === 0) {
                            this.vouchers = allVouchers;
                            this.periods = allPeriods;
                            this.relatedDataMap = relatedMap;
                            this.isLoading = false;
                          }
                        }
                      }
                    });
                  });
                } else {
                  pendingQueries--;
                  if (pendingQueries === 0) {
                    this.vouchers = allVouchers;
                    this.periods = allPeriods;
                    this.relatedDataMap = relatedMap;
                    this.isLoading = false;
                  }
                }
              },
              error: () => {
                pendingQueries--;
                if (pendingQueries === 0) {
                  this.vouchers = allVouchers;
                  this.periods = allPeriods;
                  this.relatedDataMap = relatedMap;
                  this.isLoading = false;
                }
              }
            });
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadInstallment(crd_uuid: string, per_uuid: string, vou_uuid: string, vouf_uuid: string): void {
    this.isLoading = true;
    this._vouchersFeesService.getVoucherFeeById('7a067c90-bf5b-45d1-8f07-91b578e2d54d', crd_uuid, per_uuid, vou_uuid, vouf_uuid).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          const installment = {
            ...response.data,
            vouf_quotaduedate: new Date(response.data.vouf_quotaduedate)
          };

          this.form.get('vouf_uuid')?.enable();
          this.form.get('crd_uuid')?.enable();
          this.form.get('per_uuid')?.enable();

          this.form.patchValue(installment);

          this.form.get('vouf_uuid')?.disable();
          this.form.get('crd_uuid')?.disable();
          this.form.get('per_uuid')?.disable();
        }
      },
      error: error => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudo cargar la cuota');
      }
    });
  }

  loadRelatedData(voucherId: string): void {
    if (this.relatedDataMap.hasOwnProperty(voucherId)) {
      const data = this.relatedDataMap[voucherId];
      this.form.get('crd_uuid')?.enable();
      this.form.get('per_uuid')?.enable();
      
      this.form.get('crd_uuid')?.setValue(data.crd_uuid);
      this.form.get('per_uuid')?.setValue(data.per_uuid);
      
      this.form.get('crd_uuid')?.disable();
      this.form.get('per_uuid')?.disable();
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
      this._messageService.error('Formulario Inválido', 'Por favor complete todos los campos obligatorios');
      return;
    }

    this.isLoading = true;
    const rawValue = this.form.getRawValue();
    const payload = {
      ...rawValue,
      usr_uuid: '7a067c90-bf5b-45d1-8f07-91b578e2d54d'
    };

    if (!this.isEditing) {
      this._vouchersFeesService.saveVoucherFee(payload).subscribe({
        next: response => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Cuota Creada', 
              'La cuota se agregó correctamente.',
              () => {
                this.router.navigate(['/admin/user/vouchers-fees']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo guardar la cuota');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage?.error?.error || 'Hubo un problema al guardar la cuota');
        }
      });
    } else {
      this._vouchersFeesService.updateVoucherFee(payload.usr_uuid, payload.crd_uuid, payload.per_uuid, payload.vou_uuid, payload.vouf_uuid, payload).subscribe({
        next: response => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Cuota Actualizada', 
              'La cuota se actualizó correctamente.',
              () => {
                this.router.navigate(['/admin/user/vouchers-fees']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar la cuota');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage?.error?.error || 'Hubo un problema al actualizar la cuota');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/user/vouchers-fees']);
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control?.hasError('min')) {
      return 'El valor mínimo es ' + control.errors?.['min'].min;
    }
    if (control?.hasError('max')) {
      return 'El valor máximo es ' + control.errors?.['max'].max;
    }
    return null;
  }

  formatPeriodNumber(periodNumber: number): string {
    const periodStr = periodNumber.toString();
    const year = periodStr.substring(0, 4);
    const month = periodStr.substring(4, 6);
    return `${month}/${year}`;
  }

  formatAmount(amount: any): string {
    const amountNum = parseFloat(amount);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amountNum);
  }

  currencyFormatter = (value: number): string => {
    if (!value) return '';
    return `$ ${value.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  currencyParser = (value: string): number => {
    return +value.replace(/\$\s?|(\.*)/g, '').replace(/(\.*)/g, '.');
  };

  getStatusColor(statusId: string): string {
    switch (statusId) {
      case '1': return 'processing';
      case '2': return 'success';
      case '3': return 'error';
      default: return 'default';
    }
  }

  formatStatusName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getStatusLabel(statusId: string): string {
    const status = this.installmentStatuses.find(s => s.value === statusId);
    return status ? status.label : 'Desconocido';
  }
}