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
import { MessageService } from '../../../core/services/message.service';

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

  constructor(
    private _router: Router,
    private _paymentPeriodsService: PaymentPeriodsService,
    private message: NzMessageService,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this._paymentPeriodsService.getPaymentPeriods('7a067c90-bf5b-45d1-8f07-91b578e2d54d', '1', '1').subscribe(
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
    this._router.navigate(['/admin/user/payment-period/new']);
  }

  editPayment(payment: PaymentPeriodInterface): void {
    this._router.navigate(['/admin/user/payment-period/edit', payment.payp_uuid]);
  }

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