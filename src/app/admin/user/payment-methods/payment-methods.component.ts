import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PaymentMethodInterface } from '../../../core/interfaces/payment-method.interface';

@Component({
  selector: 'app-payment-methods',
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
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.scss'
})
export class PaymentMethodsComponent implements OnInit {
  paymentMethods: PaymentMethodInterface[] = [];
  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  listOfColumns = [
    { key: 'paym_uuid', title: 'ID', width: '80px' },
    { key: 'paym_name', title: 'Nombre', width: '160px' },
    { key: 'paym_description', title: 'Descripción', width: '250px' },
    { key: 'paym_createdat', title: 'Creado', width: '180px' },
    { key: 'paym_updatedat', title: 'Actualizado', width: '180px' },
    { key: 'action', title: 'Acciones', width: '180px' }
  ];

  constructor(private message: NzMessageService) {}

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.paymentMethods = [
        {
          paym_uuid: "1",
          paym_name: "Banco",
          paym_description: null,
          paym_createdat: "2026-02-10T21:36:37-03:00",
          paym_updatedat: "2026-02-10T21:36:37-03:00"
        },
        {
          paym_uuid: "3",
          paym_name: "Rapipago",
          paym_description: null,
          paym_createdat: "2026-02-10T21:36:37-03:00",
          paym_updatedat: "2026-02-10T21:36:37-03:00"
        },
        {
          paym_uuid: "2",
          paym_name: "Transferencia",
          paym_description: null,
          paym_createdat: "2026-02-10T21:36:37-03:00",
          paym_updatedat: "2026-02-10T21:36:37-03:00"
        },
        {
          paym_uuid: "4",
          paym_name: "Mercado Pago",
          paym_description: "Pago a través de Mercado Pago",
          paym_createdat: "2026-02-10T22:15:00-03:00",
          paym_updatedat: "2026-02-10T22:15:00-03:00"
        },
        {
          paym_uuid: "5",
          paym_name: "Pago Fácil",
          paym_description: null,
          paym_createdat: "2026-02-10T22:20:00-03:00",
          paym_updatedat: "2026-02-10T22:20:00-03:00"
        }
      ];
      
      this.total = this.paymentMethods.length;
      this.loading = false;
    }, 800);
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

  // Métodos de acción
  createPaymentMethod(): void {
    this.message.info('Crear nuevo método de pago');
  }

  editPaymentMethod(method: PaymentMethodInterface): void {
    this.message.info(`Editar método: ${this.formatMethodName(method.paym_name)}`);
  }

  deletePaymentMethod(method: PaymentMethodInterface): void {
    this.message.success(`Método eliminado: ${this.formatMethodName(method.paym_name)}`);
    this.paymentMethods = this.paymentMethods.filter(m => m.paym_uuid !== method.paym_uuid);
    this.total = this.paymentMethods.length;
  }

  viewDetails(method: PaymentMethodInterface): void {
    this.message.info(`Detalles de: ${this.formatMethodName(method.paym_name)}`);
  }

  // Paginación
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadPaymentMethods();
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadPaymentMethods();
  }
}