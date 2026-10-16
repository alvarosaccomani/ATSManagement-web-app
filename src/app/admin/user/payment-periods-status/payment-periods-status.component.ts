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
import { PaymentPeriodStatusInterface } from '../../../core/interfaces/payment-period-status';
import { PaymentPeriodsStatusService } from '../../../core/services/payment-periods-status.service';
import { MessageService } from '../../../core/services/message.service';

/**
 * Componente para listar y gestionar registros de estados de período de pago.
 * @description Muestra una tabla paginada de estados de período de pago con insignias de estado, íconos y acciones CRUD.
 */
@Component({
  selector: 'app-payment-periods-status',
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
  templateUrl: './payment-periods-status.component.html',
  styleUrl: './payment-periods-status.component.scss'
})
export class PaymentPeriodsStatusComponent implements OnInit {
  /** Arreglo de registros de estados de período de pago cargados. */
  paymentPeriodStatuses: PaymentPeriodStatusInterface[] = [];
  /** Indicador de si los datos de la tabla se están cargando. */
  loading = false;
  /** Índice de la página actual (basado en 1). */
  pageIndex = 1;
  /** Cantidad de filas por página. */
  pageSize = 10;
  /** Cantidad total de registros de estados de período de pago. */
  total = 0;

  /** Definiciones de las columnas de la tabla. */
  listOfColumns = [
    { key: 'payps_uuid', title: 'ID', width: '80px' },
    { key: 'payps_name', title: 'Nombre', width: '150px' },
    { key: 'payps_description', title: 'Descripción', width: '250px' },
    { key: 'payps_createdat', title: 'Creado', width: '180px' },
    { key: 'payps_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  /**
   * Inicializa el componente PaymentPeriodsStatusComponent.
   * @param _router Servicio Router de Angular.
   * @param _paymentPeriodsStatusService Servicio para operaciones CRUD de estados de período de pago.
   * @param message Servicio de mensajes emergentes de Ng-Zorro.
   * @param _messageService Servicio personalizado de alertas modales.
   */
  constructor(
    private _router: Router,
    private _paymentPeriodsStatusService: PaymentPeriodsStatusService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  /**
   * Gancho del ciclo de vida ejecutado al inicializar el componente.
   * @returns void
   */
  ngOnInit(): void {
    this.loadPaymentPeriodStatuses();
  }

  /**
   * Carga la lista de estados de período de pago desde el servicio de backend.
   * @returns void
   */
  loadPaymentPeriodStatuses(): void {
    this.loading = true;
    this._paymentPeriodsStatusService.getPaymentPeriodsStatus().subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.paymentPeriodStatuses = response.data;
          this.total = this.paymentPeriodStatuses.length;
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
   * Devuelve el color de estado de insignia de Ng-Zorro para un nombre de estado de período de pago.
   * @param statusName Nombre del estado de período de pago.
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
   * Devuelve el nombre del ícono de Ng-Zorro para un nombre de estado de período de pago.
   * @param statusName Nombre del estado de período de pago.
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
   * Navega al formulario de creación de estado de período de pago.
   * @returns void
   */
  createPaymentPeriodStatus(): void {
    this._router.navigate(['/admin/user/payment-period-status/new']);
  }

  /**
   * Navega al formulario de edición de estado de período de pago.
   * @param status Registro de estado de período de pago a editar.
   * @returns void
   */
  editPaymentPeriodStatus(status: PaymentPeriodStatusInterface): void {
    this._router.navigate(['/admin/user/payment-period-status/edit', status.payps_uuid]);
  }

  /**
   * Solicita confirmación y elimina un registro de estado de período de pago.
   * @param status Registro de estado de período de pago a eliminar.
   * @returns void
   */
  deletePaymentPeriodStatus(status: PaymentPeriodStatusInterface): void {
    this._messageService.confirm(
      '¿Estás seguro de eliminar este estado de período de pago?',
      `Estás a punto de eliminar el estado de período de pago "${this.formatStatusName(status.payps_name)}". Esta acción no se puede deshacer.`,
      () => {
        this._paymentPeriodsStatusService.deletePaymentPeriodStatus(status.payps_uuid).subscribe({
          next: (response: any) => {
            if(response.success) {
              this._messageService.success('Estado eliminado', `El estado de período de pago "${this.formatStatusName(status.payps_name)}" se eliminó correctamente`);
              this.loadPaymentPeriodStatuses();
            } else {
              this._messageService.error('Error', response.message || 'Error al eliminar el estado');
            }
          },
          error: (error: any) => {
            console.error(error);
            this._messageService.error('Error', 'Error de conexión al intentar eliminar el estado');
          }
        });
      }
    );
  }

  /**
   * Muestra una notificación emergente con los detalles del estado de período de pago.
   * @param status Registro de estado de período de pago a inspeccionar.
   * @returns void
   */
  viewDetails(status: PaymentPeriodStatusInterface): void {
    this.message.info(`Nombre: ${this.formatStatusName(status.payps_name)}\nDescripción: ${status.payps_description || 'Sin descripción'}`);
  }

  /**
   * Maneja los cambios en el tamaño de página de la tabla.
   * @param size Nuevo tamaño de página.
   * @returns void
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPaymentPeriodStatuses();
  }

  /**
   * Maneja los cambios en el índice de página de la tabla.
   * @param index Nuevo índice de página.
   * @returns void
   */
  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPaymentPeriodStatuses();
  }
}