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

import { PaymentPeriodInterface } from '../../../core/interfaces/payment-period';
import { CardsService } from '../../../core/services/cards.service';
import { PeriodsService } from '../../../core/services/periods.service';
import { PaymentMethodsService } from '../../../core/services/payment-methods.service';
import { PaymentPeriodsStatusService } from '../../../core/services/payment-periods-status.service';
import { PaymentPeriodsService } from '../../../core/services/payment-periods.service';
import { MessageService } from '../../../core/services/message.service';
import { formatterDollar, parserDollar } from '../../../core/utils/currency-format';

/**
 * Interfaz auxiliar que vincula un período con los UUID de su tarjeta padre y de su período.
 * @description Se utiliza internamente para autocompletar el campo de tarjeta cuando se selecciona un período de facturación.
 */
interface RelatedData {
  /** UUID de la tarjeta padre. */
  crd_uuid: string;
  /** UUID del período de facturación. */
  per_uuid: string;
}

/**
 * Componente para crear y editar un pago de período de facturación.
 * @description Gestiona la fecha de pago, el monto pagado, el método de pago, la referencia de pago, el estado y el período/tarjeta asociados.
 */
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
  /** Grupo de formulario reactivo para el pago del período. */
  form: FormGroup;
  /** Indicador de si hay una solicitud en curso. */
  isLoading = false;
  /** Indicador de si el formulario se encuentra en modo de edición. */
  isEditing = false;
  /** UUID del pago que se está editando, o null al crear uno nuevo. */
  paymentId: string | null = null;

  /** Opciones de métodos de pago disponibles para el menú desplegable. */
  paymentMethods: any[] = [];
  /** Opciones de estados de pago disponibles para el menú desplegable. */
  paymentStatuses: any[] = [];
  /** Opciones de períodos de facturación disponibles para el menú desplegable. */
  periods: any[] = [];
  /** Opciones de tarjetas disponibles para el menú desplegable. */
  cards: any[] = [];

  /** Mapa interno que vincula los UUID de períodos con los UUID de sus tarjetas padre. */
  private relatedDataMap: { [key: string]: RelatedData } = {};

  /**
   * Inicializa el componente PaymentPeriodComponent y construye el formulario reactivo.
   * @param fb Servicio FormBuilder de Angular.
   * @param route ActivatedRoute para leer los parámetros de la ruta.
   * @param router Servicio Router de Angular.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _cardsService Servicio para obtener las tarjetas.
   * @param _periodsService Servicio para obtener los períodos de facturación.
   * @param _paymentMethodsService Servicio para obtener los métodos de pago.
   * @param _paymentPeriodsStatusService Servicio para obtener los estados de pago de períodos.
   * @param _paymentPeriodsService Servicio para operaciones CRUD de pagos de períodos.
   * @param _messageService Servicio personalizado de alertas modales.
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private _cardsService: CardsService,
    private _periodsService: PeriodsService,
    private _paymentMethodsService: PaymentMethodsService,
    private _paymentPeriodsStatusService: PaymentPeriodsStatusService,
    private _paymentPeriodsService: PaymentPeriodsService,
    private _messageService: MessageService
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

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    const payp_uuid = this.route.snapshot.paramMap.get('payp_uuid');
    const crd_uuid = this.route.snapshot.paramMap.get('crd_uuid');
    const per_uuid = this.route.snapshot.paramMap.get('per_uuid');

    this.isEditing = !!payp_uuid;
    this.loadPaymentMethods();
    this.loadPaymentStatuses();
    this.loadPeriodsData();
    
    if (this.isEditing) {
      this.paymentId = payp_uuid;
      this.loadPayment(crd_uuid!, per_uuid!, payp_uuid!);
    } else {
      this.form.get('payp_uuid')?.disable();
    }

    // Escuchar cambios en el período para actualizar la tarjeta relacionada
    this.form.get('per_uuid')?.valueChanges.subscribe(periodId => {
      if (periodId) {
        this.loadRelatedData(periodId);
      } else {
        this.form.get('crd_uuid')?.setValue('');
      }
    });
  }

  /**
   * Carga los métodos de pago disponibles desde el backend.
   * @returns void
   */
  loadPaymentMethods(): void {
    this._paymentMethodsService.getPaymentMethods().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.paymentMethods = response.data.map((m: any) => ({
            value: m.paym_uuid,
            label: this.formatMethodName(m.paym_name)
          }));
        }
      }
    });
  }

  /**
   * Carga los estados de pago de períodos disponibles desde el backend.
   * @returns void
   */
  loadPaymentStatuses(): void {
    this._paymentPeriodsStatusService.getPaymentPeriodsStatus().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.paymentStatuses = response.data.map((s: any) => ({
            value: s.payps_uuid,
            label: this.formatStatusName(s.payps_name)
          }));
        }
      }
    });
  }

  /**
   * Carga las tarjetas y sus períodos de facturación para completar las opciones desplegables y las asignaciones de relación.
   * @returns void
   */
  loadPeriodsData(): void {
    this.isLoading = true;
    this._cardsService.getCards('7a067c90-bf5b-45d1-8f07-91b578e2d54d').subscribe({
      next: (cardResponse: any) => {
        if (cardResponse.success) {
          const cardsData = cardResponse.data;
          this.cards = cardsData.map((c: any) => ({ 
            value: c.crd_uuid, 
            label: c.crd_alias || (c.crd_last4digits ? `**** **** **** ${c.crd_last4digits}` : c.tycrd?.tycrd_name || 'Cuenta') 
          }));
          
          let pendingQueries = cardsData.length;
          if (pendingQueries === 0) {
            this.isLoading = false;
            return;
          }

          const allPeriods: any[] = [];
          const relatedMap: { [key: string]: RelatedData } = {};

          cardsData.forEach((card: any) => {
            this._periodsService.getPedriods('7a067c90-bf5b-45d1-8f07-91b578e2d54d', card.crd_uuid).subscribe({
              next: (periodResponse: any) => {
                if (periodResponse.success) {
                  periodResponse.data.forEach((p: any) => {
                    allPeriods.push({ value: p.per_uuid, label: `Período ${this.formatPeriodNumber(p.per_periodnumber)}` });
                    relatedMap[p.per_uuid] = {
                      crd_uuid: card.crd_uuid,
                      per_uuid: p.per_uuid
                    };
                  });
                }
                pendingQueries--;
                if (pendingQueries === 0) {
                  this.periods = allPeriods;
                  this.relatedDataMap = relatedMap;
                  this.isLoading = false;
                }
              },
              error: () => {
                pendingQueries--;
                if (pendingQueries === 0) {
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

  /**
   * Carga un registro de pago de período existente y completa el formulario.
   * @param crd_uuid UUID de la tarjeta.
   * @param per_uuid UUID del período.
   * @param payp_uuid UUID del pago de período.
   * @returns void
   */
  loadPayment(crd_uuid: string, per_uuid: string, payp_uuid: string): void {
    this.isLoading = true;
    this._paymentPeriodsService.getPaymentPeriodById('7a067c90-bf5b-45d1-8f07-91b578e2d54d', crd_uuid, per_uuid, payp_uuid).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          const payment = {
            ...response.data,
            payp_paymentdate: new Date(response.data.payp_paymentdate)
          };

          this.form.get('payp_uuid')?.enable();
          this.form.get('crd_uuid')?.enable();

          this.form.patchValue(payment);

          this.form.get('payp_uuid')?.disable();
          this.form.get('crd_uuid')?.disable();
        }
      },
      error: error => {
        this.isLoading = false;
        console.error(error);
        this._messageService.error('Error', 'No se pudo cargar la información del pago');
      }
    });
  }

  /**
   * Completa el control de formulario de tarjeta asociado con un período seleccionado.
   * @param periodId UUID del período seleccionado.
   * @returns void
   */
  loadRelatedData(periodId: string): void {
    if (this.relatedDataMap.hasOwnProperty(periodId)) {
      const data = this.relatedDataMap[periodId];
      this.form.get('crd_uuid')?.enable();
      this.form.get('crd_uuid')?.setValue(data.crd_uuid);
      this.form.get('crd_uuid')?.disable();
    }
  }

  /**
   * Valida y envía el formulario para crear o actualizar el pago del período.
   * @returns void
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
    const payload = {
      ...rawValue,
      usr_uuid: '7a067c90-bf5b-45d1-8f07-91b578e2d54d'
    };

    if (!this.isEditing) {
      this._paymentPeriodsService.savePaymentPeriod(payload).subscribe({
        next: response => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Pago Registrado', 
              'El pago se registró correctamente en el período.',
              () => {
                this.router.navigate(['/admin/user/payment-periods']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo registrar el pago');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage?.error?.error || 'Hubo un problema al registrar el pago');
        }
      });
    } else {
      this._paymentPeriodsService.updatePaymentPeriod(payload.usr_uuid, payload.crd_uuid, payload.per_uuid, payload.payp_uuid, payload).subscribe({
        next: response => {
          this.isLoading = false;
          if (response.success) {
            this._messageService.success(
              'Pago Actualizado', 
              'El pago se actualizó correctamente.',
              () => {
                this.router.navigate(['/admin/user/payment-periods']);
              }
            );
          } else {
            this._messageService.error('Error', response.message || 'No se pudo actualizar el pago');
          }
        },
        error: error => {
          this.isLoading = false;
          let errorMessage = <any>error;
          console.error(errorMessage);
          this._messageService.error('Error', errorMessage?.error?.error || 'Hubo un problema al actualizar el pago');
        }
      });
    }
  }

  /**
   * Cancela la operación y navega de regreso a la lista de pagos de períodos.
   * @returns void
   */
  onCancel(): void {
    this.router.navigate(['/admin/user/payment-periods']);
  }

  /**
   * Obtiene el mensaje de error de validación para un control del formulario.
   * @param controlName Nombre del control del formulario.
   * @returns Mensaje de error de validación o null.
   */
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

  /**
   * Formatea un período numérico (`YYYYMM`) como `MM/YYYY`.
   * @param periodNumber Valor numérico del período.
   * @returns Cadena de período formateada.
   */
  formatPeriodNumber(periodNumber: number): string {
    const periodStr = periodNumber.toString();
    const year = periodStr.substring(0, 4);
    const month = periodStr.substring(4, 6);
    return `${month}/${year}`;
  }

  /** Función formateadora de visualización de moneda. */
  formatterDollar = formatterDollar;
  /** Función analizadora de entrada de moneda. */
  parserDollar = parserDollar;
  /** Alias para la función formateadora de visualización de moneda. */
  currencyFormatter = formatterDollar;
  /** Alias para la función analizadora de entrada de moneda. */
  currencyParser = parserDollar;

  /**
   * Devuelve el color de etiqueta de Ng-Zorro para un ID de método de pago.
   * @param methodId UUID del método de pago.
   * @returns Cadena con el color de la etiqueta.
   */
  getMethodColor(methodId: string): string {
    const label = this.getMethodLabel(methodId).toLowerCase();
    if (label.includes('banco')) return 'blue';
    if (label.includes('transferencia')) return 'geekblue';
    if (label.includes('rapipago')) return 'gold';
    if (label.includes('mercado')) return 'volcano';
    if (label.includes('fácil')) return 'orange';
    return 'default';
  }

  /**
   * Devuelve el nombre del ícono de Ng-Zorro para un ID de método de pago.
   * @param methodId UUID del método de pago.
   * @returns Cadena con el nombre del ícono.
   */
  getMethodIcon(methodId: string): string {
    const label = this.getMethodLabel(methodId).toLowerCase();
    if (label.includes('banco')) return 'bank';
    if (label.includes('transferencia')) return 'swap';
    if (label.includes('rapipago') || label.includes('fácil')) return 'barcode';
    if (label.includes('mercado') || label.includes('wallet')) return 'wallet';
    return 'credit-card';
  }

  /**
   * Formatea un nombre de método de pago sin procesar a formato de título.
   * @param name Nombre del método de pago sin procesar.
   * @returns Nombre del método de pago formateado.
   */
  formatMethodName(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Convierte a mayúscula la primera letra de un nombre de estado.
   * @param name Nombre del estado sin procesar.
   * @returns Nombre del estado con inicial mayúscula.
   */
  formatStatusName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Devuelve el color de estado de insignia de Ng-Zorro para un ID de estado de pago.
   * @param statusId UUID del estado de pago.
   * @returns Cadena de estado de la insignia.
   */
  getStatusColor(statusId: string): string {
    const label = this.getStatusLabel(statusId).toLowerCase();
    if (label.includes('confirmado')) return 'success';
    if (label.includes('procesado')) return 'processing';
    if (label.includes('rechazado')) return 'error';
    return 'default';
  }

  /**
   * Devuelve el nombre del ícono de Ng-Zorro para un ID de estado de pago.
   * @param statusId UUID del estado de pago.
   * @returns Cadena con el nombre del ícono.
   */
  getStatusIcon(statusId: string): string {
    const label = this.getStatusLabel(statusId).toLowerCase();
    if (label.includes('confirmado')) return 'check-circle';
    if (label.includes('procesado')) return 'sync';
    if (label.includes('rechazado')) return 'close-circle';
    return 'info-circle';
  }

  /**
   * Resuelve la etiqueta de visualización para un ID de estado de pago.
   * @param statusId UUID del estado de pago.
   * @returns Cadena con la etiqueta del estado.
   */
  getStatusLabel(statusId: string): string {
    const status = this.paymentStatuses.find(s => s.value === statusId);
    return status ? status.label : 'Desconocido';
  }

  /**
   * Resuelve la etiqueta de visualización para un ID de método de pago.
   * @param methodId UUID del método de pago.
   * @returns Cadena con la etiqueta del método.
   */
  getMethodLabel(methodId: string): string {
    const method = this.paymentMethods.find(m => m.value === methodId);
    return method ? method.label : 'Desconocido';
  }
}