import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PaymentPeriodInterface } from '../../../core/interfaces/payment-period.interface';

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
  payments: PaymentPeriodInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

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

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.payments = [
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "1",
          payp_uuid: "1",
          payp_paymentdate: "2026-02-10T21:59:22-03:00",
          payp_amountpaid: "100.00",
          paym_uuid: "1",
          paym: {
            paym_uuid: "1",
            paym_name: "Banco",
            paym_description: null,
            paym_createdat: "2026-02-11T00:36:37.979Z",
            paym_updatedat: "2026-02-11T00:36:37.979Z"
          },
          payp_paymentreference: "REF-BANCO-001",
          payps_uuid: "1",
          payps: {
            payps_uuid: "1",
            payps_name: "procesado",
            payps_description: null,
            payps_createdat: "2026-02-10T23:40:03.401Z",
            payps_updatedat: "2026-02-10T23:40:03.401Z"
          },
          payp_createdat: "2026-02-10T21:59:22-03:00",
          payp_updatedat: "2026-02-10T21:59:22-03:00"
        },
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "2",
          payp_uuid: "2",
          payp_paymentdate: "2026-02-09T15:30:00-03:00",
          payp_amountpaid: "45000.00",
          paym_uuid: "2",
          paym: {
            paym_uuid: "2",
            paym_name: "Transferencia",
            paym_description: null,
            paym_createdat: "2026-02-11T00:36:37.979Z",
            paym_updatedat: "2026-02-11T00:36:37.979Z"
          },
          payp_paymentreference: "TRF-20260209-001",
          payps_uuid: "2",
          payps: {
            payps_uuid: "2",
            payps_name: "confirmado",
            payps_description: null,
            payps_createdat: "2026-02-10T23:40:03.401Z",
            payps_updatedat: "2026-02-10T23:40:03.401Z"
          },
          payp_createdat: "2026-02-09T15:30:00-03:00",
          payp_updatedat: "2026-02-09T16:00:00-03:00"
        },
        {
          usr_uuid: "8b178d01-c06c-56e2-9f18-02c689f3e65e",
          crd_uuid: "2",
          per_uuid: "1",
          payp_uuid: "3",
          payp_paymentdate: "2026-02-08T18:45:30-03:00",
          payp_amountpaid: "25000.00",
          paym_uuid: "3",
          paym: {
            paym_uuid: "3",
            paym_name: "Rapipago",
            paym_description: null,
            paym_createdat: "2026-02-11T00:36:37.979Z",
            paym_updatedat: "2026-02-11T00:36:37.979Z"
          },
          payp_paymentreference: "RPI-78901234",
          payps_uuid: "2",
          payps: {
            payps_uuid: "2",
            payps_name: "confirmado",
            payps_description: null,
            payps_createdat: "2026-02-10T23:40:03.401Z",
            payps_updatedat: "2026-02-10T23:40:03.401Z"
          },
          payp_createdat: "2026-02-08T18:45:30-03:00",
          payp_updatedat: "2026-02-08T18:45:30-03:00"
        },
        {
          usr_uuid: "9c289e12-d17d-67f3-0g29-13d790g4f76f",
          crd_uuid: "3",
          per_uuid: "2",
          payp_uuid: "4",
          payp_paymentdate: "2026-02-07T10:15:00-03:00",
          payp_amountpaid: "78500.00",
          paym_uuid: "4",
          paym: {
            paym_uuid: "4",
            paym_name: "Mercado Pago",
            paym_description: "Pago a través de Mercado Pago",
            paym_createdat: "2026-02-11T00:36:37.979Z",
            paym_updatedat: "2026-02-11T00:36:37.979Z"
          },
          payp_paymentreference: "MP-AR-123456789",
          payps_uuid: "3",
          payps: {
            payps_uuid: "3",
            payps_name: "rechazado",
            payps_description: null,
            payps_createdat: "2026-02-10T23:40:03.401Z",
            payps_updatedat: "2026-02-10T23:40:03.401Z"
          },
          payp_createdat: "2026-02-07T10:15:00-03:00",
          payp_updatedat: "2026-02-07T10:20:00-03:00"
        },
        {
          usr_uuid: "0d390f23-e28e-78g4-1h30-24e801h5g87g",
          crd_uuid: "4",
          per_uuid: "3",
          payp_uuid: "5",
          payp_paymentdate: "2026-02-11T09:30:00-03:00",
          payp_amountpaid: "15000.00",
          paym_uuid: "5",
          paym: {
            paym_uuid: "5",
            paym_name: "Pago Fácil",
            paym_description: null,
            paym_createdat: "2026-02-11T00:36:37.979Z",
            paym_updatedat: "2026-02-11T00:36:37.979Z"
          },
          payp_paymentreference: "PF-987654321",
          payps_uuid: "1",
          payps: {
            payps_uuid: "1",
            payps_name: "procesado",
            payps_description: null,
            payps_createdat: "2026-02-10T23:40:03.401Z",
            payps_updatedat: "2026-02-10T23:40:03.401Z"
          },
          payp_createdat: "2026-02-11T09:30:00-03:00",
          payp_updatedat: "2026-02-11T09:30:00-03:00"
        }
      ];
      
      this.total = this.payments.length;
      this.loading = false;
    }, 800);
  }

  // Formatear fecha y hora
  formatDateTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // Formatear solo fecha
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Formatear monto
  formatAmount(amount: string): string {
    const amountNum = parseFloat(amount);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amountNum);
  }

  // Obtener color del tag según el método de pago
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

  // Obtener icono según el método de pago
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

  // Formatear nombre del método de pago
  formatMethodName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  // Obtener color del tag según el estado del pago
  getStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'procesado': return 'processing';
      case 'rechazado': return 'error';
      default: return 'default';
    }
  }

  // Obtener icono según el estado del pago
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
  createPayment(): void {
    this.message.info('Registrar nuevo pago');
  }

  editPayment(payment: PaymentPeriodInterface): void {
    this.message.info(`Editar pago: ${payment.payp_uuid}`);
  }

  deletePayment(payment: PaymentPeriodInterface): void {
    this.message.success(`Pago eliminado: ${payment.payp_uuid}`);
    this.payments = this.payments.filter(p => p.payp_uuid !== payment.payp_uuid);
    this.total = this.payments.length;
  }

  viewDetails(payment: PaymentPeriodInterface): void {
    this.message.info(`Detalles del pago: ${payment.payp_uuid}`);
  }

  confirmPayment(payment: PaymentPeriodInterface): void {
    payment.payps.payps_name = 'confirmado';
    this.message.success('Pago confirmado correctamente');
  }

  rejectPayment(payment: PaymentPeriodInterface): void {
    payment.payps.payps_name = 'rechazado';
    this.message.error('Pago rechazado');
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPayments();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPayments();
  }
}