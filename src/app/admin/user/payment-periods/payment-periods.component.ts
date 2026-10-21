import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PaymentPeriodInterface } from '../../../core/interfaces/payment-period';
import { PaymentPeriodsService } from '../../../core/services/payment-periods.service';
import { SessionService } from '../../../core/services/session.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente para listar y gestionar pagos de períodos de facturación.
 * @description Muestra una tabla paginada de pagos con etiquetas de método, indicadores de estado y acciones CRUD.
 */
@Component({
  selector: 'app-payment-periods',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
    NzTagModule
  ],
  templateUrl: './payment-periods.component.html',
  styleUrl: './payment-periods.component.scss'
})
export class PaymentPeriodsComponent implements OnInit {
  /** Arreglo de registros de pagos de períodos cargados. */
  payments: PaymentPeriodInterface[] = [];
  /** Indicador de si los datos de la tabla se están cargando. */
  loading = false;
  /** Índice de la página actual (basado en 1). */
  pageIndex = 1;
  /** Cantidad de filas por página. */
  pageSize = 10;
  /** Cantidad total de registros de pagos. */
  total = 0;

  /** Definiciones de las columnas de la tabla. */
  listOfColumns = [
    { key: 'payp_uuid', title: 'ID', width: '80px' },
    { key: 'payment_date', title: 'Fecha Pago', width: '130px' },
    { key: 'amount', title: 'Monto Pagado', width: '130px' },
    { key: 'payment_method', title: 'Método', width: '120px' },
    { key: 'reference', title: 'Referencia', width: '140px' },
    { key: 'status', title: 'Estado', width: '110px' },
    { key: 'created_at', title: 'Creado', width: '160px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Inicializa el componente PaymentPeriodsComponent.
   * @param _router Servicio Router de Angular.
   * @param _paymentPeriodsService Servicio para operaciones CRUD de pagos de períodos.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _messageService Servicio personalizado de alertas modales.
   */
  constructor(
    private _router: Router,
    private _paymentPeriodsService: PaymentPeriodsService,
    private _sessionService: SessionService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Obtiene el identificador del usuario activo desde la sesión.
   */
  get currentUserId(): string {
    return this._sessionService.getIdentity()?.usr_uuid || '';
  }

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    this.loadPayments();
  }

  /**
   * Carga la lista de pagos de períodos desde el servicio de backend.
   * @returns void
   */
  loadPayments(): void {
    const usr_uuid = this.currentUserId;
    if (!usr_uuid) {
      this.payments = [];
      this.total = 0;
      this.loading = false;
      return;
    }
    this.loading = true;
    this._paymentPeriodsService.getPaymentPeriods(usr_uuid, '1', '1').subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.payments = response.data;
          this.total = this.payments.length;
          this.loading = false;
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
   * Formatea una cadena de fecha y hora ISO como `DD/MM/YYYY HH:mm`.
   * @param dateTimeString Cadena de fecha y hora ISO.
   * @returns Cadena de fecha y hora formateada.
   */
  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  /**
   * Formatea una cadena de fecha ISO como `DD/MM/YYYY`.
   * @param dateString Cadena de fecha ISO.
   * @returns Cadena de fecha formateada.
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formatea una cadena de monto como una cadena de moneda en Pesos Argentinos.
   * @param amount Cadena de monto numérico.
   * @returns Cadena de moneda formateada.
   */
  formatAmount(amount: string): string {
    const amountNum = parseFloat(amount);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amountNum);
  }

  /**
   * Devuelve el color de etiqueta de Ng-Zorro para un nombre de método de pago.
   * @param methodName Nombre del método de pago.
   * @returns Cadena con el color de la etiqueta.
   */
  getMethodColor(methodName: string): string {
    switch (methodName.toLowerCase()) {
      case 'banco': return 'blue';
      case 'transferencia': return 'geekblue';
      case 'rapipago': return 'gold';
      case 'mercado pago': return 'volcano';
      case 'pago fácil': return 'orange';
      default: return 'default';
    }
  }

  /**
   * Devuelve el nombre del ícono de Ng-Zorro para un nombre de método de pago.
   * @param methodName Nombre del método de pago.
   * @returns Cadena con el nombre del ícono.
   */
  getMethodIcon(methodName: string): string {
    switch (methodName.toLowerCase()) {
      case 'banco': return 'bank';
      case 'transferencia': return 'swap';
      case 'rapipago': return 'barcode';
      case 'mercado pago': return 'wallet';
      case 'pago fácil': return 'barcode';
      default: return 'credit-card';
    }
  }

  /**
   * Formatea un nombre de método de pago sin procesar a formato de título.
   * @param name Nombre del método de pago sin procesar.
   * @returns Nombre del método de pago formateado.
   */
  formatMethodName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Devuelve el color de estado de insignia de Ng-Zorro para un nombre de estado de pago.
   * @param statusName Nombre del estado de pago.
   * @returns Cadena con el color de estado de la insignia.
   */
  getStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'procesado': return 'processing';
      case 'rechazado': return 'error';
      default: return 'default';
    }
  }

  /**
   * Devuelve el nombre del ícono de Ng-Zorro para un nombre de estado de pago.
   * @param statusName Nombre del estado de pago.
   * @returns Cadena con el nombre del ícono.
   */
  getStatusIcon(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'check-circle';
      case 'procesado': return 'sync';
      case 'rechazado': return 'close-circle';
      default: return 'info-circle';
    }
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
   * Navega al formulario de creación de pago de período.
   * @returns void
   */
  createPayment(): void {
    this._router.navigate(['/admin/user/payment-period/new']);
  }

  /**
   * Navega al formulario de edición de pago de período.
   * @param payment Registro de pago de período a editar.
   * @returns void
   */
  editPayment(payment: PaymentPeriodInterface): void {
    this._router.navigate(['/admin/user/payment-period/edit', payment.crd_uuid, payment.per_uuid, payment.payp_uuid]);
  }

  /**
   * Solicita confirmación y elimina un registro de pago de período.
   * @param payment Registro de pago de período a eliminar.
   * @returns void
   */
  deletePayment(payment: PaymentPeriodInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este pago?',
      `Vas a eliminar el pago realizado el ${this.formatDateTime(payment.payp_paymentdate)} por un monto de ${this.formatAmount(payment.payp_amountpaid)}. Esta acción no se puede deshacer.`,
      () => {
        this.loading = true;
        this._paymentPeriodsService.deletePaymentPeriod(payment.usr_uuid, payment.crd_uuid, payment.per_uuid, payment.payp_uuid).subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this._messageService.success('Pago eliminado', 'El pago se eliminó correctamente del período');
              this.loadPayments();
            } else {
              this._messageService.error('Error', response.message || 'No se pudo eliminar el pago');
            }
          },
          error: (error: any) => {
            this.loading = false;
            console.error(error);
            this._messageService.error('Error', 'Hubo un problema de conexión al eliminar el pago');
          }
        });
      }
    );
  }

  /**
   * Muestra una notificación emergente con los detalles del pago.
   * @param payment Registro de pago de período a inspeccionar.
   * @returns void
   */
  viewDetails(payment: PaymentPeriodInterface): void {
    this.message.info(`Detalles del pago: ${payment.payp_uuid}`);
  }

  /**
   * Marca un pago como confirmado en la interfaz de usuario.
   * @param payment Registro de pago de período a confirmar.
   * @returns void
   */
  confirmPayment(payment: PaymentPeriodInterface): void {
    payment.payps.payps_name = 'confirmado';
    this.message.success('Pago confirmado correctamente');
  }

  /**
   * Marca un pago como rechazado en la interfaz de usuario.
   * @param payment Registro de pago de período a rechazar.
   * @returns void
   */
  rejectPayment(payment: PaymentPeriodInterface): void {
    payment.payps.payps_name = 'rechazado';
    this.message.error('Pago rechazado');
  }

  /**
   * Maneja los cambios en el tamaño de página de la tabla.
   * @param size Nuevo tamaño de página.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPayments();
  }

  /**
   * Maneja los cambios en el índice de página de la tabla.
   * @param index Nuevo índice de página.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPayments();
  }
}