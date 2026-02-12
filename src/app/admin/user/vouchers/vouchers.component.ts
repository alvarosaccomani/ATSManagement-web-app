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
import { VoucherInterface } from '../../../core/interfaces/voucher.interface';

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
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.vouchers = [
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "1",
          vou_uuid: "1",
          vou_authorizationnumber: "AUTH123456",
          vou_transactionnumber: "TXN789012",
          vou_datetime: "2026-02-08T17:56:35-03:00",
          vou_amount: "20000.00",
          vou_currency: "ARS",
          vou_commercename: "Supermercado Prueba",
          vou_commercecuit: "111111111",
          vou_commercecategory: "Supermercados",
          tyop_uuid: "1",
          tyop: {
            tyop_uuid: "1",
            tyop_name: "compra",
            tyop_description: null,
            tyop_createdat: "2026-02-08T20:24:54.922Z",
            tyop_updatedat: "2026-02-08T20:24:54.922Z"
          },
          vou_installments: false,
          vou_installmentcount: 1,
          vou_installmentinterest: "0.00",
          vou_poscode: "POS001",
          vou_reference: "REF123",
          vous_uuid: "1",
          vous: {
            vous_uuid: "1",
            vous_name: "confirmado",
            vous_description: null,
            vous_createdat: "2026-02-08T20:56:04.839Z",
            vous_updatedat: "2026-02-08T20:56:04.839Z"
          },
          vou_image: null,
          vou_notes: null,
          vou_createdat: "2026-02-08T17:56:35-03:00",
          vou_updatedat: "2026-02-08T17:56:35-03:00"
        },
        {
          usr_uuid: "7a067c90-bf5b-45d1-8f07-91b578e2d54d",
          crd_uuid: "1",
          per_uuid: "1",
          vou_uuid: "2",
          vou_authorizationnumber: "AUTH123457",
          vou_transactionnumber: "TXN789013",
          vou_datetime: "2026-02-08T18:30:22-03:00",
          vou_amount: "45000.00",
          vou_currency: "ARS",
          vou_commercename: "Electrodomésticos XYZ",
          vou_commercecuit: "222222222",
          vou_commercecategory: "Electrónica",
          tyop_uuid: "1",
          tyop: {
            tyop_uuid: "1",
            tyop_name: "compra",
            tyop_description: null,
            tyop_createdat: "2026-02-08T20:24:54.922Z",
            tyop_updatedat: "2026-02-08T20:24:54.922Z"
          },
          vou_installments: true,
          vou_installmentcount: 6,
          vou_installmentinterest: "1500.00",
          vou_poscode: "POS002",
          vou_reference: "REF124",
          vous_uuid: "1",
          vous: {
            vous_uuid: "1",
            vous_name: "confirmado",
            vous_description: null,
            vous_createdat: "2026-02-08T20:56:04.839Z",
            vous_updatedat: "2026-02-08T20:56:04.839Z"
          },
          vou_image: null,
          vou_notes: "Compra en 6 cuotas",
          vou_createdat: "2026-02-08T18:30:22-03:00",
          vou_updatedat: "2026-02-08T18:30:22-03:00"
        },
        {
          usr_uuid: "8b178d01-c06c-56e2-9f18-02c689f3e65e",
          crd_uuid: "2",
          per_uuid: "2",
          vou_uuid: "3",
          vou_authorizationnumber: "AUTH123458",
          vou_transactionnumber: "TXN789014",
          vou_datetime: "2026-02-08T19:15:45-03:00",
          vou_amount: "8500.00",
          vou_currency: "ARS",
          vou_commercename: "Farmacia Salud",
          vou_commercecuit: "333333333",
          vou_commercecategory: "Farmacia",
          tyop_uuid: "1",
          tyop: {
            tyop_uuid: "1",
            tyop_name: "compra",
            tyop_description: null,
            tyop_createdat: "2026-02-08T20:24:54.922Z",
            tyop_updatedat: "2026-02-08T20:24:54.922Z"
          },
          vou_installments: false,
          vou_installmentcount: 1,
          vou_installmentinterest: "0.00",
          vou_poscode: "POS003",
          vou_reference: "REF125",
          vous_uuid: "2",
          vous: {
            vous_uuid: "2",
            vous_name: "pendiente",
            vous_description: null,
            vous_createdat: "2026-02-08T20:56:04.839Z",
            vous_updatedat: "2026-02-08T20:56:04.839Z"
          },
          vou_image: null,
          vou_notes: null,
          vou_createdat: "2026-02-08T19:15:45-03:00",
          vou_updatedat: "2026-02-08T19:15:45-03:00"
        },
        {
          usr_uuid: "9c289e12-d17d-67f3-0g29-13d790g4f76f",
          crd_uuid: "3",
          per_uuid: "3",
          vou_uuid: "4",
          vou_authorizationnumber: "AUTH123459",
          vou_transactionnumber: "TXN789015",
          vou_datetime: "2026-02-08T20:05:10-03:00",
          vou_amount: "150000.00",
          vou_currency: "ARS",
          vou_commercename: "Viajes Mundo",
          vou_commercecuit: "444444444",
          vou_commercecategory: "Turismo",
          tyop_uuid: "1",
          tyop: {
            tyop_uuid: "1",
            tyop_name: "compra",
            tyop_description: null,
            tyop_createdat: "2026-02-08T20:24:54.922Z",
            tyop_updatedat: "2026-02-08T20:24:54.922Z"
          },
          vou_installments: true,
          vou_installmentcount: 12,
          vou_installmentinterest: "18000.00",
          vou_poscode: "POS004",
          vou_reference: "REF126",
          vous_uuid: "3",
          vous: {
            vous_uuid: "3",
            vous_name: "rechazado",
            vous_description: null,
            vous_createdat: "2026-02-08T20:56:04.839Z",
            vous_updatedat: "2026-02-08T20:56:04.839Z"
          },
          vou_image: null,
          vou_notes: "Compra en 12 cuotas con interés",
          vou_createdat: "2026-02-08T20:05:10-03:00",
          vou_updatedat: "2026-02-08T20:05:10-03:00"
        },
        {
          usr_uuid: "0d390f23-e28e-78g4-1h30-24e801h5g87g",
          crd_uuid: "4",
          per_uuid: "4",
          vou_uuid: "5",
          vou_authorizationnumber: "AUTH123460",
          vou_transactionnumber: "TXN789016",
          vou_datetime: "2026-02-08T21:30:00-03:00",
          vou_amount: "5000.00",
          vou_currency: "ARS",
          vou_commercename: "Restaurante Gourmet",
          vou_commercecuit: "555555555",
          vou_commercecategory: "Restaurantes",
          tyop_uuid: "2",
          tyop: {
            tyop_uuid: "2",
            tyop_name: "devolucion",
            tyop_description: null,
            tyop_createdat: "2026-02-08T20:24:54.922Z",
            tyop_updatedat: "2026-02-08T20:24:54.922Z"
          },
          vou_installments: false,
          vou_installmentcount: 1,
          vou_installmentinterest: "0.00",
          vou_poscode: "POS005",
          vou_reference: "REF127",
          vous_uuid: "1",
          vous: {
            vous_uuid: "1",
            vous_name: "confirmado",
            vous_description: null,
            vous_createdat: "2026-02-08T20:56:04.839Z",
            vous_updatedat: "2026-02-08T20:56:04.839Z"
          },
          vou_image: null,
          vou_notes: "Devolución de compra",
          vou_createdat: "2026-02-08T21:30:00-03:00",
          vou_updatedat: "2026-02-08T21:30:00-03:00"
        }
      ];
      
      this.total = this.vouchers.length;
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
