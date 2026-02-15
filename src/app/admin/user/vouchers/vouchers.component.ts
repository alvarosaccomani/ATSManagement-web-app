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
import { VoucherInterface } from '../../../core/interfaces/voucher';
import { VouchersService } from '../../../core/services/vouchers.service';

@Component({
  selector: 'app-vouchers',
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
  templateUrl: './vouchers.component.html',
  styleUrl: './vouchers.component.scss'
})
export class VouchersComponent implements OnInit {
  vouchers: VoucherInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'vou_uuid', title: 'ID', width: '80px' },
    { key: 'transaction', title: 'Transacción', width: '140px' },
    { key: 'datetime', title: 'Fecha/Hora', width: '140px' },
    { key: 'amount', title: 'Monto', width: '120px' },
    { key: 'commerce', title: 'Comercio', width: '180px' },
    { key: 'operation_type', title: 'Tipo', width: '110px' },
    { key: 'installments', title: 'Cuotas', width: '100px' },
    { key: 'status', title: 'Estado', width: '110px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(
    private _router: Router,
    private _vouchersService: VouchersService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.loading = true;
    this._vouchersService.getVouchers('7a067c90-bf5b-45d1-8f07-91b578e2d54d', '1', '1').subscribe(
      (response: any) => {
        if(response.success) {
          console.info(response.data);
          this.vouchers = response.data;
          this.total = this.vouchers.length;
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

  // Formatear monto
  formatAmount(amount: string, currency: string): string {
    const amountNum = parseFloat(amount);
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amountNum);
  }

  // Obtener color del tag según el tipo de operación
  getOperationTypeColor(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'compra': return 'green';
      case 'devolucion': return 'red';
      case 'extraccion': return 'orange';
      case 'pago_servicio': return 'blue';
      default: return 'default';
    }
  }

  // Obtener icono según el tipo de operación
  getOperationTypeIcon(typeName: string): string {
    switch (typeName.toLowerCase()) {
      case 'compra': return 'shopping-cart';
      case 'devolucion': return 'rollback';
      case 'extraccion': return 'bank';
      case 'pago_servicio': return 'pay-circle';
      default: return 'transaction';
    }
  }

  // Formatear nombre del tipo de operación
  formatOperationTypeName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  // Obtener color del tag según el estado del voucher
  getVoucherStatusColor(statusName: string): string {
    switch (statusName.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'pendiente': return 'processing';
      case 'rechazado': return 'error';
      case 'anulado': return 'default';
      default: return 'default';
    }
  }

  // Formatear nombre del estado
  formatVoucherStatusName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  // Formatear información de cuotas
  formatInstallments(voucher: VoucherInterface): string {
    if (!voucher.vou_installments) {
      return 'Contado';
    }
    const count = voucher.vou_installmentcount;
    const interest = parseFloat(voucher.vou_installmentinterest);
    return `${count} cuota${count > 1 ? 's' : ''}${interest > 0 ? ' + interés' : ''}`;
  }

  // Métodos de acción
  createVoucher(): void {
    this._router.navigate(['/admin/user/voucher/new']);
  }

  editVoucher(voucher: VoucherInterface): void {
    this._router.navigate(['/admin/user/voucher/edit', voucher.vou_uuid]);
  }

  deleteVoucher(voucher: VoucherInterface): void {
    this.message.success(`Voucher eliminado: ${voucher.vou_transactionnumber}`);
    this.vouchers = this.vouchers.filter(v => v.vou_uuid !== voucher.vou_uuid);
    this.total = this.vouchers.length;
  }

  viewDetails(voucher: VoucherInterface): void {
    this.message.info(`Detalles del voucher: ${voucher.vou_transactionnumber}`);
  }

  confirmVoucher(voucher: VoucherInterface): void {
    voucher.vous.vous_name = 'confirmado';
    this.message.success('Voucher confirmado correctamente');
  }

  rejectVoucher(voucher: VoucherInterface): void {
    voucher.vous.vous_name = 'rechazado';
    this.message.error('Voucher rechazado');
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadVouchers();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadVouchers();
  }
}
