import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PaymentPeriodStatusInterface } from '../../../core/interfaces/payment-period-status.interface';

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

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    this.loadPaymentPeriodStatuses();
  }

  loadPaymentPeriodStatuses(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.paymentPeriodStatuses = [
        {
          payps_uuid: "2",
          payps_name: "confirmado",
          payps_description: null,
          payps_createdat: "2026-02-10T20:40:03-03:00",
          payps_updatedat: "2026-02-10T20:40:03-03:00"
        },
        {
          payps_uuid: "1",
          payps_name: "procesado",
          payps_description: null,
          payps_createdat: "2026-02-10T20:40:03-03:00",
          payps_updatedat: "2026-02-10T20:40:03-03:00"
        },
        {
          payps_uuid: "3",
          payps_name: "rechazado",
          payps_description: null,
          payps_createdat: "2026-02-10T20:40:03-03:00",
          payps_updatedat: "2026-02-10T20:40:03-03:00"
        }
      ];
      
      this.total = this.paymentPeriodStatuses.length;
      this.loading = false;
    }, 800);
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
    this.message.info('Crear nuevo estado de período de pago');
  }

  editPaymentPeriodStatus(status: PaymentPeriodStatusInterface): void {
    this.message.info(`Editar estado: ${this.formatStatusName(status.payps_name)}`);
  }

  deletePaymentPeriodStatus(status: PaymentPeriodStatusInterface): void {
    this.message.success(`Estado eliminado: ${this.formatStatusName(status.payps_name)}`);
    this.paymentPeriodStatuses = this.paymentPeriodStatuses.filter(s => s.payps_uuid !== status.payps_uuid);
    this.total = this.paymentPeriodStatuses.length;
  }

  viewDetails(status: PaymentPeriodStatusInterface): void {
    this.message.info(`Detalles de: ${this.formatStatusName(status.payps_name)}`);
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