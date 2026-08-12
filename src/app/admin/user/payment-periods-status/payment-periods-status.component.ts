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
  paymentPeriodStatuses: PaymentPeriodStatusInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'payps_uuid', title: 'ID', width: '80px' },
    { key: 'payps_name', title: 'Nombre', width: '150px' },
    { key: 'payps_description', title: 'Descripción', width: '250px' },
    { key: 'payps_createdat', title: 'Creado', width: '180px' },
    { key: 'payps_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(
    private _router: Router,
    private _paymentPeriodsStatusService: PaymentPeriodsStatusService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPaymentPeriodStatuses();
  }

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

  // Obtener color del tag según el estado del período de pago
  getStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'procesado': return 'processing';
      case 'rechazado': return 'error';
      default: return 'default';
    }
  }

  // Obtener icono según el estado del período de pago
  getStatusIcon(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'check-circle';
      case 'procesado': return 'sync';
      case 'rechazado': return 'close-circle';
      default: return 'info-circle';
    }
  }

  // Formatear nombre del estado
  formatStatusName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Métodos de acción
  createPaymentPeriodStatus(): void {
    this._router.navigate(['/admin/user/payment-period-status/new']);
  }

  editPaymentPeriodStatus(status: PaymentPeriodStatusInterface): void {
    this._router.navigate(['/admin/user/payment-period-status/edit', status.payps_uuid]);
  }

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

  viewDetails(status: PaymentPeriodStatusInterface): void {
    this.message.info(`Nombre: ${this.formatStatusName(status.payps_name)}\nDescripción: ${status.payps_description || 'Sin descripción'}`);
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPaymentPeriodStatuses();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPaymentPeriodStatuses();
  }
}